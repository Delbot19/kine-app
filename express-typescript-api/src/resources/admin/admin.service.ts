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
        const hashed = await hashPassword(input.motDePasse)
        const user = await User.create({
            nom: input.nom,
            prenom: input.prenom,
            email: input.email,
            motDePasse: hashed,
            role: RoleEnum.KINE,
        })
        // 3. Créer le Kine avec le userId du User créé
        const kine = await Kine.create({
            userId: user._id,
            specialite: input.specialite,
            numeroRPPS: input.numeroRPPS,
            presentation: input.presentation,
        })
        // 4. Retourner le résultat dans le style des autres services
        return {
            success: true,
            message: 'Kiné créé.',
            kine,
            user: {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
            },
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
}
