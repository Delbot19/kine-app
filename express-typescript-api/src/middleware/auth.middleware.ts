import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import jsonResponse from '../utils/jsonResponse'
import User from '../models/user.model'

export default async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json(jsonResponse('Non authentifié', false))
        return
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) {
        res.status(401).json(jsonResponse('Token invalide ou expiré', false))
        return
    }
    // Vérification de l'existence du user en base
    const user = await User.findById(payload.userId)
    if (!user) {
        res.status(401).json(jsonResponse('Utilisateur inexistant', false))
        return
    }
    // On attache le payload du token à req.user
    ;(req as any).user = payload
    next()
}
