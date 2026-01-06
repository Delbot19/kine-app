import { z } from 'zod'

export const createExerciseSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    description: z.string().min(1, 'La description est requise'),
    duration: z.string().min(1, 'La durée est requise'),
    tip: z.string().optional(),
    difficulty: z.enum(['Facile', 'Modéré', 'Difficile']),
    icon: z.enum(['target', 'refresh', 'zap', 'circle']).optional(),
    isGlobal: z.boolean().optional(),
})

export const toggleExerciseSchema = z.object({
    completed: z.boolean(),
    douleur: z.number().min(0).max(10).optional(),
    difficulte: z.enum(['Facile', 'Modéré', 'Difficile', 'Impossible']).optional(),
    ressenti: z.string().optional(),
    modifications: z.string().optional(),
})
