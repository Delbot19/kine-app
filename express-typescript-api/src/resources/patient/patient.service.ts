import type { Types } from 'mongoose'
import Patient from '../../models/patient.model'
import type { CreatePatientInput, UpdatePatientInput } from './patient.interface'
import User, { RoleEnum } from '../../models/user.model'

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
        let patient = await Patient.findById(patientId)
        if (!patient && typeof patientId === 'string' && patientId.length === 24) {
            // Peut-être un userId
            patient = await Patient.findOne({ userId: patientId })
        }
        if (!patient) {
            return { success: false, message: 'Patient non trouvé.' }
        }
        // Vérification d'accès : admin ou propriétaire
        if (role !== RoleEnum.ADMIN && String(patient.userId) !== String(userId)) {
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
        let patient = await Patient.findById(patientId)
        if (!patient && typeof patientId === 'string' && patientId.length === 24) {
            patient = await Patient.findOne({ userId: patientId })
        }
        if (!patient) {
            return { success: false, message: 'Patient non trouvé.' }
        }
        if (role !== RoleEnum.ADMIN && String(patient.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        const updated = await Patient.findByIdAndUpdate(patient._id, input, { new: true })
        return { success: true, message: 'Patient mis à jour.', patient: updated }
    }

    async deletePatient(
        patientId: string | Types.ObjectId,
        userId: string,
        role: string,
    ): Promise<PatientServiceResult> {
        let patient = await Patient.findById(patientId)
        if (!patient && typeof patientId === 'string' && patientId.length === 24) {
            patient = await Patient.findOne({ userId: patientId })
        }
        if (!patient) {
            return { success: false, message: 'Patient non trouvé ou déjà supprimé.' }
        }
        if (role !== RoleEnum.ADMIN && String(patient.userId) !== String(userId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        await Patient.findByIdAndDelete(patient._id)
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
        if (role !== RoleEnum.ADMIN && String(userIdToCheck) !== String(requesterId)) {
            return { success: false, message: 'Accès refusé.' }
        }
        return { success: true, message: 'Patient trouvé.', patient }
    }

    async getAllPatients(role: string): Promise<PatientServiceResult> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès refusé.' }
        }
        const patients = await Patient.find().populate('userId')
        return { success: true, message: 'Liste des patients.', patient: patients }
    }

    async searchPatients(query: any, role: string): Promise<PatientServiceResult> {
        if (role !== RoleEnum.ADMIN) {
            return { success: false, message: 'Accès refusé.' }
        }
        // Recherche par nom ou prénom (insensible à la casse)
        const search = (query.nom || '').toLowerCase()
        const patients = await Patient.find().populate('userId')
        const filtered = patients.filter((p: any) => {
            if (!search) return true
            const nom = (p.userId?.nom ?? '').toLowerCase()
            const prenom = (p.userId?.prenom ?? '').toLowerCase()
            return nom.includes(search) || prenom.includes(search)
        })
        return { success: true, message: 'Résultats de la recherche.', patient: filtered }
    }
}
