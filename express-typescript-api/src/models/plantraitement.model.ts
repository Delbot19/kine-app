import { Schema, model, type Document } from 'mongoose'

export interface IPlanTraitement extends Document {
    objectifs: string
    duree: number // nombre de rendez-vous
    suivi?: string
    patientId: Schema.Types.ObjectId
    kineId: Schema.Types.ObjectId
    statut: 'en cours' | 'terminé' | 'annulé'
    createdAt: Date
    updatedAt: Date
}

const planTraitementSchema = new Schema<IPlanTraitement>(
    {
        objectifs: { type: String, required: true },
        duree: { type: Number, required: true },
        suivi: { type: String },
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        kineId: { type: Schema.Types.ObjectId, ref: 'Kine', required: true },
        statut: { type: String, enum: ['en cours', 'terminé', 'annulé'], default: 'en cours' },
    },
    { timestamps: true },
)

export default model<IPlanTraitement>('PlanTraitement', planTraitementSchema)
