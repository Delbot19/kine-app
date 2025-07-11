import { type RoleEnum } from '../../models/user.model'

export interface LoginInput {
    email: string
    motDePasse: string
}

export interface RegisterInput {
    nom: string
    prenom: string
    email: string
    motDePasse: string
    role?: RoleEnum
}

// Sert à typer le contenu du token JWT
export interface JwtPayload {
    userId: string
    email: string
    role: RoleEnum
}
