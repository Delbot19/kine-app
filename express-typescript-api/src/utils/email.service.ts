import nodemailer from 'nodemailer'

interface EmailPayload {
    to: string
    subject: string
    html: string
}

export class EmailService {
    private readonly transporter: nodemailer.Transporter

    constructor() {
        // Check if SMTP config exists
        const hasConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

        if (hasConfig) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            })
            // eslint-disable-next-line no-console
            console.log('✅ EmailService: SMTP Configured')
        } else {
            // Fallback: JSON Transport for development (logs to console)
            this.transporter = nodemailer.createTransport({
                jsonTransport: true,
            })
            // eslint-disable-next-line no-console
            console.warn(
                '⚠️ EmailService: No SMTP Config found. Emails will be logged to console only.',
            )
        }
    }

    async sendEmail(payload: EmailPayload): Promise<boolean> {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM ?? '"PhysioCenter Contact" <no-reply@physiocenter.fr>',
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
            })

            if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
                // eslint-disable-next-line no-console
                console.log('📧 [DEV] Email Simulation:', info.message)
            }

            return true
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('❌ EmailService Error:', error)
            return false
        }
    }
}

export const emailService = new EmailService()
