import { z } from 'zod'

export const updateUserSchema = z.object({
    nom: z.string().min(2).optional(),
    prenom: z.string().min(2).optional(),
    email: z.string().email().optional(),
    motDePasse: z.string().min(8).optional(),
})
