import { Schema, model, type Document } from 'mongoose'

export interface IObjective {
    title: string
    description: string
    progress: number
    status: 'En cours' | 'Terminé' | 'À venir'
    icon: 'heart' | 'trending' | 'dumbbell'
    variant?: 'blue' | 'green' | 'orange'
}

export interface IPlanTraitement extends Document {
    objectifs: IObjective[]
    duree: number // nombre de rendez-vous
    suivi?: string
    patientId: Schema.Types.ObjectId
    kineId: Schema.Types.ObjectId | any // Populated or ID
    exercises: Array<{
        exerciseId: Schema.Types.ObjectId
        instructions?: string
        assignedAt: Date
        duree: number
    }>
    statut: 'en cours' | 'terminé' | 'archivé'
    createdAt: Date
    updatedAt: Date
}

const objectiveSchema = new Schema<IObjective>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        progress: { type: Number, default: 0 },
        status: { type: String, enum: ['En cours', 'Terminé', 'À venir'], default: 'En cours' },
        icon: {
            type: String,
            enum: ['heart', 'trending', 'dumbbell', 'target'],
            default: 'trending',
        },
        variant: { type: String, enum: ['blue', 'green', 'orange'], default: 'blue' },
    },
    { _id: false },
)

const planTraitementSchema = new Schema<IPlanTraitement>(
    {
        objectifs: [objectiveSchema],
        duree: { type: Number, required: true },
        suivi: { type: String },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        kineId: { type: Schema.Types.ObjectId, ref: 'Kine', required: true },
        exercises: [
            {
                exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
                instructions: { type: String },
                assignedAt: { type: Date, default: Date.now },
                duree: { type: Number, default: 7 }, // Duration in days
            },
        ],
        statut: {
            type: String,
            enum: ['en cours', 'terminé', 'archivé'],
            default: 'en cours',
        },
    },
    { timestamps: true },
)

export default model<IPlanTraitement>('PlanTraitement', planTraitementSchema)
