import RendezVous from '../models/rendezvous.model'
import logger from '../config/logger'

const AUTO_CANCEL_DELAY_MINUTES = 5

const autoCancelRendezVousJob = async (): Promise<void> => {
    const now = new Date()
    const threshold = new Date(now.getTime() - AUTO_CANCEL_DELAY_MINUTES * 60 * 1000)
    const result = await RendezVous.updateMany(
        {
            statut: 'en attente',
            createdAt: { $lt: threshold },
        },
        {
            $set: { statut: 'annulé' },
        },
    )
    if (result.modifiedCount > 0) {
        logger.info(`[AUTO-CANCEL] ${result.modifiedCount} rendez-vous annulés automatiquement.`)
    }
}
export default autoCancelRendezVousJob
