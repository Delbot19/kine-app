import { Router, type Request, type Response, type NextFunction } from 'express'
import PatientService from './patient.service'
import { createPatientSchema, updatePatientSchema } from './patient.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import jsonResponse from '../../utils/jsonResponse'
import authMiddleware from '../../middleware/auth.middleware'

class PatientController {
    public path = '/patients'
    public router = Router()
    private readonly patientService = new PatientService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.post('/', authMiddleware, zodValidator(createPatientSchema), this.createPatient)
        this.router.get('/:id', authMiddleware, this.getPatientById)
        this.router.put(
            '/:id',
            authMiddleware,
            zodValidator(updatePatientSchema),
            this.updatePatient,
        )
        this.router.delete('/:id', authMiddleware, this.deletePatient)
    }

    private readonly createPatient = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            // userId injecté par le middleware d'auth (ex: req.user.userId ou req.user._id)
            const userId = (req as any).user?.userId || (req as any).user?._id
            if (!userId) {
                return res.status(401).json(jsonResponse('Non authentifié', false))
            }
            // On ajoute userId au body avant d'appeler le service
            const result = await this.patientService.createPatient({ ...req.body, userId })
            if (result.success) {
                return res.status(201).json(jsonResponse('Patient créé', true, result.patient))
            }
            return res
                .status(400)
                .json(jsonResponse('Erreur lors de la création du patient', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPatientById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.patientService.getPatientById(id, userId, role)
            if (result.success) {
                return res.status(200).json(jsonResponse('Patient trouvé', true, result.patient))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Patient non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly updatePatient = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.patientService.updatePatient(id, req.body, userId, role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Patient mis à jour', true, result.patient))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Patient non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly deletePatient = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const userId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.patientService.deletePatient(id, userId, role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse(result.message ?? 'Patient supprimé', true))
            }
            return res
                .status(404)
                .json(
                    jsonResponse(
                        result.message ?? 'Patient non trouvé ou déjà supprimé',
                        false,
                        result,
                    ),
                )
        } catch (error) {
            next(error)
        }
    }
}

export default PatientController
