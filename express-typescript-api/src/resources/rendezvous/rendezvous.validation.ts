import { z } from 'zod'

export const createRendezVousSchema = z.object({
    patientId: z.string().min(1, 'Le patient est requis'),
    kineId: z.string().min(1, 'Le kiné est requis'),
    date: z.string().datetime({ message: 'Date invalide' }),
    duree: z.number().int().positive().default(30).optional(),
    motif: z.string().optional(),
    statut: z.enum(['en attente', 'à venir', 'annulé', 'terminé']).optional(),
    paiementEffectue: z.boolean().optional(),
})

export const updateRendezVousSchema = z.object({
    date: z.string().datetime({ message: 'Date invalide' }).optional(),
    duree: z.number().int().positive().optional(),
    motif: z.string().optional(),
    statut: z.enum(['en attente', 'à venir', 'annulé', 'terminé']).optional(),
    paiementEffectue: z.boolean().optional(),
})
