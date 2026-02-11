import { Types } from 'mongoose'
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
        // 1. Check if patient already has an active plan with this Kine
        const existingPlan = await PlanTraitement.findOne({
            patientId: input.patientId,
            kineId: input.kineId,
            statut: 'en cours',
        })

        if (existingPlan) {
            // 2. If exists, append new exercises
            if (input.exercises && input.exercises.length > 0) {
                const newExercises = input.exercises.map((e) => ({
                    exerciseId: new Types.ObjectId(e.exerciseId) as any, // Typed as any to bypass Mongoose mismatch
                    instructions: e.instructions,
                    assignedAt: new Date(),
                    duree: input.duree ?? 7, // Default to 7 if undefined, though input usually has it
                }))
                // Use push with spread on the array to avoid tuple mismatch issues if any
                existingPlan.exercises.push(...newExercises)

                // Optional: Update duration if provided and greater than current (logic can be adjusted)
                if (input.duree && input.duree > existingPlan.duree) {
                    existingPlan.duree = input.duree
                }

                await existingPlan.save()
                return {
                    success: true,
                    plan: existingPlan,
                    message: 'Exercices ajoutés au plan existant.',
                }
            }
            return {
                success: true,
                plan: existingPlan,
                message: 'Plan existant récupéré sans modification.',
            }
        }

        // 3. Else, Create New
        // Map input exercises to include assignedAt and duree explicitly
        const exercisesWithMeta = (input.exercises ?? []).map((e) => ({
            ...e,
            assignedAt: new Date(),
            duree: input.duree ?? 7,
        }))

        const planData = { ...input, exercises: exercisesWithMeta }
        const plan = await PlanTraitement.create(planData)
        return { success: true, plan, message: 'Nouveau plan de traitement créé.' }
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
            .populate('exercises.exerciseId')
        if (!plan) return { success: false, message: 'Plan de traitement non trouvé.' }
        return { success: true, plan }
    }

    async getAllPlansTraitement(): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find().populate('exercises.exerciseId')
        return { success: true, plans }
    }

    async getPlansByPatient(patientId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ patientId })
            .populate({
                path: 'kineId',
                populate: { path: 'userId', select: 'nom prenom email' },
            })
            .populate('exercises.exerciseId')
        return { success: true, plans }
    }

    async getPlansByKine(kineId: string): Promise<PlanTraitementServiceResult> {
        const plans = await PlanTraitement.find({ kineId })
            .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'nom prenom email' },
            })
            .populate('exercises.exerciseId')
        return { success: true, plans }
    }
}
