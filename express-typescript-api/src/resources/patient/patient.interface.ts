// Interfaces pour les entrées Patient (DTO)
import { type RoleEnum } from '../../models/user.model'

export interface CreatePatientInput {
    nom: string
    prenom: string
    email: string
    motDePasse: string
    role?: RoleEnum
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
