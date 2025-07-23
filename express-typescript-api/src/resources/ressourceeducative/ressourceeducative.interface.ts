import { type Schema } from 'mongoose'

export interface CreateRessourceEducativeInput {
    titre: string
    type: 'article' | 'video'
    contenu: string
    url?: string
    auteurId: Schema.Types.ObjectId | string
    visibilite?: 'public' | 'privé'
    tags?: string[]
}

export interface UpdateRessourceEducativeInput {
    titre?: string
    type?: 'article' | 'video'
    contenu?: string
    url?: string
    visibilite?: 'public' | 'privé'
    tags?: string[]
}
