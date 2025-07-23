import User from '../../models/user.model'
import { hashPassword } from '../../utils/bcrypt'
import type { UpdateUserInput } from './user.interface'

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
}
