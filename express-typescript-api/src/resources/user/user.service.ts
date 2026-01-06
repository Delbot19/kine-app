import User from '../../models/user.model'
import { hashPassword, comparePassword } from '../../utils/bcrypt'
import type { UpdateUserInput, ChangePasswordInput } from './user.interface'

interface UserServiceResult {
    success: boolean
    user?: any
    message?: string
}

export default class UserService {
    async updateUser(userId: string, input: UpdateUserInput): Promise<UserServiceResult> {
        // Si motDePasse présent, on le hash
        const updateData = { ...input }
        if (updateData.motDePasse) {
            updateData.motDePasse = await hashPassword(updateData.motDePasse)
        }
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé.' }
        }
        const { motDePasse, ...userSafe } = user.toObject()
        return { success: true, user: userSafe }
    }

    async changePassword(userId: string, input: ChangePasswordInput): Promise<UserServiceResult> {
        const user = await User.findById(userId).select('+motDePasse')
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé.' }
        }

        const isValid = await comparePassword(input.oldPassword, user.motDePasse)
        if (!isValid) {
            return { success: false, message: 'Ancien mot de passe incorrect.' }
        }

        user.motDePasse = await hashPassword(input.newPassword)
        await user.save()

        return { success: true, message: 'Mot de passe mis à jour avec succès.' }
    }
}
