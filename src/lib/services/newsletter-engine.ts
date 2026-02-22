
import { Resend } from 'resend';
import prisma from '@/lib/db';
import { newsletterSequence } from '@/lib/config/newsletter-content';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processNewsletterSequence() {
    console.log('Iniciando procesamiento de secuencia de newsletter...');

    // 1. Buscar suscriptores activos que necesitan el siguiente correo (han pasado 14 días)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const subscribers = await prisma.newsletter.findMany({
        where: {
            active: true,
            currentStep: { lt: newsletterSequence.length },
            lastSentAt: { lte: fourteenDaysAgo }
        }
    });

    console.log(`Encontrados ${subscribers.length} suscriptores para actualizar.`);

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

                console.log(`Email ${nextStep} enviado a ${sub.email}`);
            } catch (error) {
                console.error(`Error enviando email a ${sub.email}:`, error);
            }
        }
    }
}
