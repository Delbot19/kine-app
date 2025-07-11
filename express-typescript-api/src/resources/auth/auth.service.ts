import User, { RoleEnum, type IUser } from '../../models/user.model'
import type { RegisterInput, LoginInput } from './auth.interface'
import { hashPassword, comparePassword } from '../../utils/bcrypt'
import { generateToken } from '../../utils/jwt'

export default class AuthService {
    async register(input: RegisterInput): Promise<any> {
        // Vérifier si l'email existe déjà
        const existing = (await User.findOne({ email: input.email })) as IUser
        if (existing) {
            return { success: false, message: 'Email déjà utilisé.' }
        }
        // Hasher le mot de passe
        const hashed = await hashPassword(input.motDePasse)
        // Créer l'utilisateur
        const user: IUser = await User.create({
            nom: input.nom,
            prenom: input.prenom,
            email: input.email,
            motDePasse: hashed,
            role: input.role ?? RoleEnum.PATIENT,
        })
        // Générer le token
        const userObj = user.toObject()
        const { motDePasse, ...userSafe } = userObj
        // eslint-disable-next-line no-underscore-dangle
        const token = generateToken({
            userId: String((userSafe as { _id: string })._id),
            email: user.email,
            role: user.role,
        })
        // Retourner la réponse sans le mot de passe
        return { success: true, message: 'Inscription réussie', token, user: userSafe }
    }

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
