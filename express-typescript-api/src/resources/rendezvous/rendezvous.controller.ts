import { Router, type Request, type Response, type NextFunction } from 'express'
import RendezVousService from './rendezvous.service'
import { createRendezVousSchema, updateRendezVousSchema } from './rendezvous.validation'
import zodValidator from '../../middleware/zod-validator.middleware'
import jsonResponse from '../../utils/jsonResponse'
import authMiddleware from '../../middleware/auth.middleware'
import { RoleEnum } from '../../models/user.model'

class RendezVousController {
    public path = '/rdvs'
    public router = Router()
    private readonly rendezVousService = new RendezVousService()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.get('/cabinet-hours', this.getCabinetHours)
        this.router.post(
            '/',
            authMiddleware,
            zodValidator(createRendezVousSchema),
            this.createRendezVous,
        )
        this.router.get('/', authMiddleware, this.getRendezVousByKineAndDate)
        this.router.get('/patients/:kineId', authMiddleware, this.getPatientsByKine)
        this.router.get('/patients/:kineId/search', authMiddleware, this.searchPatientsByKine)
        this.router.put(
            '/:id',
            authMiddleware,
            zodValidator(updateRendezVousSchema),
            this.updateRendezVous,
        )
        this.router.delete('/:id', authMiddleware, this.deleteRendezVous)
        this.router.patch('/:id/confirm', authMiddleware, this.confirmRendezVous)
        this.router.patch('/:id/complete', authMiddleware, this.completeRendezVous)
        this.router.patch('/:id/cancel', authMiddleware, this.cancelRendezVous)
    }

    private readonly getCabinetHours = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Response => {
        const hours = RendezVousService.getCabinetHours()
        return res.status(200).json(jsonResponse('Horaires du cabinet', true, hours))
    }

    private readonly createRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { user } = req as any
            if (!user) {
                return res.status(401).json(jsonResponse('Non authentifié', false))
            }
            const { role, userId } = user
            const body = { ...req.body }
            if (role === RoleEnum.PATIENT) {
                body.patientId = userId
                if (!body.kineId) {
                    return res
                        .status(400)
                        .json(jsonResponse('Le champ kineId est requis pour un patient', false))
                }
            } else if (role === RoleEnum.KINE) {
                body.kineId = userId
                if (!body.patientId) {
                    return res
                        .status(400)
                        .json(jsonResponse('Le champ patientId est requis pour un kiné', false))
                }
            } else {
                return res
                    .status(403)
                    .json(
                        jsonResponse(
                            'Seuls les patients ou kinés peuvent créer un rendez-vous',
                            false,
                        ),
                    )
            }
            const result = await this.rendezVousService.createRendezVous(body)
            if (result.success) {
                return res
                    .status(201)
                    .json(jsonResponse('Rendez-vous créé', true, result.rendezvous))
            }
            return res.status(400).json(jsonResponse(result.message ?? 'Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getRendezVousByKineAndDate = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { kineId, date } = req.query
            if (!kineId || !date) {
                return res.status(400).json(jsonResponse('kineId et date requis', false))
            }
            // Ne retourner que les rendez-vous à venir
            const result = await this.rendezVousService.getRendezVousByKineAndDate(
                String(kineId),
                String(date),
                { onlyUpcoming: true },
            )
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Liste des rendez-vous', true, result.rendezvous))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Aucun rendez-vous', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly getPatientsByKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { kineId } = req.params
            const result = await this.rendezVousService.getPatientsByKine(kineId)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Liste des patients du kiné', true, result.rendezvous))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Aucun patient', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly searchPatientsByKine = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { kineId } = req.params
            const search = (req.query.q as string) || ''
            const result = await this.rendezVousService.searchPatientsByKine(kineId, search)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Résultats de la recherche', true, result.rendezvous))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Aucun patient', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly updateRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.rendezVousService.updateRendezVous(id, req.body)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Rendez-vous mis à jour', true, result.rendezvous))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Rendez-vous non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly deleteRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.rendezVousService.deleteRendezVous(id)
            if (result.success) {
                return res.status(200).json(jsonResponse('Rendez-vous supprimé', true))
            }
            return res
                .status(404)
                .json(jsonResponse(result.message ?? 'Rendez-vous non trouvé', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly confirmRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.rendezVousService.confirmRendezVous(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Rendez-vous confirmé', true, result.rendezvous))
            }
            return res.status(400).json(jsonResponse(result.message ?? 'Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly completeRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.rendezVousService.completeRendezVous(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Rendez-vous terminé', true, result.rendezvous))
            }
            return res.status(400).json(jsonResponse(result.message ?? 'Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }

    private readonly cancelRendezVous = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> => {
        try {
            const { id } = req.params
            const result = await this.rendezVousService.cancelRendezVous(id)
            if (result.success) {
                return res
                    .status(200)
                    .json(jsonResponse('Rendez-vous annulé', true, result.rendezvous))
            }
            return res.status(400).json(jsonResponse(result.message ?? 'Erreur', false, result))
        } catch (error) {
            next(error)
        }
    }
}

export default RendezVousController
