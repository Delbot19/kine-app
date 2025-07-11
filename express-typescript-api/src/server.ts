import 'module-alias/register'
import 'dotenv/config'
import validateEnv, { DEFAULT_ENV } from '@utils/validateEnv'
import App from './app'
import connectDB from './config/dbconnect'
import AuthController from './resources/auth/auth.controller'

validateEnv()

const start = async (): Promise<void> => {
    await connectDB()
    const app = new App([new AuthController()], Number(process.env.PORT ?? DEFAULT_ENV.PORT))
    app.listen()
}

void start()
