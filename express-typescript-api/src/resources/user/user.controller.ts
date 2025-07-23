import { Router, type Request, type Response, type NextFunction } from 'express'
import UserService from './user.service'
import { updateUserSchema } from './user.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import jsonResponse from '../../utils/jsonResponse'

class UserController {
    public path = '/users'
    public router = Router()
    private readonly userService = new UserService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.patch('/me', authMiddleware, zodValidator(updateUserSchema), this.updateUser)
    }

    private readonly updateUser = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const userId = (req as any).user?.userId || (req as any).user?._id
            const result = await this.userService.updateUser(userId, req.body)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Utilisateur mis à jour', true, result.user))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Utilisateur non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default UserController
