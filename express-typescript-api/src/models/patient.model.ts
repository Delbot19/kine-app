import { Schema, model, type Document } from 'mongoose'

export interface IPatient extends Document {
    userId: Schema.Types.ObjectId
    sexe: 'H' | 'F'
    dateNaissance: Date
    adresse: string
    telephone: string
    groupeSanguin?: string
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
    },
    {
        timestamps: true,
    },
)

export default model<IPatient>('Patient', patientSchema)
