import type { Types } from 'mongoose'
import Kine from '../../models/kine.model'
import type { CreateKineInput, UpdateKineInput } from './kine.interface'
import User, { RoleEnum } from '../../models/user.model'

interface KineServiceResult {
    success: boolean
    kine?: any
    message?: string
}

export default class KineService {
    async createKine(input: CreateKineInput, role: string): Promise<KineServiceResult> {
        // Seul l'admin peut créer un kiné
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès refusé.' }
        }
        // Vérifier si un kiné existe déjà pour ce userId
        const exists = await Kine.findOne({ userId: input.userId })
        if (exists) {
            return { success: false, message: 'Un kiné existe déjà pour cet utilisateur.' }
        }
        const kine = await Kine.create(input)
        return { success: true, message: 'Kiné créé.', kine }
    }

    async getKineById(
        kineId: string | Types.ObjectId,
        userId: string,
        role: string,
    ): Promise<KineServiceResult> {
        let kine = await Kine.findById(kineId)
        if (!kine && typeof kineId === 'string' && kineId.length === 24) {
            kine = await Kine.findOne({ userId: kineId })
        }
        if (!kine) {
            return { success: false, message: 'Kiné non trouvé.' }
        }
        // Vérification d'accès : admin ou propriétaire
        if (role !== RoleEnum.ADMIN && String(kine.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        return { success: true, message: 'Kiné trouvé.', kine }
    }

    async updateKine(
        kineId: string | Types.ObjectId,
        input: UpdateKineInput,
        userId: string,
        role: string,
    ): Promise<KineServiceResult> {
        let kine = await Kine.findById(kineId)
        if (!kine && typeof kineId === 'string' && kineId.length === 24) {
            kine = await Kine.findOne({ userId: kineId })
        }
        if (!kine) {
            return { success: false, message: 'Kiné non trouvé.' }
        }
        if (role !== RoleEnum.ADMIN && String(kine.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        const updated = await Kine.findByIdAndUpdate(kine._id, input, { new: true })
        return { success: true, message: 'Kiné mis à jour.', kine: updated }
    }

    async deleteKine(
        kineId: string | Types.ObjectId,
        userId: string,
        role: string,
    ): Promise<KineServiceResult> {
        let kine = await Kine.findById(kineId)
        if (!kine && typeof kineId === 'string' && kineId.length === 24) {
            kine = await Kine.findOne({ userId: kineId })
        }
        if (!kine) {
            return { success: false, message: 'Kiné non trouvé ou déjà supprimé.' }
        }
        if (role !== RoleEnum.ADMIN && String(kine.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        await Kine.findByIdAndDelete(kine._id)
        // Suppression du User associé
        await User.findByIdAndDelete(kine.userId)
        return { success: true, message: 'Kiné et utilisateur supprimés.' }
    }

    async getKineByUserId(
        userId: string,
        requesterId: string,
        role: string,
    ): Promise<KineServiceResult> {
        const kine = await Kine.findOne({ userId }).populate('userId')
        if (!kine) {
            return { success: false, message: 'Kiné non trouvé.' }
        }
        // Vérification d'accès : admin ou propriétaire
        const userIdToCheck =
            typeof kine.userId === 'object' && kine.userId !== null && '_id' in kine.userId
                ? kine.userId._id
                : kine.userId
        if (role !== RoleEnum.ADMIN && String(userIdToCheck) !== String(requesterId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        return { success: true, message: 'Kiné trouvé.', kine }
    }

    async getAllKines(role: string): Promise<KineServiceResult> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès refusé.' }
        }
        const kines = await Kine.find().populate('userId')
        return { success: true, message: 'Liste des kinés.', kine: kines }
    }

    async searchKines(query: any, role: string): Promise<KineServiceResult> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès refusé.' }
        }
        // Recherche par nom ou prénom (insensible à la casse)
        const search = (query.nom || '').toLowerCase()
        const kines = await Kine.find().populate('userId')
        const filtered = kines.filter((k: any) => {
            if (!search) return true
            const nom = (k.userId?.nom ?? '').toLowerCase()
            const prenom = (k.userId?.prenom ?? '').toLowerCase()
            return nom.includes(search) || prenom.includes(search)
        })
        return { success: true, message: 'Résultats de la recherche.', kine: filtered }
    }
}
