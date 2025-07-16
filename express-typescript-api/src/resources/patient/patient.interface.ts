// Interfaces pour les entrées Patient (DTO)
import { type Schema } from 'mongoose'

export interface CreatePatientInput {
    userId?: Schema.Types.ObjectId | string // devient optionnel
    sexe: 'H' | 'F'
    dateNaissance: Date | string
    adresse: string
    telephone: string
    groupeSanguin?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
}

export interface UpdatePatientInput {
    sexe?: 'H' | 'F'
    dateNaissance?: Date | string
    adresse?: string
    telephone?: string
    groupeSanguin?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
}
