import User, { RoleEnum } from '../../models/user.model'
import Kine from '../../models/kine.model'
import { hashPassword } from '../../utils/bcrypt'
import { type RegisterKineInput } from '../kine/kine.interface'

export default class AdminService {
    async registerKine(input: RegisterKineInput, role: string): Promise<any> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès réservé aux admins.' }
        }
        // 1. Vérifier que l'email n'existe pas déjà
        const existingUser = await User.findOne({ email: input.email })
        if (existingUser) {
            return { success: false, message: 'Email déjà utilisé.' }
        }
        // 2. Créer le User (rôle kine)
        // 2. Créer le User (rôle kine) avec mot de passe aléatoire si non fourni
        const passwordToHash = input.motDePasse || `${Math.random().toString(36).slice(-10)}A1!`
        const hashed = await hashPassword(passwordToHash)
        let user
        try {
            user = await User.create({
                nom: input.nom,
                prenom: input.prenom,
                email: input.email,
                motDePasse: hashed,
                role: RoleEnum.KINE,
            })
            // 3. Créer le Kine
            const kine = await Kine.create({
                userId: user._id,
                specialite: input.specialite,
                numeroRPPS: input.numeroRPPS,
                presentation: input.presentation,
                telephone: input.telephone,
                adresse: input.adresse,
            })

            // 4. Générer le lien d'invitation (Optionnel côté backend, on renvoie surtout le token)
            const token = (await import('../../utils/jwt')).generateToken(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    type: 'setup',
                },
                '7d', // Valide 7 jours
            )

            // URL Frontend (Backup si frontend ne le génère pas)
            const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
            const invitationLink = `${frontendUrl}/setup-account?token=${token}`

            return {
                success: true,
                message: 'Kiné créé avec succès.',
                kine,
                user: {
                    _id: user._id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                },
                token, // Explicit token for frontend usage
                invitationLink,
            }
        } catch (error) {
            if (user) {
                await User.findByIdAndDelete(user._id)
            }
            throw error
        }
    }

    async getAllUsers(role: string): Promise<any> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès réservé aux admins.' }
        }
        const users = await User.find().lean()
        // On retire le mot de passe de chaque utilisateur
        const usersSafe = users.map(({ motDePasse, ...rest }) => rest)
        return { success: true, users: usersSafe }
    }

    async getDashboardStats(role: string): Promise<any> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès réservé aux admins.' }
        }

        try {
            const Patient = (await import('../../models/patient.model')).default
            const RendezVous = (await import('../../models/rendezvous.model')).default
            const Exercise = (await import('../../models/exercise.model')).default

            // 1. Counts
            const kineCount = await Kine.countDocuments()
            const patientCount = await Patient.countDocuments()
            const exerciseCount = await Exercise.countDocuments()

            // 2. Appointments Stats
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const rdvsToday = await RendezVous.countDocuments({
                date: { $gte: today, $lt: tomorrow },
            })

            // Week Stats
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 7)

            const rdvsWeek = await RendezVous.countDocuments({
                date: { $gte: startOfWeek, $lt: endOfWeek },
            })

            // 3. Occupancy Rate (Simplification: Active Slots vs Total Slots defined arbitrary)
            // Let's assume a capacity of 10 appointments per Kine per day
            const dailyCapacity = kineCount * 10
            const weeklyCapacity = dailyCapacity * 5 // 5 working days
            const occupancyRate =
                weeklyCapacity > 0 ? Math.round((rdvsWeek / weeklyCapacity) * 100) : 0

            // 4. Recent Activity
            // Mix of recent Users registered and recent Appointments
            const recentUsers = await User.find()
                .sort({ dateInscription: -1 })
                .limit(3)
                .select('nom prenom dateInscription role')
                .lean()

            const recentRdvs = await RendezVous.find({ statut: 'à venir' })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate({
                    path: 'kineId',
                    populate: { path: 'userId', select: 'nom prenom' },
                })
                .lean()

            // Normalize activity feed
            const activityFeed = [
                ...recentUsers.map((u: any) => ({
                    type: 'user_register',
                    message: `Nouvel utilisateur inscrit: ${String(u.prenom)} ${String(u.nom)} (${String(u.role)})`,
                    date: u.dateInscription,
                })),
                ...recentRdvs.map((r: any) => {
                    const kineName = r.kineId?.userId?.nom
                        ? `Dr. ${String(r.kineId.userId.nom)}`
                        : 'un Kiné'
                    return {
                        type: 'rdv_created',
                        message: `Nouveau RDV programmé avec ${kineName}`,
                        date: r.createdAt,
                    }
                }),
            ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)

            return {
                success: true,
                stats: {
                    kineCount,
                    patientCount,
                    exerciseCount,
                    rdvsToday,
                    rdvsWeek,
                    occupancyRate,
                    recentActivity: activityFeed,
                },
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error getting dashboard stats:', error)
            return { success: false, message: 'Erreur lors de la récupération des statistiques.' }
        }
    }
}
