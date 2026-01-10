import { Router, type Request, type Response, type NextFunction } from 'express'
import { emailService } from '@/utils/email.service'
import { z } from 'zod'

const contactController = Router()

// Validation Schema
const ContactSchema = z.object({
    name: z.string().min(2, 'Le nom est trop court'),
    email: z.string().email('Email invalide'),
    subject: z.string().min(3, "L'objet est trop court"),
    message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

contactController.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Validate Input
        const validatedData = ContactSchema.parse(req.body)
        const { name, email, subject, message } = validatedData

        // 2. Prepare Email Content
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        <p><strong>De:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #4b5563;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          Ce message a été envoyé via le formulaire de contact de PhysioCenter.
        </p>
      </div>
    `

        // 3. Send Email (to the Admin/Clinic)
        // You typically send TO the clinic email, FROM the user (or system on behalf of user)
        // The "to" address should be configured in env, defaulting to the same as user for testing implies self-sending,
        // but better to hardcode a placeholder or use env variable for ADMIN_EMAIL.
        const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@physiocenter.fr'

        const success = await emailService.sendEmail({
            to: adminEmail,
            subject: `[Contact] ${subject}`,
            html: emailHtml,
        })

        if (!success) {
            return res
                .status(500)
                .json({ success: false, message: "Erreur lors de l'envoi de l'email." })
        }

        // 4. Send simplified confirmation to user (Optional, skipping for now to keep it simple, or we can add it)

        res.status(200).json({
            success: true,
            message:
                'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors,
            })
        }
        next(error)
    }
})

export default contactController
