import { Schema, model, type Document } from 'mongoose'

export interface IRendezVous extends Document {
    patientId: Schema.Types.ObjectId
    kineId: Schema.Types.ObjectId
    date: Date // Date et heure du début du créneau
    duree: number // Durée en minutes (30 min par défaut)
    motif?: string | { titre: string; description: string } // Motif simple ou structuré
    statut?: 'en attente' | 'à venir' | 'annulé' | 'terminé' // Statut du RDV
    paiementEffectue?: boolean // Paiement effectué ou non
    createdAt: Date
    updatedAt: Date
}

const rendezVousSchema = new Schema<IRendezVous>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
        kineId: { type: Schema.Types.ObjectId, ref: 'Kine', required: true },
        date: { type: Date, required: true },
        duree: { type: Number, default: 30 },
        motif: { type: Schema.Types.Mixed }, // String or Object { titre, description }
        statut: {
            type: String,
            enum: ['en attente', 'à venir', 'annulé', 'terminé'],
            default: 'en attente',
        },
        paiementEffectue: { type: Boolean, default: false },
    },
    { timestamps: true },
)

export default model<IRendezVous>('RendezVous', rendezVousSchema)
