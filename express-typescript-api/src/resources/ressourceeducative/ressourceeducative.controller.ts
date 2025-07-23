import { Router, type Request, type Response, type NextFunction } from 'express'
import RessourceEducativeService from './ressourceeducative.service'
import {
    createRessourceEducativeSchema,
    updateRessourceEducativeSchema,
} from './ressourceeducative.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import jsonResponse from '../../utils/jsonResponse'
import { RoleEnum } from '../../models/user.model'

class RessourceEducativeController {
    public path = '/ressources-educatives'
    public router = Router()
    private readonly ressourceEducativeService = new RessourceEducativeService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        // CRUD admin
        this.router.post(
            '/',
            authMiddleware,
            zodValidator(createRessourceEducativeSchema),
            this.createRessourceEducative,
        )
        this.router.put(
            '/:id',
            authMiddleware,
            zodValidator(updateRessourceEducativeSchema),
            this.updateRessourceEducative,
        )
        this.router.delete('/:id', authMiddleware, this.deleteRessourceEducative)
        // Lecture publique
        this.router.get('/', this.getAllRessourcesEducatives)
        this.router.get('/:id', this.getRessourceEducativeById)
        this.router.get('/search/:searchTerm', this.searchRessources)
    }

    private readonly createRessourceEducative = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            const auteurId = (req as any).user?.userId || (req as any).user?._id
            if (role !== RoleEnum.ADMIN) {
                return res.status(403).json(jsonResponse('Accès réservé aux admins', false))
            }
            const result = await this.ressourceEducativeService.createRessourceEducative({
                ...req.body,
                auteurId,
            })
            if (result.success) {
                return res.status(201).json(jsonResponse('Ressource créée', true, result.ressource))
            }
            return res.status(400).json(jsonResponse('Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly updateRessourceEducative = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            if (role !== RoleEnum.ADMIN) {
                return res.status(403).json(jsonResponse('Accès réservé aux admins', false))
            }
            const { id } = req.params
            const result = await this.ressourceEducativeService.updateRessourceEducative(
                id,
                req.body,
            )
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Ressource mise à jour', true, result.ressource))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Ressource non trouvée', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly deleteRessourceEducative = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            if (role !== RoleEnum.ADMIN) {
                return res.status(403).json(jsonResponse('Accès réservé aux admins', false))
            }
            const { id } = req.params
            const result = await this.ressourceEducativeService.deleteRessourceEducative(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse(result.message ?? 'Ressource supprimé', true))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Ressource non trouvée', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getRessourceEducativeById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.ressourceEducativeService.getRessourceEducativeById(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Ressource trouvée', true, result.ressource))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Ressource non trouvée', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getAllRessourcesEducatives = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.ressourceEducativeService.getAllRessourcesEducatives()
            return res
                .status(200)
                .json(jsonResponse('Liste des ressources', true, result.ressources))
        } catch (error) {
            next(error)
        }
    }

    private readonly searchRessources = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { searchTerm } = req.params
            if (!searchTerm) {
                return res.status(400).json(jsonResponse('Paramètre de recherche requis', false))
            }
            const result = await this.ressourceEducativeService.searchRessources(searchTerm)
            return res
                .status(200)
                .json(jsonResponse('Résultats de la recherche', true, result.ressources))
        } catch (error) {
            next(error)
        }
    }
}

export default RessourceEducativeController
