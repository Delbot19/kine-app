import User from '../../models/user.model'
import type { LoginInput } from './auth.interface'
import { comparePassword } from '../../utils/bcrypt'
import { generateToken } from '../../utils/jwt'

export default class AuthService {
    async login(input: LoginInput): Promise<any> {
        // Chercher l'utilisateur
        const user = await User.findOne({ email: input.email })
        if (!user) {
            return { success: false, message: 'Email ou mot de passe incorrect.' }
        }
        // Vérifier le mot de passe
        const valid = await comparePassword(input.motDePasse, user.motDePasse)
        if (!valid) {
            return { success: false, message: 'Email ou mot de passe incorrect.' }
        }
        // Générer le token
        const userObj = user.toObject()
        const { motDePasse, ...userSafe } = userObj
        // eslint-disable-next-line no-underscore-dangle
        const token = generateToken({
            userId: String((userSafe as { _id: string })._id),
            email: user.email,
            role: user.role,
        })
        return { success: true, message: 'Connexion réussie', token, user: userSafe }
    }
}
