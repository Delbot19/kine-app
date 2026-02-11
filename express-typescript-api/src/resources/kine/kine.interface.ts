import { type Schema } from 'mongoose'

export interface CreateKineInput {
    userId?: Schema.Types.ObjectId | string
    specialite: string
    numeroRPPS: string
    presentation?: string
    telephone?: string
    adresse?: string
}

export interface UpdateKineInput {
    specialite?: string
    numeroRPPS?: string
    presentation?: string
    telephone?: string
    adresse?: string
}

export interface RegisterKineInput {
    nom: string
    prenom: string
    email: string
    motDePasse: string
    specialite: string
    numeroRPPS: string
    presentation?: string
    telephone?: string
    adresse?: string
}
