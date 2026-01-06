export interface UpdateUserInput {
    nom?: string
    prenom?: string
    email?: string
    motDePasse?: string
}

export interface ChangePasswordInput {
    oldPassword: string
    newPassword: string
}
