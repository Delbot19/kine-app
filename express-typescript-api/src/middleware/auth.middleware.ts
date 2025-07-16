import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import jsonResponse from '../utils/jsonResponse'

export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
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
    // On attache le payload du token à req.user
    ;(req as any).user = payload
    next()
}
