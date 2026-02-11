import { Schema, model, type Document } from 'mongoose'

export interface IExercise extends Document {
    title: string
    description: string
    duration: string
    tip: string
    category: string
    difficulty: 'Facile' | 'Modéré' | 'Difficile'
    icon: 'target' | 'refresh' | 'zap' | 'circle'
    isGlobal: boolean
    createdAt: Date
    updatedAt: Date
}

const exerciseSchema = new Schema<IExercise>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: String, required: true },
        tip: { type: String },
        category: {
            type: String,
            required: true,
            default: 'Mobilité', // Default for migration
        },
        difficulty: {
            type: String,
            enum: ['Facile', 'Modéré', 'Difficile'],
            required: true,
        },
        icon: {
            type: String,
            enum: ['target', 'refresh', 'zap', 'circle', 'dumbbell', 'activity'],
            default: 'circle',
        },
        isGlobal: { type: Boolean, default: true },
    },
    { timestamps: true },
)

export default model<IExercise>('Exercise', exerciseSchema)
