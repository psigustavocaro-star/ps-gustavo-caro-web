import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { templateId, target, specificEmail } = await request.json();

        if (!templateId) return NextResponse.json({ success: false, error: 'Newsletter no seleccionado' }, { status: 400 });

        const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
        if (!template) return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });

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

        console.log(`Sending newsletter "${template.title}" to ${recipients.length} recipients...`);

        // Enviamos en lotes o individualmente según la cuota
        // Para este MVP, enviamos uno por uno para personalizar el saludo (si se desea) o en Bcc
        // Usaremos lotes de Resend para eficiencia si es a todos
        
        if (target === 'all') {
            // Dividir en grupos de 50 (límite recomendado para evitar spam filters en algunos casos)
            for (let i = 0; i < recipients.length; i += 50) {
                const batch = recipients.slice(i, i + 50);
                await resend.emails.send({
                    from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                    to: 'psi.gustavocaro@gmail.com', // El profesional recibe una copia
                    bcc: batch,
                    subject: template.title,
                    html: template.content,
                });
            }
        } else {
            await resend.emails.send({
                from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                to: recipients[0],
                subject: template.title,
                html: template.content,
            });
        }

        return NextResponse.json({ success: true, count: recipients.length });
    } catch (error: any) {
        console.error('SEND NEWSLETTER ERROR:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
