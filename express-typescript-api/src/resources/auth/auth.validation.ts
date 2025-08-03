import { z } from 'zod'

const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
            strongPasswordRegex,
            'Le mot de passe doit contenir au moins 1 majuscule et 1 caractère spécial',
        ),
})
