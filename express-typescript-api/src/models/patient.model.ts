import { Schema, model, type Document } from 'mongoose'

export interface IPatient extends Document {
    userId: Schema.Types.ObjectId
    kineId?: Schema.Types.ObjectId
    sexe: 'H' | 'F'
    dateNaissance: Date
    adresse: string
    telephone: string
    groupeSanguin?: string
    pathologie?: string
    statut?: 'actif' | 'en_pause' | 'termine'
    createdAt: Date
    updatedAt: Date
}

const patientSchema = new Schema<IPatient>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // 1 patient = 1 user
        },
        kineId: {
            type: Schema.Types.ObjectId,
            ref: 'Kine',
            default: null,
        },
        sexe: {
            type: String,
            enum: ['H', 'F'],
            required: true,
        },
        dateNaissance: {
            type: Date,
            required: true,
        },
        adresse: {
            type: String,
            required: true,
        },
        telephone: {
            type: String,
            required: true,
        },
        groupeSanguin: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        pathologie: {
            type: String,
            default: 'Non spécifié',
        },
        statut: {
            type: String,
            enum: ['actif', 'en_pause', 'termine'],
            default: 'actif',
        },
    },
    {
        timestamps: true,
    },
)

export default model<IPatient>('Patient', patientSchema)
