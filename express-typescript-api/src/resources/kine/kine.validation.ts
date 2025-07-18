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

export const registerKineSchema = z
    .object({
        nom: z.string().min(2, 'Le nom est requis'),
        prenom: z.string().min(2, 'Le prénom est requis'),
        email: z.string().email('Email invalide'),
        motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    })
    .merge(createKineSchema)
