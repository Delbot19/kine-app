import PlanTraitement from '../../models/plantraitement.model'
import type {
    CreatePlanTraitementInput,
    UpdatePlanTraitementInput,
} from './plantraitement.interface'

interface PlanTraitementServiceResult {
    success: boolean
    plan?: any
    plans?: any[]
    message?: string
}

export default class PlanTraitementService {
    async createPlanTraitement(
        input: CreatePlanTraitementInput,
    ): Promise<PlanTraitementServiceResult> {
        const plan = await PlanTraitement.create(input)
        return { success: true, plan }
    }

    async updatePlanTraitement(
        id: string,
        input: UpdatePlanTraitementInput,
    ): Promise<PlanTraitementServiceResult> {
        // 1. Check if status is changing to 'terminé'
        const isCompleting = input.statut === 'terminé'

        const plan = await PlanTraitement.findByIdAndUpdate(id, input, { new: true })
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }

        // 2. If completed, unlink patient from Kiné AND Cancel future appointments
        if (isCompleting) {
            const Patient = (await import('../../models/patient.model')).default
            const RendezVous = (await import('../../models/rendezvous.model')).default

            // Unlink Patient
            await Patient.findByIdAndUpdate(plan.patientId, {
                kineId: null,
                statut: 'termine', // Optional: Update patient status too
            })

            // Cancel future appointments
            await RendezVous.updateMany(
                {
                    patientId: plan.patientId,
                    kineId: plan.kineId,
                    // Removed date filter to catch ALL active/pending appointments regardless of date
                    statut: { $in: ['à venir', 'en attente'] },
                },
                {
                    statut: 'annulé',
                },
            )
        }

        return { success: true, plan }
    }

    async deletePlanTraitement(id: string): Promise<PlanTraitementServiceResult> {
        const plan = await PlanTraitement.findByIdAndDelete(id)
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, message: 'Plan de traitement supprimé.' }
    }

    async getPlanTraitementById(id: string): Promise<PlanTraitementServiceResult> {
        const plan = await PlanTraitement.findById(id)
            .populate({
                path: 'kineId',
                populate: { path: 'userId', select: 'nom prenom email' },
            })
            .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'nom prenom email' },
            })
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, plan }
    }

    async getAllPlansTraitement(): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find()
        return { success: true, plans }
    }

    async getPlansByPatient(patientId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ patientId }).populate({
            path: 'kineId',
            populate: { path: 'userId', select: 'nom prenom email' },
        })
        return { success: true, plans }
    }

    async getPlansByKine(kineId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ kineId }).populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'nom prenom email' },
        })
        return { success: true, plans }
    }
}
