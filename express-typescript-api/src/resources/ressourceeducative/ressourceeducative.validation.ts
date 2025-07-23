import { z } from 'zod'

export const createRessourceEducativeSchema = z.object({
    titre: z.string().min(2, 'Titre requis'),
    type: z.enum(['article', 'video']),
    contenu: z.string().min(2, 'Contenu requis'),
    url: z.string().url().optional(),
    visibilite: z.enum(['public', 'privé']).optional(),
    tags: z.array(z.string()).optional(),
})

export const updateRessourceEducativeSchema = z.object({
    titre: z.string().min(2).optional(),
    type: z.enum(['article', 'video']).optional(),
    contenu: z.string().min(2).optional(),
    url: z.string().url().optional(),
    visibilite: z.enum(['public', 'privé']).optional(),
    tags: z.array(z.string()).optional(),
})
