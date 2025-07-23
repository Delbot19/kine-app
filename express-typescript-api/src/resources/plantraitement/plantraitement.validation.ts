import { z } from 'zod'

export const createPlanTraitementSchema = z.object({
    objectifs: z.string().min(2, 'Objectifs requis'),
    duree: z.number().int().positive('Durée (nombre de RDV) requise'),
    suivi: z.string().optional(),
    patientId: z.string().min(1, 'Patient requis'),
    kineId: z.string().min(1, 'Kiné requis'),
})

export const updatePlanTraitementSchema = z.object({
    objectifs: z.string().min(2).optional(),
    duree: z.number().int().positive().optional(),
    suivi: z.string().optional(),
    statut: z.enum(['en cours', 'terminé', 'annulé']).optional(),
})
