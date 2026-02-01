import type { Types } from 'mongoose'
import RendezVous from '../../models/rendezvous.model'
import type { CreateRendezVousInput, UpdateRendezVousInput } from './rendezvous.interface'
import Patient from '../../models/patient.model'
import Kine from '../../models/kine.model'
import { CABINET_SCHEDULE, CABINET_OPEN_DAYS } from '../../config/cabinetHours'

interface RendezVousServiceResult {
    success: boolean
    rendezvous?: any
    message?: string
}

export default class RendezVousService {
    async createRendezVous(
        input: CreateRendezVousInput,
        creatorRole?: string, // Optional for backward compatibility, but passed from controller
    ): Promise<RendezVousServiceResult> {
        // 0. RESTRICTION: If Patient, check if they already have an upcoming appointment
        // This prevents the "race condition" where they are on the page while Kine books for them.
        if (creatorRole === 'patient') {
            const existingApps = await RendezVous.countDocuments({
                patientId: input.patientId,
                statut: { $in: ['à venir', 'en attente'] },
                date: { $gte: new Date() },
            })

            if (existingApps > 0) {
                return {
                    success: false,
                    message:
                        "Vous avez déjà un rendez-vous planifié. Veuillez contacter votre kiné pour en ajouter d'autres.",
                }
            }
        }

        // IDs received are PatientID and KineID (Model IDs), NOT UserIDs.
        const patient = await Patient.findById(input.patientId)
        // Robust Kine Lookup: Try KineID first, then UserID
        let kine = await Kine.findById(input.kineId)
        if (!kine && typeof input.kineId === 'string' && input.kineId.length === 24) {
            kine = await Kine.findOne({ userId: input.kineId })
        }

        if (!patient || !kine) {
            return { success: false, message: 'Patient ou kiné introuvable.' }
        }
        // Vérifier horaires d'ouverture
        const debut = new Date(input.date)
        const fin = new Date(debut.getTime() + (input.duree ?? 30) * 60000)
        const day = debut.getDay()
        const heureDebut = debut.getHours() + debut.getMinutes() / 60
        const heureFin = fin.getHours() + fin.getMinutes() / 60

        const schedule = CABINET_SCHEDULE[day]

        if (!schedule?.open) {
            return { success: false, message: 'Le cabinet est fermé ce jour-là.' }
        }

        // Check exact hours
        if (heureDebut < schedule.start || heureFin > schedule.end) {
            return {
                success: false,
                message: `Hors horaires d'ouverture (${schedule.start}h - ${schedule.end}h le ${day === 6 ? 'samedi' : 'semaine'}).`,
            }
        }

        // --- NEW LOGIC START ---
        // 1. Check/Enforce Kine Assignment
        if (patient.kineId) {
            // Patient already has a kine. MUST be the same one.
            if (String(patient.kineId) !== String(kine._id)) {
                return {
                    success: false,
                    message:
                        'Vous avez déjà un kiné assigné. Vous ne pouvez pas prendre rendez-vous avec un autre praticien.',
                }
            }
        } else {
            // 2. First Time Assignment
            // Assign this Kine to the Patient
            patient.kineId = kine._id as any
            await patient.save()

            // 3. Create Blank Treatment Plan
            // Ensure PlanTraitement model is imported at top of file
            const PlanTraitement = (await import('../../models/plantraitement.model')).default
            await PlanTraitement.create({
                duree: 0, // 0 for "indefinite" or "not set"
                objectifs: [],
                statut: 'en cours',
                patientId: patient._id,
                kineId: kine._id,
            })
        }
        // --- NEW LOGIC END ---
        // Vérifier qu'il n'y a pas déjà un RDV à ce créneau pour ce kiné
        // On ignore les RDV annulés car ils ne bloquent plus le créneau
        const conflit = await RendezVous.findOne({
            kineId: kine._id,
            statut: { $ne: 'annulé' }, // Exclure les rendez-vous annulés
            date: {
                $lt: fin,
                $gte: debut,
            },
        })
        if (conflit) {
            return { success: false, message: 'Créneau déjà réservé pour ce kiné.' }
        }
        const rendezvous = await RendezVous.create({
            ...input,
            kineId: kine._id, // Use resolved ID
            duree: input.duree ?? 30,
            statut: input.statut ?? 'en attente',
            paiementEffectue: false,
        })
        return { success: true, message: 'Rendez-vous créé.', rendezvous }
    }

