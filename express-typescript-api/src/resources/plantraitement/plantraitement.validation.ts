import { z } from 'zod'

const objectiveSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().min(1, 'Description requise'),
    progress: z.number().min(0).max(100).default(0),
    status: z.enum(['En cours', 'Terminé', 'À venir']).default('À venir'),
    icon: z.enum(['heart', 'trending', 'dumbbell']).default('trending'),
    variant: z.enum(['blue', 'green', 'orange']).optional(),
})

const exerciseInputSchema = z.object({
    exerciseId: z.string().min(1, 'Exercise ID requis'),
    instructions: z.string().optional(),
})

export const createPlanTraitementSchema = z.object({
    objectifs: z.array(objectiveSchema).min(1, 'Au moins un objectif est requis'),
    duree: z.number().int().positive('Durée (nombre de RDV) requise'),
    suivi: z.string().optional(),
    patientId: z.string().min(1, 'Patient requis'),
    exercises: z.array(exerciseInputSchema).optional(),
})

export const updatePlanTraitementSchema = z.object({
    objectifs: z.array(objectiveSchema).optional(),
    duree: z.number().int().positive().optional(),
    suivi: z.string().optional(),
    statut: z.enum(['en cours', 'terminé', 'annulé']).optional(),
    exercises: z.array(exerciseInputSchema).optional(),
})
