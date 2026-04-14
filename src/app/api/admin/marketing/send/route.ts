import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templateId, recipientEmails } = body;

        console.log('MARKETING: Iniciando envío masivo:', { templateId, recipients: recipientEmails?.length });

        const template = await prisma.emailTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json({ success: false, error: 'Template no encontrado' });
        }

        // Envío uno a uno para personalización futura si es necesario
        // Pero Resend permite batch. Por ahora, para simplificar y asegurar entrega:
        const results = await Promise.allSettled(
            recipientEmails.map((email: string) => 
                resend.emails.send({
                    from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                    to: email,
                    subject: template.title,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
                            ${template.content.replace(/\n/g, '<br/>')}
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                            <p style="font-size: 0.8rem; color: #64748b; text-align: center;">
                                Has recibido este correo porque estás suscrito al newsletter de Ps. Gustavo Caro.<br/>
                                <a href="https://psgustavocaro.cl" style="color: #0891b2;">Visitar sitio web</a>
                            </p>
                        </div>
                    `
                })
            )
        );

        return NextResponse.json({ 
            success: true, 
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'fulfilled').length,
                failed: results.filter(r => r.status === 'rejected').length
            }
        });

    } catch (error: any) {
        console.error('Send API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
