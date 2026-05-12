import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { sanitizeHtml } from '@/lib/services/html-sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

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

        let subscriberMap = new Map<string, string>();
        
        const allSubs = await prisma.newsletter.findMany({ where: { active: true } });
        allSubs.forEach(s => subscriberMap.set(s.email, s.name || ''));
        
        let targetEmails: string[] = [];

        if (target === 'all') {
            targetEmails = allSubs.map(s => s.email);
        } else if (target === 'specific' && specificEmail) {
            targetEmails = [specificEmail];
            if (!subscriberMap.has(specificEmail)) {
                const b = await prisma.booking.findFirst({ where: { email: specificEmail }});
                subscriberMap.set(specificEmail, b ? (b.firstName || b.name || '') : '');
            }
        }

        if (targetEmails.length === 0) {
            return NextResponse.json({ success: false, error: 'No hay destinatarios' }, { status: 400 });
        }

        // Chunk sizes of 10 to avoid rate limit spikes but process fast enough
        const CHUNK_SIZE = 10;
        for (let i = 0; i < targetEmails.length; i += CHUNK_SIZE) {
            const chunk = targetEmails.slice(i, i + CHUNK_SIZE);
            
            await Promise.all(chunk.map(async (email) => {
                let fullName = subscriberMap.get(email) || 'Paciente';
                if (!fullName.trim() || fullName === 'undefined') fullName = 'Paciente';
                
                const firstName = fullName.split(' ')[0]; // We use just the first name for closeness
                
                let personalizedContent = finalContent;
                // Replace variations of the placeholder
                personalizedContent = personalizedContent.replace(/\[\s*Nombre del Paciente\s*\]/gi, firstName);
                personalizedContent = personalizedContent.replace(/\[\s*Nombre\s*\]/gi, firstName);
                const safeHtml = sanitizeHtml(personalizedContent);

                const resendData = await resend.emails.send({
                    from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                    to: email,
                    subject: String(finalTitle).slice(0, 200),
                    html: safeHtml,
                });
                
                if (resendData.error) {
                    console.error(`Error sending to ${email}:`, resendData.error);
                }
            }));
            // Slight delay between chunks
            await new Promise(r => setTimeout(r, 200));
        }

        return NextResponse.json({ success: true, count: targetEmails.length });
    } catch (error: any) {
        console.error('SEND NEWSLETTER ERROR:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error del servidor de correos' }, { status: 500 });
    }
}
