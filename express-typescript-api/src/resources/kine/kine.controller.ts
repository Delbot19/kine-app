import { Router, type Request, type Response, type NextFunction } from 'express'
import KineService from './kine.service'
import { updateKineSchema } from './kine.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import jsonResponse from '../../utils/jsonResponse'
import authMiddleware from '../../middleware/auth.middleware'

class KineController {
    public path = '/kines'
    public router = Router()
    private readonly kineService = new KineService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.get('/by-user/:userId', authMiddleware, this.getKineByUserId)
        this.router.get('/', authMiddleware, this.getAllKines)
        this.router.get('/search', authMiddleware, this.searchKines)
        this.router.get('/:id', authMiddleware, this.getKineById)
        this.router.put('/:id', authMiddleware, zodValidator(updateKineSchema), this.updateKine)
        this.router.delete('/:id', authMiddleware, this.deleteKine)
    }

    private readonly getKineById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.kineService.getKineById(id, userId, role)
            if (result.success) {
                return res.status(200).json(jsonResponse('Kiné trouvé', true, result.kine))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Kiné non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly updateKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.kineService.updateKine(id, req.body, userId, role)
            if (result.success) {
                return res.status(200).json(jsonResponse('Kiné mis à jour', true, result.kine))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Kiné non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly deleteKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.kineService.deleteKine(id, userId, role)
            if (result.success) {
                return res.status(200).json(jsonResponse(result.message ?? 'Kiné supprimé', true))
            }
            return res
                .status(404)
                .json(
                    jsonResponse(
                        result.message ?? 'Kiné non trouvé ou déjà supprimé',
                        false,
                        result,
                    ),
                )
        } catch (error) {
            next(error)
        }
    }

    private readonly getKineByUserId = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { userId } = req.params
            const requesterId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.kineService.getKineByUserId(userId, requesterId, role)
            if (result.success) {
                return res.status(200).json(jsonResponse('Kiné trouvé', true, result.kine))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Kiné non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getAllKines = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            const result = await this.kineService.getAllKines(role)
            if (result.success) {
                return res.status(200).json(jsonResponse('Liste des kinés', true, result.kine))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message ?? 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly searchKines = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            // Recherche uniquement par nom (ex: /kines/search?nom=Durand)
            const { nom } = req.query
            const result = await this.kineService.searchKines({ nom }, role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Résultats de la recherche', true, result.kine))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message ?? 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default KineController
