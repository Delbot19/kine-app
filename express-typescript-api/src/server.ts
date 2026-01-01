import 'module-alias/register'
import 'dotenv/config'
import validateEnv, { DEFAULT_ENV } from '@utils/validateEnv'
import App from './app'
import connectDB from './config/dbconnect'
import AuthController from './resources/auth/auth.controller'
import PatientController from './resources/patient/patient.controller'
import KineController from './resources/kine/kine.controller'
import RendezVousController from './resources/rendezvous/rendezvous.controller'
import AdminController from './resources/admin/admin.controller'
import PlanTraitementController from './resources/plantraitement/plantraitement.controller'
import autoCancelRendezVousJob from './jobs/autoCancelRendezVous'
import logger from './config/logger'

validateEnv()

const start = async (): Promise<void> => {
    await connectDB()
    const app = new App(
        [
            new AuthController(),
            new PatientController(),
            new KineController(),
            new RendezVousController(),
            new AdminController(),
            new PlanTraitementController(), // Added this
        ],
        Number(process.env.PORT ?? DEFAULT_ENV.PORT),
    )
    app.listen()
    // Lancer le job d'annulation automatique toutes les 5 minutes
    setInterval(
        () => {
            logger.info('Lancement du job autoCancelRendezVousJob')
            autoCancelRendezVousJob().catch(logger.error)
        },
        5 * 60 * 1000,
    )
}

void start()
