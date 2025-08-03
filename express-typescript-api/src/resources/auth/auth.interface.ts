import { type RoleEnum } from '../../models/user.model'

export interface LoginInput {
    email: string
    motDePasse: string
}

// Sert à typer le contenu du token JWT
export interface JwtPayload {
    userId: string
    email: string
    role: RoleEnum
}
