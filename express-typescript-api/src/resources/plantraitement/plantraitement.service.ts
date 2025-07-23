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
        const plan = await PlanTraitement.findByIdAndUpdate(id, input, { new: true })
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, plan }
    }

    async deletePlanTraitement(id: string): Promise<PlanTraitementServiceResult> {
        const plan = await PlanTraitement.findByIdAndDelete(id)
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, message: 'Plan de traitement supprimé.' }
    }

    async getPlanTraitementById(id: string): Promise<PlanTraitementServiceResult> {
        const plan = await PlanTraitement.findById(id)
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, plan }
    }

    async getAllPlansTraitement(): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find()
        return { success: true, plans }
    }

    async getPlansByPatient(patientId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ patientId })
        return { success: true, plans }
    }

    async getPlansByKine(kineId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ kineId })
        return { success: true, plans }
    }
}
