import { z } from 'zod'

export const createRessourceEducativeSchema = z.object({
    titre: z.string().min(2, 'Titre requis'),
    type: z.enum(['article', 'video']),
    description: z.string().optional(),
    contenu: z.string().optional(),
    url: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    visibilite: z.enum(['public', 'privé']).optional(),
    tags: z.array(z.string()).optional(),
})

export const updateRessourceEducativeSchema = z.object({
    titre: z.string().min(2).optional(),
    type: z.enum(['article', 'video']).optional(),
    description: z.string().optional(),
    contenu: z.string().optional(),
    url: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    visibilite: z.enum(['public', 'privé']).optional(),
    tags: z.array(z.string()).optional(),
})
