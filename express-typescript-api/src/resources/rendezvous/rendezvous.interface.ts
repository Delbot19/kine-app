import { type Schema } from 'mongoose'

export interface CreateRendezVousInput {
    patientId: Schema.Types.ObjectId | string
    kineId: Schema.Types.ObjectId | string
    date: Date | string
    duree?: number // optionnel, 30 min par défaut
    motif?: string
    statut?: 'en attente' | 'à venir' | 'annulé' | 'terminé'
    paiementEffectue?: boolean
}

export interface UpdateRendezVousInput {
    date?: Date | string
    duree?: number
    motif?: string
    statut?: 'en attente' | 'à venir' | 'annulé' | 'terminé'
    paiementEffectue?: boolean
}
