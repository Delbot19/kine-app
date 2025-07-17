import type { Types } from 'mongoose'
import RendezVous from '../../models/rendezvous.model'
import type { CreateRendezVousInput, UpdateRendezVousInput } from './rendezvous.interface'
import Patient from '../../models/patient.model'
import Kine from '../../models/kine.model'
import {
    CABINET_OPENING_HOUR,
    CABINET_CLOSING_HOUR,
    CABINET_OPEN_DAYS,
} from '../../config/cabinetHours'

interface RendezVousServiceResult {
    success: boolean
    rendezvous?: any
    message?: string
}

export default class RendezVousService {
    async createRendezVous(input: CreateRendezVousInput): Promise<RendezVousServiceResult> {
        // Vérifier que le patient et le kiné existent
        const patient = await Patient.findById(input.patientId)
        const kine = await Kine.findById(input.kineId)
        if (!patient || !kine) {
            return { success: false, message: 'Patient ou kiné introuvable.' }
        }
        // Vérifier horaires d'ouverture
        const debut = new Date(input.date)
        const fin = new Date(debut.getTime() + (input.duree ?? 30) * 60000)
        const day = debut.getDay() // 0 = dimanche, 1 = lundi, ...
        const heureDebut = debut.getHours() + debut.getMinutes() / 60
        const heureFin = fin.getHours() + fin.getMinutes() / 60
        if (
            !CABINET_OPEN_DAYS.includes(day) ||
            heureDebut < CABINET_OPENING_HOUR ||
            heureFin > CABINET_CLOSING_HOUR
        ) {
            return { success: false, message: 'Le cabinet est fermé à cet horaire.' }
        }
        // Vérifier qu'il n'y a pas déjà un RDV à ce créneau pour ce kiné
        const conflit = await RendezVous.findOne({
            kineId: input.kineId,
            date: {
                $lt: fin,
                $gte: debut,
            },
        })
        if (conflit) {
            return { success: false, message: 'Créneau déjà réservé pour ce kiné.' }
        }
        const rendezvous = await RendezVous.create({
            ...input,
            duree: input.duree ?? 30,
            statut: 'en attente',
            paiementEffectue: false,
        })
        return { success: true, message: 'Rendez-vous créé.', rendezvous }
    }

    async getRendezVousByKineAndDate(
        kineId: string,
        date: string,
        options?: { onlyUpcoming?: boolean },
    ): Promise<RendezVousServiceResult> {
        // Chercher tous les RDV d'un kiné pour un jour donné
        const day = new Date(date)
        const start = new Date(day.setHours(0, 0, 0, 0))
        const end = new Date(day.setHours(23, 59, 59, 999))
        const query: any = {
            kineId,
            date: { $gte: start, $lte: end },
        }
        if (options?.onlyUpcoming) {
            query.statut = 'à venir'
        }
        const rendezvous = await RendezVous.find(query).populate('patientId')
        return { success: true, message: 'Liste des rendez-vous.', rendezvous }
    }

    async getPatientsByKine(kineId: string): Promise<RendezVousServiceResult> {
        // Liste unique des patients ayant eu au moins un RDV avec ce kiné
        const rdvs = await RendezVous.find({ kineId }).populate('patientId')
        const patientsMap = new Map()
        rdvs.forEach((rdv: any) => {
            if (rdv.patientId) {
                patientsMap.set(String(rdv.patientId._id), rdv.patientId)
            }
        })
        return {
            success: true,
            message: 'Liste des patients du kiné.',
            rendezvous: Array.from(patientsMap.values()),
        }
    }

    async updateRendezVous(
        rdvId: string | Types.ObjectId,
        input: UpdateRendezVousInput,
    ): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        // (Optionnel) Vérifier conflits si date/durée changent
        if (input.date ?? input.duree) {
            const debut = input.date ? new Date(input.date) : rdv.date
            const duree = input.duree ?? rdv.duree
            const fin = new Date(debut.getTime() + duree * 60000)
            const conflit = await RendezVous.findOne({
                _id: { $ne: rdvId },
                kineId: rdv.kineId,
                date: {
                    $lt: fin,
                    $gte: debut,
                },
            })
            if (conflit) {
                return { success: false, message: 'Créneau déjà réservé pour ce kiné.' }
            }
        }
        const updated = await RendezVous.findByIdAndUpdate(rdvId, input, { new: true })
        return { success: true, message: 'Rendez-vous mis à jour.', rendezvous: updated }
    }

    async deleteRendezVous(rdvId: string | Types.ObjectId): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé ou déjà supprimé.' }
        }
        await RendezVous.findByIdAndDelete(rdvId)
        return { success: true, message: 'Rendez-vous supprimé.' }
    }

    async confirmRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut !== 'en attente') {
            return { success: false, message: 'Le rendez-vous ne peut pas être confirmé.' }
        }
        rdv.statut = 'à venir'
        rdv.paiementEffectue = true
        await rdv.save()
        return { success: true, message: 'Rendez-vous confirmé.', rendezvous: rdv }
    }

    async completeRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut !== 'à venir') {
            return {
                success: false,
                message: 'Seuls les rendez-vous à venir peuvent être terminés.',
            }
        }
        rdv.statut = 'terminé'
        await rdv.save()
        return { success: true, message: 'Rendez-vous terminé.', rendezvous: rdv }
    }

    async cancelRendezVous(rdvId: string): Promise<RendezVousServiceResult> {
        const rdv = await RendezVous.findById(rdvId)
        if (!rdv) {
            return { success: false, message: 'Rendez-vous non trouvé.' }
        }
        if (rdv.statut === 'annulé' || rdv.statut === 'terminé') {
            return { success: false, message: 'Le rendez-vous ne peut pas être annulé.' }
        }
        rdv.statut = 'annulé'
        await rdv.save()
        return { success: true, message: 'Rendez-vous annulé.', rendezvous: rdv }
    }

    // Helper pour exposer les horaires d'ouverture au front
    static getCabinetHours(): { openingHour: number; closingHour: number; openDays: number[] } {
        return {
            openingHour: CABINET_OPENING_HOUR,
            closingHour: CABINET_CLOSING_HOUR,
            openDays: CABINET_OPEN_DAYS,
        }
    }
}
