import type { Types } from 'mongoose'
import Patient from '../../models/patient.model'
import type { CreatePatientInput, UpdatePatientInput } from './patient.interface'
import User from '../../models/user.model'

interface PatientServiceResult {
    success: boolean
    patient?: any
    message?: string
}

export default class PatientService {
    async createPatient(input: CreatePatientInput): Promise<PatientServiceResult> {
        // Vérifier si un patient existe déjà pour ce userId
        const exists = await Patient.findOne({ userId: input.userId })
        if (exists) {
            return { success: false, message: 'Un patient existe déjà pour cet utilisateur.' }
        }
        const patient = await Patient.create(input)
        return { success: true, message: 'Patient créé.', patient }
    }

    async getPatientById(
        patientId: string | Types.ObjectId,
        userId: string,
        role: string,
    ): Promise<PatientServiceResult> {
        const patient = await Patient.findById(patientId)
        if (!patient) {
            return { success: false, message: 'Patient non trouvé.' }
        }
        // Vérification d'accès : admin ou propriétaire
        if (role !== 'ADMIN' && String(patient.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        return { success: true, message: 'Patient trouvé.', patient }
    }

    async updatePatient(
        patientId: string | Types.ObjectId,
        input: UpdatePatientInput,
        userId: string,
        role: string,
    ): Promise<PatientServiceResult> {
        const patient = await Patient.findById(patientId)
        if (!patient) {
            return { success: false, message: 'Patient non trouvé.' }
        }
        if (role !== 'ADMIN' && String(patient.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        const updated = await Patient.findByIdAndUpdate(patientId, input, { new: true })
        return { success: true, message: 'Patient mis à jour.', patient: updated }
    }

    async deletePatient(
        patientId: string | Types.ObjectId,
        userId: string,
        role: string,
    ): Promise<PatientServiceResult> {
        const patient = await Patient.findById(patientId)
        if (!patient) {
            return { success: false, message: 'Patient non trouvé ou déjà supprimé.' }
        }
        if (role !== 'ADMIN' && String(patient.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        await Patient.findByIdAndDelete(patientId)
        // Suppression du User associé
        await User.findByIdAndDelete(patient.userId)
        return { success: true, message: 'Patient et utilisateur supprimés.' }
    }

    async getPatientByUserId(
        userId: string,
        requesterId: string,
        role: string,
    ): Promise<PatientServiceResult> {
        const patient = await Patient.findOne({ userId }).populate('userId')
        if (!patient) {
            return { success: false, message: 'Patient non trouvé.' }
        }
        // Vérification d'accès : admin ou propriétaire
        const userIdToCheck =
            typeof patient.userId === 'object' && patient.userId !== null && '_id' in patient.userId
                ? patient.userId._id
                : patient.userId
        if (role !== 'ADMIN' && String(userIdToCheck) !== String(requesterId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        return { success: true, message: 'Patient trouvé.', patient }
    }

    async getAllPatients(role: string): Promise<PatientServiceResult> {
        if (role !== 'ADMIN') {
            return { success: false, message: 'Accès refusé.' }
        }
        const patients = await Patient.find().populate('userId')
        return { success: true, message: 'Liste des patients.', patient: patients }
    }

    async searchPatients(query: any, role: string): Promise<PatientServiceResult> {
        if (role !== 'ADMIN') {
            return { success: false, message: 'Accès refusé.' }
        }
        // Construction du filtre de recherche
        const filter: any = {}
        if (query.nom) {
            filter['userId.nom'] = { $regex: query.nom, $options: 'i' }
        }
        if (query.email) {
            filter['userId.email'] = { $regex: query.email, $options: 'i' }
        }
        if (query.telephone) {
            filter.telephone = { $regex: query.telephone, $options: 'i' }
        }
        // On fait le populate puis le match côté JS (limitation de populate + regex)
        const patients = await Patient.find().populate('userId')
        const filtered = patients.filter((p: any) => {
            let match = true
            if (query.nom && !(p.userId?.nom ?? '').toLowerCase().includes(query.nom.toLowerCase()))
                match = false
            if (
                query.email &&
                !(p.userId?.email ?? '').toLowerCase().includes(query.email.toLowerCase())
            )
                match = false
            if (
                query.telephone &&
                !(p.telephone ?? '').toLowerCase().includes(query.telephone.toLowerCase())
            )
                match = false
            return match
        })
        return { success: true, message: 'Résultats de la recherche.', patient: filtered }
    }
}
