import { z } from 'zod'

export const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])

export const createPatientSchema = z.object({
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
