import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/db';
import { sanitizeHtml } from '@/lib/services/html-sanitize';
import { createUnsubscribeToken, unsubscribeUrl } from '@/lib/util/unsubscribe';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templateId, recipientEmails } = body;

        if (typeof templateId !== 'string' || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
            return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
        }
        if (recipientEmails.length > 500) {
            return NextResponse.json({ success: false, error: 'Máximo 500 destinatarios por envío' }, { status: 400 });
        }

        const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
        if (!template) {
            return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 });
        }

        const safeContent = sanitizeHtml(template.content.replace(/\n/g, '<br/>'));
        const safeTitle = String(template.title).slice(0, 200);

        const validEmails = recipientEmails.filter(
            (email: unknown): email is string => typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
        );

        const results = await Promise.allSettled(
            validEmails.map(async (email: string) => {
                const token = await createUnsubscribeToken(email);
                const unsubUrl = unsubscribeUrl(BASE_URL, email, token);
                return resend.emails.send({
                    from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                    to: email,
                    subject: safeTitle,
                    headers: {
                        // RFC 8058 one-click unsubscribe
                        'List-Unsubscribe': `<${unsubUrl}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
                            ${safeContent}
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                            <p style="font-size: 0.8rem; color: #64748b; text-align: center;">
                                Recibes este correo porque estás suscrito al newsletter de Ps. Gustavo Caro.<br/>
                                <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline;">Darme de baja</a>
                                &nbsp;·&nbsp;
                                <a href="https://psgustavocaro.cl" style="color: #0891b2;">Sitio web</a>
                            </p>
                        </div>
                    `
                });
            })
        );

        return NextResponse.json({
            success: true,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'fulfilled').length,
                failed: results.filter(r => r.status === 'rejected').length
            }
        });

    } catch (error) {
        console.error('Send API Error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
