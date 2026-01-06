import { type Schema } from 'mongoose'
import { type IObjective } from '@/models/plantraitement.model'

export interface CreatePlanTraitementInput {
    objectifs: IObjective[]
    duree: number
    suivi?: string
    patientId: Schema.Types.ObjectId | string
    kineId: Schema.Types.ObjectId | string
    exercises?: Array<{
        exerciseId: string
        instructions?: string
    }>
}

export interface UpdatePlanTraitementInput {
    objectifs?: IObjective[]
    duree?: number
    suivi?: string
    statut?: 'en cours' | 'terminé' | 'annulé'
    exercises?: Array<{
        exerciseId: string
        instructions?: string
    }>
}
