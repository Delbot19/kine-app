import mongoose from 'mongoose'
import logger from './logger' // à adapter si besoin

const DATABASE_URL = process.env.DATABASE_URL ?? 'mongodb://localhost:27017/kinecabinet'

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(DATABASE_URL)
        logger.info('✅ Connexion à MongoDB réussie')
    } catch (error) {
        logger.error({ err: error }, '❌ Erreur de connexion à MongoDB :')
        process.exit(1)
    }
}

export default connectDB
