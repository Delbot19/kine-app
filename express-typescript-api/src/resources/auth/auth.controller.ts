import { Router, type Request, type Response, type NextFunction } from 'express'
import AuthService from './auth.service'
import { loginSchema } from './auth.validation'
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
        this.router.post('/login', zodValidator(loginSchema), this.login)
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
