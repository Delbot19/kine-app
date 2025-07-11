import { z } from 'zod'
import { RoleEnum } from '../../models/user.model'

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

export const registerSchema = z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    motDePasse: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
            strongPasswordRegex,
            'Le mot de passe doit contenir au moins 1 majuscule et 1 caractère spécial',
        ),
    role: z.nativeEnum(RoleEnum).optional(),
})
