import { z } from 'zod'

export const createKineSchema = z.object({
    specialite: z.string().min(2, 'La spécialité est requise'),
    numeroRPPS: z.string().min(5, 'Le numéro RPPS est requis'),
    presentation: z.string().optional(),
})

export const updateKineSchema = z.object({
    specialite: z.string().min(2).optional(),
    numeroRPPS: z.string().min(5).optional(),
    presentation: z.string().optional(),
})
