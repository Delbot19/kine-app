import 'module-alias/register'
import 'dotenv/config'
import validateEnv, { DEFAULT_ENV } from '@utils/validateEnv'
import App from './app'
import connectDB from './config/dbconnect'
import AuthController from './resources/auth/auth.controller'
import PatientController from './resources/patient/patient.controller'
import UserController from './resources/user/user.controller'
import KineController from './resources/kine/kine.controller'
import RendezVousController from './resources/rendezvous/rendezvous.controller'
import AdminController from './resources/admin/admin.controller'
import PlanTraitementController from './resources/plantraitement/plantraitement.controller'
import ExerciseController from './resources/exercise/exercise.controller'
import RessourceEducativeController from './resources/ressourceeducative/ressourceeducative.controller'

validateEnv()

const start = async (): Promise<void> => {
    await connectDB()
    const app = new App(
        [
            new AuthController(),
            new PatientController(),
            new KineController(),
            new UserController(),
            new RendezVousController(),
            new AdminController(),
            new PlanTraitementController(),
            new ExerciseController(),
            new RessourceEducativeController(),
        ],
        Number(process.env.PORT ?? DEFAULT_ENV.PORT),
    )
    app.listen()
}

void start()