    async getRendezVousByKineAndDate(
        kineId: string,
        date: string,
        options?: { onlyUpcoming?: boolean },
    ): Promise<RendezVousServiceResult> {
        // Chercher tous les RDV d'un kiné à partir d'une date donnée (ex: début de semaine)
        const day = new Date(date)
        const start = new Date(day.setHours(0, 0, 0, 0))

        // On ne limite pas la fin pour permettre au front de récupérer toute la semaine/mois
        const query: any = {
            kineId,
            date: { $gte: start },
        }
        if (options?.onlyUpcoming) {
            query.statut = { $in: ['en attente', 'à venir'] }
        }
        const rendezvous = await RendezVous.find(query).populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'nom prenom email' },
        })
        return { success: true, message: 'Liste des rendez-vous.', rendezvous }
    }

    async getRendezVousByPatient(
        patientId: string,
        options?: { onlyUpcoming?: boolean },
    ): Promise<RendezVousServiceResult> {
        const query: any = { patientId }

        if (options?.onlyUpcoming) {
            // Include 'en attente' as they are active appointments from the patient's perspective
            query.statut = { $in: ['en attente', 'à venir'] }
            query.date = { $gte: new Date() }
        }

        const rendezvous = await RendezVous.find(query)
            .populate({
                path: 'kineId',
                populate: {
                    path: 'userId',
                    select: 'nom prenom email',
                },
            })
            .sort({ date: 1 }) // Sort by nearest date first

        return { success: true, message: 'Liste des rendez-vous patient.', rendezvous }
    }

    async getPatientsByKine(kineId: string): Promise<RendezVousServiceResult> {
        // Liste des patients assignés directement au kiné (Architecture "Dynamic Assignment")
        // Note: Cela retournera les patients DÈS LE PREMIER RDV
        try {
            const patients = await Patient.find({ kineId }).populate({
                path: 'userId',
                select: 'nom prenom email',
            })

            // Enrich patients with Last/Next RDV
            const enrichedPatients = await Promise.all(
                patients.map(async (p: any) => {
                    const now = new Date()

                    // Last completed RDV
                    const lastRdv = await RendezVous.findOne({
                        patientId: p._id,
                        date: { $lt: now },
                        statut: 'terminé',
                    }).sort({ date: -1 })

                    // Next upcoming RDV
                    const nextRdv = await RendezVous.findOne({
                        patientId: p._id,
                        date: { $gte: now },
                        statut: { $in: ['en attente', 'à venir'] },
                    }).sort({ date: 1 })

                    return {
                        ...p.toObject(),
                        lastRdv: lastRdv ? lastRdv.date : null,
                        nextRdv: nextRdv ? nextRdv.date : null,
                    }
                }),
            )

            return {
                success: true,
                message: 'Liste des patients du kiné.',
                rendezvous: enrichedPatients,
            }
        } catch (error) {
            return { success: false, message: 'Erreur lors de la récupération des patients.' }
        }
    }

    async searchPatientsByKine(kineId: string, search: string): Promise<RendezVousServiceResult> {
        // Liste unique des patients ayant eu au moins un RDV avec ce kiné
        const rdvs = await RendezVous.find({ kineId }).populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'nom prenom email' },
        })
        const patientsMap = new Map()
        rdvs.forEach((rdv: any) => {
            if (rdv.patientId) {
                patientsMap.set(String(rdv.patientId._id), rdv.patientId)
            }
        })
        let patients = Array.from(patientsMap.values())
        if (search) {
            const s = search.toLowerCase()
            patients = patients.filter((p: any) => {
                const nom = (p.userId?.nom ?? '').toLowerCase()
                const prenom = (p.userId?.prenom ?? '').toLowerCase()
                return nom.includes(s) || prenom.includes(s)
            })
        }
        return {
            success: true,
            message: 'Résultats de la recherche parmi les patients du kiné.',
            rendezvous: patients,
        }
    }

    async updateRendezVous(
        rdvId: string | Types.ObjectId,
        input: UpdateRendezVousInput,
        modifierRole?: string, // 'patient' | 'kine' | 'admin'
    ): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }

        // --- VALIDATION RULES ---
        if (input.date) {
            const newDate = new Date(input.date)
            const now = new Date()

            // 1. Cannot move to past
            if (newDate < now) {
                return {
                    success: false,
                    message: 'Impossible de déplacer un rendez-vous à une date passée.',
                }
            }

            // 2. Patient Restriction on Confirmed ('à venir') Appointments
            if (modifierRole === 'patient' && rdv.statut === 'à venir') {
                const oldDate = new Date(rdv.date)
                // Check if same day (YYYY-MM-DD)
                const isSameDay =
                    oldDate.getFullYear() === newDate.getFullYear() &&
                    oldDate.getMonth() === newDate.getMonth() &&
                    oldDate.getDate() === newDate.getDate()

                if (!isSameDay) {
                    return {
                        success: false,
                        message:
                            'Un rendez-vous confirmé ne peut être modifié que pour un autre créneau le même jour.',
                    }
                }
            }
        }
        // ------------------------
        // (Optionnel) Vérifier conflits si date/durée changent
        if (input.date ?? input.duree) {
            const debut = input.date ? new Date(input.date) : rdv.date
            const duree = input.duree ?? rdv.duree
            const fin = new Date(debut.getTime() + duree * 60000)
            const conflit = await RendezVous.findOne({
                _id: { $ne: rdvId },
                kineId: rdv.kineId,
                statut: { $ne: 'annulé' }, // Exclure les rendez-vous annulés
                date: {
                    $lt: fin,
                    $gte: debut,
                },
            })
            if (conflit) {
                return { success: false, message: 'Créneau déjà réservé pour ce kiné.' }
            }
        }
        const updated = await RendezVous.findByIdAndUpdate(rdvId, input, { new: true })
        return { success: true, message: 'Rendez-vous mis à jour.', rendezvous: updated }
    }

    async deleteRendezVous(rdvId: string | Types.ObjectId): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé ou déjà supprimé.' }
        }
        await RendezVous.findByIdAndDelete(rdvId)
        return { success: true, message: 'Rendez-vous supprimé.' }
    }

    async confirmRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut !== 'en attente') {
            return { success: false, message: 'Le rendez-vous ne peut pas être confirmé.' }
        }
        rdv.statut = 'à venir'
        rdv.paiementEffectue = true
        await rdv.save()
        return { success: true, message: 'Rendez-vous confirmé.', rendezvous: rdv }
    }

    async completeRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut !== 'à venir') {
            return {
                success: false,
                message: 'Seuls les rendez-vous à venir peuvent être terminés.',
            }
        }
        rdv.statut = 'terminé'
        await rdv.save()
        return { success: true, message: 'Rendez-vous terminé.', rendezvous: rdv }
    }

    async cancelRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut === 'annulé' || rdv.statut === 'terminé') {
            return { success: false, message: 'Le rendez-vous ne peut pas être annulé.' }
        }
        rdv.statut = 'annulé'
        await rdv.save()
        return { success: true, message: 'Rendez-vous annulé.', rendezvous: rdv }
    }

    // Helper pour exposer les horaires d'ouverture au front
    static getCabinetHours(): { openingHour: number; closingHour: number; openDays: number[] } {
        return {
            openingHour: 8, // General start for frontend (min)
            closingHour: 18, // General end for frontend (max)
            openDays: CABINET_OPEN_DAYS,
        }
    }

    async cleanupPastAppointments(kineId: string): Promise<RendezVousServiceResult> {
        const now = new Date()

        // 1. Expire pending requests in the past
        const expired = await RendezVous.updateMany(
            {
                kineId,
                statut: 'en attente',
                date: { $lt: now },
            },
            { statut: 'annulé' },
        )

        // 2. Auto-complete past confirmed appointments
        const completed = await RendezVous.updateMany(
            {
                kineId,
                statut: 'à venir',
                date: { $lt: now },
            },
            { statut: 'terminé' },
        )

        return {
            success: true,
            message: `Cleanup finished. Expired: ${expired.modifiedCount}, Completed: ${completed.modifiedCount}.`,
        }
    }
}
