import { Schema, model, type Document } from 'mongoose'

export interface IRessourceEducative extends Document {
    titre: string
    type: 'article' | 'video'
    contenu: string
    url?: string
    auteurId: Schema.Types.ObjectId
    datePublication: Date
    visibilite: 'public' | 'privé'
    tags?: string[]
    createdAt: Date
    updatedAt: Date
}

const ressourceEducativeSchema = new Schema<IRessourceEducative>(
    {
        titre: { type: String, required: true },
        type: { type: String, enum: ['article', 'video'], required: true },
        contenu: { type: String, required: true },
        url: { type: String },
        auteurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        datePublication: { type: Date, default: Date.now },
        visibilite: { type: String, enum: ['public', 'privé'], default: 'public' },
        tags: [{ type: String }],
    },
    { timestamps: true },
)

export default model<IRessourceEducative>('RessourceEducative', ressourceEducativeSchema)
