import { Router, type Request, type Response, type NextFunction } from 'express'
import AuthService from './auth.service'
import {
    loginSchema,
    setupAccountSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './auth.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import jsonResponse from '../../utils/jsonResponse'
import authMiddleware from '../../middleware/auth.middleware'

class AuthController {
    public path = '/auth'
    public router = Router()
    private readonly authService = new AuthService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.post('/login', zodValidator(loginSchema), this.login)
        this.router.post('/setup-account', zodValidator(setupAccountSchema), this.setupAccount)
        this.router.get('/me', authMiddleware, this.getCurrentUser)
        this.router.post(
            '/forgot-password',
            zodValidator(forgotPasswordSchema),
            this.forgotPassword,
        )
        this.router.post('/reset-password', zodValidator(resetPasswordSchema), this.resetPassword)
    }

    private readonly getCurrentUser = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { user } = req as any
            if (!user) {
                return res.status(401).json(jsonResponse('Non authentifié', false))
            }
            // Authenticated user from middleware contains payload.
            // We might want to fetch full details or just return payload if sufficient.
            // Middleware attaches: { userId, role, ... }
            // Let's assume we want full user details. relying on payload might be enough for ID/Role.
            // However, frontend expects 'User' interface with name, email etc.
            // So we should fetch from DB. "authService" might needed or just direct Model usage?
            // Accessing AuthService seems cleaner.
            const result = await this.authService.getCurrentUser(user.userId)
            if (result.success) {
                return res.status(200).json(jsonResponse('Utilisateur actuel', true, result.user))
            }
            return res.status(404).json(jsonResponse('Utilisateur non trouvé', false))
        } catch (error) {
            next(error)
        }
    }

    private readonly login = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.authService.login(req.body)
            if (result.success) {
                return res.status(200).json(jsonResponse('Connexion réussie', true, result))
            }
            return res
                .status(400)
                .json(
                    jsonResponse(
                        result.message || 'Email ou mot de passe incorrect',
                        false,
                        result,
                    ),
                )
        } catch (error) {
            next(error)
        }
    }

    private readonly setupAccount = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.authService.setupAccount(req.body)
            if (result.success) {
                return res.status(200).json(jsonResponse('Compte configuré', true, result))
            }
            return res
                .status(400)
                .json(
                    jsonResponse(
                        result.message || 'Erreur lors de la configuration',
                        false,
                        result,
                    ),
                )
        } catch (error) {}
    }

    private readonly forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.authService.forgotPassword(req.body.email)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse(result.message, true, { token: result.token }))
            }
            return res.status(400).json(jsonResponse(result.message, false))
        } catch (error) {
            next(error)
        }
    }

    private readonly resetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { token, motDePasse } = req.body
            const result = await this.authService.resetPassword(token, motDePasse)
            if (result.success) {
                return res.status(200).json(jsonResponse(result.message, true))
            }
            return res.status(400).json(jsonResponse(result.message, false))
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController
