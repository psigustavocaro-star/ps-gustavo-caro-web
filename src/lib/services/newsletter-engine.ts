import { Resend } from 'resend';
import prisma from '@/lib/db';
import { newsletterSequence } from '@/lib/config/newsletter-content';
import { createUnsubscribeToken, unsubscribeUrl } from '@/lib/util/unsubscribe';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';

const NEWSLETTER_INTERVAL_DAYS = Number(process.env.NEWSLETTER_INTERVAL_DAYS || 7);

function appendUnsubscribeFooter(html: string, unsubUrl: string): string {
    const footer = `
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 0.8rem; color: #64748b; text-align: center;">
            Recibes este correo porque te suscribiste al newsletter de Ps. Gustavo Caro.<br/>
            <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
        </p>
    `;
    return html + footer;
}

export async function processNewsletterSequence() {
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
                const token = await createUnsubscribeToken(sub.email);
                const unsubUrl = unsubscribeUrl(BASE_URL, sub.email, token);
                const html = appendUnsubscribeFooter(
                    emailContent.content(sub.name || 'amigo/a'),
                    unsubUrl
                );

                await resend.emails.send({
                    from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
                    to: sub.email,
                    subject: emailContent.subject,
                    headers: {
                        'List-Unsubscribe': `<${unsubUrl}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                    html,
                });

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
