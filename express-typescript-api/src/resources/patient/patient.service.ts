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
}
