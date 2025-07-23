import { type Schema } from 'mongoose'

export interface CreatePlanTraitementInput {
    objectifs: string
    duree: number
    suivi?: string
    patientId: Schema.Types.ObjectId | string
    kineId: Schema.Types.ObjectId | string
}

export interface UpdatePlanTraitementInput {
    objectifs?: string
    duree?: number
    suivi?: string
    statut?: 'en cours' | 'terminé' | 'annulé'
}
