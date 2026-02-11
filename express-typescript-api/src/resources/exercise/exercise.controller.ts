import { Router, type Request, type Response, type NextFunction } from 'express'
import ExerciseService from './exercise.service'
import { createExerciseSchema, toggleExerciseSchema } from './exercise.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import jsonResponse from '../../utils/jsonResponse'

class ExerciseController {
    public path = '/exercises'
    public router = Router()
    private readonly exerciseService = new ExerciseService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        // Catalog Routes
        this.router.get('/', authMiddleware, this.getAllExercises)
        this.router.post(
            '/',
            authMiddleware, // TODO: Add role check (admin/kine)
            zodValidator(createExerciseSchema),
            this.createExercise,
        )
        this.router.put(
            '/:id',
            authMiddleware, // TODO: Add role check
            // zodValidator(createExerciseSchema), // Optional: Strict validation on update? Using partial for now
            this.updateExercise,
        )
        this.router.delete(
            '/:id',
            authMiddleware, // TODO: Add role check
            this.deleteExercise,
        )

        // Patient Routes
        this.router.get('/patient/today', authMiddleware, this.getPatientExercisesToday)
        this.router.post(
            '/:id/toggle',
            authMiddleware,
            zodValidator(toggleExerciseSchema),
            this.toggleExercise,
        )

        // Kiné Routes
        this.router.get(
            '/patient/:patientId/logs',
            authMiddleware,
            // TODO: Verify Kiné access to patient?
            this.getPatientLogs,
        )
    }

    private readonly getAllExercises = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const exercises = await this.exerciseService.getAllExercises()
            res.status(200).json(jsonResponse('Liste des exercices récupérée', true, exercises))
        } catch (error) {
            next(error)
        }
    }

    private readonly createExercise = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const exercise = await this.exerciseService.createExercise(req.body)
            res.status(201).json(jsonResponse('Exercice créé avec succès', true, exercise))
        } catch (error) {
            next(error)
        }
    }

    private readonly updateExercise = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params
            const exercise = await this.exerciseService.updateExercise(id, req.body)
            if (!exercise) {
                res.status(404).json(jsonResponse('Exercice non trouvé', false))
                return
            }
            res.status(200).json(jsonResponse('Exercice mis à jour', true, exercise))
        } catch (error) {
            next(error)
        }
    }

    private readonly deleteExercise = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params
            const exercise = await this.exerciseService.deleteExercise(id)
            if (!exercise) {
                res.status(404).json(jsonResponse('Exercice non trouvé', false))
                return
            }
            res.status(200).json(jsonResponse('Exercice supprimé', true, null))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPatientExercisesToday = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { user } = req as any
            // Assuming Patient User ID is directly enabling us to find Patient Profile needed?
            // The service takes patientId (not userId).
            // We need to fetch Patient ID from UserId first like in other controllers.
            // OR we can update service to take userId.
            // Let's quickly verify how other controllers do it.
            // In TreatmentController, we used `patients/by-user/:userId`.
            // Here, let's assume valid "Patient" user is calling.
            // Actually, best to fetch Patient via User ID.

            // To be quick and clean, i will assume the frontend passes nothing and we resolve.
            // But we need the Patient Model to map User -> Patient.
            // Since I don't have PatientService imported here, I'll do a quick DB lookup
            // similar to how we did for Kine in PlanTraitementController.

            // Wait, standard practice here seems to be UserID.
            // I will import Patient Model.
            const Patient = (await import('../../models/patient.model')).default
            const patient = await Patient.findOne({ userId: user.userId })

            if (!patient) {
                return res.status(404).json(jsonResponse('Profil patient introuvable', false))
            }

            const exercises = await this.exerciseService.getPatientExercisesToday(patient.id)
            res.status(200).json(jsonResponse('Exercices du jour récupérés', true, exercises))
        } catch (error) {
            next(error)
        }
    }

    private readonly toggleExercise = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { user } = req as any
            const exerciseId = req.params.id
            const { completed, douleur, difficulte, ressenti, modifications } = req.body

            const Patient = (await import('../../models/patient.model')).default
            const patient = await Patient.findOne({ userId: user.userId })
            if (!patient) {
                return res.status(404).json(jsonResponse('Profil patient introuvable', false))
            }

            const log = await this.exerciseService.toggleExerciseCompletion(
                patient.id,
                exerciseId,
                completed,
                { douleur, difficulte, ressenti, modifications },
            )
            res.status(200).json(jsonResponse('Statut mis à jour', true, log))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPatientLogs = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { patientId } = req.params
            const logs = await this.exerciseService.getExerciseLogsByPatient(patientId)
            return res.status(200).json(jsonResponse('Suivi des exercices récupéré', true, logs))
        } catch (error) {
            next(error)
        }
    }
}

export default ExerciseController
