import { Schema, model, type Document } from 'mongoose'

export interface IRessourceEducative extends Document {
    titre: string
    type: 'article' | 'video'
    slug: string
    misEnAvant: boolean
    description?: string
    contenu: string
    url?: string
    imageUrl?: string
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
        slug: { type: String, unique: true, required: true },
        misEnAvant: { type: Boolean, default: false },
        description: { type: String },
        contenu: { type: String },
        url: { type: String },
        imageUrl: { type: String },
        auteurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        datePublication: { type: Date, default: Date.now },
        visibilite: { type: String, enum: ['public', 'privé'], default: 'public' },
        tags: [{ type: String }],
    },
    { timestamps: true },
)

export default model<IRessourceEducative>('RessourceEducative', ressourceEducativeSchema)
