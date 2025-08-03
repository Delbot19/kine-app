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
        this.router.post('/', zodValidator(createPatientSchema), this.createPatient)
        this.router.get('/by-user/:userId', authMiddleware, this.getPatientByUserId)
        this.router.get('/', authMiddleware, this.getAllPatients)
        this.router.get('/search', authMiddleware, this.searchPatients)
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
            const result = await this.patientService.createPatient(req.body)
            if (result.success) {
                return res.status(201).json(jsonResponse('Patient créé', true, result))
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

    private readonly getPatientByUserId = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { userId } = req.params
            const requesterId = (req as any).user?.userId || (req as any).user?._id
            const role = (req as any).user?.role
            const result = await this.patientService.getPatientByUserId(userId, requesterId, role)
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

    private readonly getAllPatients = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            const result = await this.patientService.getAllPatients(role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Liste des patients', true, result.patient))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message ?? 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly searchPatients = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const role = (req as any).user?.role
            // Recherche uniquement par nom (ex: /patients/search?nom=Durand)
            const { nom } = req.query
            const result = await this.patientService.searchPatients({ nom }, role)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Résultats de la recherche', true, result.patient))
            }
            return res
                .status(403)
                .json(jsonResponse(result.message ?? 'Accès refusé', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default PatientController
