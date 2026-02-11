import { type Schema } from 'mongoose'

export interface CreateRessourceEducativeInput {
    titre: string
    type: 'article' | 'video'
    misEnAvant?: boolean
    description?: string
    contenu: string
    url?: string
    imageUrl?: string
    auteurId: Schema.Types.ObjectId | string
    visibilite?: 'public' | 'privé'
    tags?: string[]
}

export interface UpdateRessourceEducativeInput {
    titre?: string
    type?: 'article' | 'video'
    misEnAvant?: boolean
    description?: string
    contenu?: string
    url?: string
    imageUrl?: string
    visibilite?: 'public' | 'privé'
    tags?: string[]
}
