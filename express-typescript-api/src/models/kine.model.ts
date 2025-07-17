import { Schema, model, type Document } from 'mongoose'

export interface IKine extends Document {
    userId?: Schema.Types.ObjectId
    specialite: string
    numeroRPPS: string
    presentation?: string
    createdAt: Date
    updatedAt: Date
}

const kineSchema = new Schema<IKine>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        specialite: {
            type: String,
            required: true,
        },
        numeroRPPS: {
            type: String,
            required: true,
        },
        presentation: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
)

export default model<IKine>('Kine', kineSchema)
