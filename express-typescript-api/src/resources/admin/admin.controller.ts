import { Router, type Request, type Response, type NextFunction } from 'express'
import { registerKineSchema } from '../kine/kine.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import AdminService from './admin.service'
import jsonResponse from '../../utils/jsonResponse'

class AdminController {
    public path = '/admin'
    public router = Router()
    private readonly adminService = new AdminService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.post(
            '/register-kine',
            authMiddleware,
            zodValidator(registerKineSchema),
            this.registerKine,
        )
        this.router.get('/users', authMiddleware, this.getAllUsers)
    }

    private readonly registerKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            const result = await this.adminService.registerKine(req.body, role)
            if (result.success) {
                return res.status(201).json(jsonResponse('Kiné créé avec succès', true, result))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message || 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getAllUsers = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            const result = await this.adminService.getAllUsers(role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Liste des utilisateurs', true, result.users))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message || 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default AdminController
