
import { Resend } from 'resend';
import prisma from '@/lib/db';
import { newsletterSequence } from '@/lib/config/newsletter-content';

const resend = new Resend(process.env.RESEND_API_KEY);

const NEWSLETTER_INTERVAL_DAYS = Number(process.env.NEWSLETTER_INTERVAL_DAYS || 7);

export async function processNewsletterSequence() {
    // Suscriptores activos que necesitan el siguiente correo.
    // Por defecto avanza semanalmente; puede ajustarse con NEWSLETTER_INTERVAL_DAYS.
    const eligibleSince = new Date();
    eligibleSince.setDate(eligibleSince.getDate() - NEWSLETTER_INTERVAL_DAYS);

    const subscribers = await prisma.newsletter.findMany({
        where: {
            active: true,
            currentStep: { lt: newsletterSequence.length },
            lastSentAt: { lte: eligibleSince }
        }
    });

    for (const sub of subscribers) {
        const nextStep = sub.currentStep + 1;
        const emailContent = newsletterSequence.find(e => e.id === nextStep);

        if (emailContent) {
            try {
                await resend.emails.send({
                    from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
                    to: sub.email,
                    subject: emailContent.subject,
                    html: emailContent.content(sub.name || 'amigo/a')
                });

                // Actualizar en la DB
                await prisma.newsletter.update({
                    where: { id: sub.id },
                    data: {
                        currentStep: nextStep,
                        lastSentAt: new Date()
                    }
                });

            } catch (error) {
                console.error(`Newsletter send error step=${nextStep}:`, error);
            }
        }
    }
}
