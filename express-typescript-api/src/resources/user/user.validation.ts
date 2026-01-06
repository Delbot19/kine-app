import { z } from 'zod'

export const updateUserSchema = z.object({
    nom: z.string().min(2).optional(),
    prenom: z.string().min(2).optional(),
    email: z.string().email().optional(),
    motDePasse: z.string().min(8).optional(),
})

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Ancien mot de passe requis'),
    newPassword: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
})
