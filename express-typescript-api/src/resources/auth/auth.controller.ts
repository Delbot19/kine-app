import { Router, type Request, type Response, type NextFunction } from 'express'
import AuthService from './auth.service'
import { registerSchema, loginSchema } from './auth.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import jsonResponse from '../../utils/jsonResponse'

class AuthController {
    public path = '/auth'
    public router = Router()
    private readonly authService = new AuthService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.post('/register', zodValidator(registerSchema), this.register)
        this.router.post('/login', zodValidator(loginSchema), this.login)
    }

    private readonly register = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.authService.register(req.body)
            if (result.success) {
                return res
                    .status(201)
                    .json(jsonResponse('Utilisateur créé avec succès', true, result))
            }
            return res
                .status(400)
                .json(jsonResponse("Erreur lors de la création de l'utilisateur", false, result))
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
                .json(jsonResponse('Email ou mot de passe incorrect', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController
