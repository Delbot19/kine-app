import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

export interface JwtPayload {
    userId: string
    email: string
    role: string
    type?: 'auth' | 'setup'
}

export function generateToken(
    payload: JwtPayload,
    expiresIn: string | number = JWT_EXPIRES_IN,
): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    })
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (error) {
        return null
    }
}
