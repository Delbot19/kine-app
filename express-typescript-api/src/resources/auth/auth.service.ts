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
        // Vérifier si le compte est actif
        if (!user.actif) {
            return {
                success: false,
                message: "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
            }
        }
        // Générer le token
        const userObj = user.toObject()
        const { motDePasse, ...userSafe } = userObj
        // eslint-disable-next-line no-underscore-dangle
        const token = generateToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        })
        return { success: true, message: 'Connexion réussie', token, user: userSafe }
    }

    async getCurrentUser(userId: string): Promise<any> {
        const user = await User.findById(userId)
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' }
        }
        const userObj = user.toObject()
        const { motDePasse, ...userSafe } = userObj
        return { success: true, user: userSafe }
    }

    async setupAccount(input: { token: string; motDePasse: string }): Promise<any> {
        const { verifyToken } = await import('../../utils/jwt')
        const { hashPassword } = await import('../../utils/bcrypt')

        // 1. Verify token
        const payload = verifyToken(input.token)
        if (!payload || payload.type !== 'setup') {
            return { success: false, message: 'Lien invalide ou expiré.' }
        }

        // 2. Find User
        const user = await User.findById(payload.userId)
        if (!user) {
            return { success: false, message: 'Utilisateur introuvable.' }
        }

        // 3. Update Password
        const hashed = await hashPassword(input.motDePasse)
        user.motDePasse = hashed
        await user.save()

        // 4. Auto-login (Return token)
        const userObj = user.toObject()
        const { motDePasse, ...userSafe } = userObj
        const { generateToken: genToken } = await import('../../utils/jwt')
        const authToken = genToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        })

        return {
            success: true,
            message: 'Compte configuré avec succès.',
            token: authToken,
            user: userSafe,
        }
    }

    async forgotPassword(email: string): Promise<any> {
        const user = await User.findOne({ email })
        if (!user) {
            return { success: false, message: 'Aucun utilisateur trouvé avec cet email.' }
        }

        const crypto = await import('crypto')
        const token = crypto.randomBytes(20).toString('hex')

        user.resetPasswordToken = token
        user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour

        await user.save()

        // In a real app, send email here.
        // For now, return token to mimic email sent
        return { success: true, message: 'Email de réinitialisation envoyé (simulé).', token }
    }

    async resetPassword(token: string, motDePasse: string): Promise<any> {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) {
            return {
                success: false,
                message: 'Le lien de réinitialisation est invalide ou a expiré.',
            }
        }

        const { hashPassword } = await import('../../utils/bcrypt')
        user.motDePasse = await hashPassword(motDePasse)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save()

        return { success: true, message: 'Mot de passe réinitialisé avec succès.' }
    }
}
