import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema } from 'zod'
import jsonResponse from '@utils/jsonResponse'

const zodValidator =
    (schema: ZodSchema): any =>
    (req: Request, res: Response, next: NextFunction): any => {
        const result = schema.safeParse(req.body)

        if (result.success) {
            next()
            return
        }

        const errors: any = {}

        result.error.issues.forEach((issue) => {
            // Utilise le premier élément du path pour le nom du champ
            const field = issue.path[0] ?? 'unknown'
            errors[field] = issue.message
        })

        return res
            .status(400)
            .json(jsonResponse('Erreur de validation des champs', false, { errors }))
    }

export default zodValidator
