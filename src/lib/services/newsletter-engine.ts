
import { Resend } from 'resend';
import prisma from '@/lib/db';
import { newsletterSequence } from '@/lib/config/newsletter-content';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processNewsletterSequence() {
    // 1. Suscriptores activos que necesitan el siguiente correo (14 días desde el último)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const subscribers = await prisma.newsletter.findMany({
        where: {
            active: true,
            currentStep: { lt: newsletterSequence.length },
            lastSentAt: { lte: fourteenDaysAgo }
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
