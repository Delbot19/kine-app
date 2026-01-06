import { Schema, model, type Document } from 'mongoose'

export interface IExerciseLog extends Document {
    patientId: Schema.Types.ObjectId
    exerciseId: Schema.Types.ObjectId
    date: Date // Normalized to start of day
    completed: boolean
    douleur?: number
    difficulte?: string
    ressenti?: string
    modifications?: string
    createdAt: Date
    updatedAt: Date
}

const exerciseLogSchema = new Schema<IExerciseLog>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        date: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        douleur: { type: Number, min: 0, max: 10 },
        difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile', 'Impossible'] },
        ressenti: { type: String },
        modifications: { type: String },
    },
    { timestamps: true },
)

// Ensure unique log per patient per exercise per day
exerciseLogSchema.index({ patientId: 1, exerciseId: 1, date: 1 }, { unique: true })

export default model<IExerciseLog>('ExerciseLog', exerciseLogSchema)
