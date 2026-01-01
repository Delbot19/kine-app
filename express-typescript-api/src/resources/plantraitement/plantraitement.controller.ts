import { Router, type Request, type Response, type NextFunction } from 'express'
import PlanTraitementService from './plantraitement.service'
import { createPlanTraitementSchema, updatePlanTraitementSchema } from './plantraitement.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import jsonResponse from '../../utils/jsonResponse'

class PlanTraitementController {
    public path = '/plans-traitement'
    public router = Router()
    private readonly planTraitementService = new PlanTraitementService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.post(
            '/',
            authMiddleware,
            zodValidator(createPlanTraitementSchema),
            this.createPlanTraitement,
        )
        this.router.get('/', authMiddleware, this.getAllPlansTraitement)
        // Reordered: Specific routes BEFORE generic route /:id
        this.router.get('/patient/:patientId', authMiddleware, this.getPlansByPatient)
        this.router.get('/kine/:kineId', authMiddleware, this.getPlansByKine)

        this.router.get('/:id', authMiddleware, this.getPlanTraitementById)

        this.router.put(
            '/:id',
            authMiddleware,
            zodValidator(updatePlanTraitementSchema),
            this.updatePlanTraitement,
        )
        this.router.delete('/:id', authMiddleware, this.deletePlanTraitement)
    }

    private readonly createPlanTraitement = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.planTraitementService.createPlanTraitement(req.body)
            if (result.success) {
                return res
                    .status(201)
                    .json(jsonResponse('Plan de traitement créé', true, result.plan))
            }
            return res.status(400).json(jsonResponse('Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly updatePlanTraitement = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.planTraitementService.updatePlanTraitement(id, req.body)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Plan de traitement mis à jour', true, result.plan))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Plan non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly deletePlanTraitement = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.planTraitementService.deletePlanTraitement(id)
            if (result.success) {
                return res.status(200).json(jsonResponse(result.message ?? 'Plan supprimé', true))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Plan non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPlanTraitementById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.planTraitementService.getPlanTraitementById(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Plan de traitement trouvé', true, result.plan))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Plan non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getAllPlansTraitement = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const result = await this.planTraitementService.getAllPlansTraitement()
            return res
                .status(200)
                .json(jsonResponse('Liste des plans de traitement', true, result.plans))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPlansByPatient = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { patientId } = req.params
            if (!patientId) {
                return res.status(400).json(jsonResponse('patientId requis', false))
            }
            const result = await this.planTraitementService.getPlansByPatient(patientId)
            return res.status(200).json(jsonResponse('Plans du patient', true, result.plans))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPlansByKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { kineId } = req.params
            if (!kineId) {
                return res.status(400).json(jsonResponse('kineId requis', false))
            }
            const result = await this.planTraitementService.getPlansByKine(kineId)
            return res.status(200).json(jsonResponse('Plans du kiné', true, result.plans))
        } catch (error) {
            next(error)
        }
    }
}

export default PlanTraitementController
