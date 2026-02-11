import { Schema, model, type Document } from 'mongoose'

// eslint-disable-next-line no-shadow
export enum RoleEnum {
    ADMIN = 'admin',
    KINE = 'kine',
    PATIENT = 'patient',
}

export interface IUser extends Document {
    nom: string
    prenom: string
    email: string
    motDePasse: string
    role: RoleEnum
    actif: boolean
    dateInscription: Date
    resetPasswordToken?: string
    resetPasswordExpires?: Date
}

const userSchema = new Schema<IUser>({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.PATIENT },
    actif: { type: Boolean, default: true },
    dateInscription: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
})

export default model<IUser>('User', userSchema)
