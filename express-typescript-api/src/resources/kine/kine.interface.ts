import { type Schema } from 'mongoose'

export interface CreateKineInput {
    userId?: Schema.Types.ObjectId | string
    specialite: string
    numeroRPPS: string
    presentation?: string
}

export interface UpdateKineInput {
    specialite?: string
    numeroRPPS?: string
    presentation?: string
}
