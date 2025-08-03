import { z } from 'zod'
import { RoleEnum } from '../../models/user.model'

export const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

export const createPatientSchema = z.object({
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
    sexe: z.enum(['H', 'F'], { required_error: 'Le sexe est requis' }),
    dateNaissance: z.preprocess(
        (val) => (typeof val === 'string' ? new Date(val) : val),
        z.date({ required_error: 'La date de naissance est requise' }),
    ),
    adresse: z.string().min(2, 'Adresse requise'),
    telephone: z.string().min(10, 'Téléphone requis'),
    groupeSanguin: bloodGroupEnum.optional(),
})

export const updatePatientSchema = z.object({
    sexe: z.enum(['H', 'F']).optional(),
    dateNaissance: z
        .preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date())
        .optional(),
    adresse: z.string().min(2).optional(),
    telephone: z.string().min(10).optional(),
    groupeSanguin: bloodGroupEnum.optional(),
})
