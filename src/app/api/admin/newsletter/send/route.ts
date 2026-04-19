import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { templateId, target, specificEmail, customTitle, customContent } = await request.json();
        
        let finalTitle = customTitle;
        let finalContent = customContent;

        if (templateId) {
            const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
            if (template) {
                if (!finalTitle) finalTitle = template.title;
                if (!finalContent) finalContent = template.content;
            }
        }

        if (!finalTitle || !finalContent) {
            return NextResponse.json({ success: false, error: 'Newsletter no seleccionado o contenido en blanco' }, { status: 400 });
        }

        let recipients: string[] = [];

        if (target === 'all') {
            const subs = await prisma.newsletter.findMany({ where: { active: true } });
            recipients = subs.map(s => s.email);
        } else if (target === 'specific' && specificEmail) {
            recipients = [specificEmail];
        }

        if (recipients.length === 0) {
            return NextResponse.json({ success: false, error: 'No hay destinatarios' }, { status: 400 });
        }

        console.log(`Sending newsletter "${finalTitle}" to ${recipients.length} recipients...`);
        
        if (target === 'all') {
            for (let i = 0; i < recipients.length; i += 50) {
                const batch = recipients.slice(i, i + 50);
                const resendData = await resend.emails.send({
                    from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                    to: 'psi.gustavocaro@gmail.com',
                    bcc: batch,
                    subject: finalTitle,
                    html: finalContent,
                });
                if (resendData.error) throw new Error(resendData.error.message);
            }
        } else {
            const resendData = await resend.emails.send({
                from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                to: recipients[0],
                subject: finalTitle,
                html: finalContent,
            });
            if (resendData.error) throw new Error(resendData.error.message);
        }

        return NextResponse.json({ success: true, count: recipients.length });
    } catch (error: any) {
        console.error('SEND NEWSLETTER ERROR:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error del servidor de correos' }, { status: 500 });
    }
}
