import mongoose from 'mongoose'
import logger from './logger' // à adapter si besoin

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/kinecabinet'

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI)
        logger.info('✅ Connexion à MongoDB réussie')
    } catch (error) {
        logger.error('❌ Erreur de connexion à MongoDB :', error)
        process.exit(1)
    }
}

export default connectDB
