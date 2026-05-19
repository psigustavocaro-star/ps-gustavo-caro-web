import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { sanitizeHtml } from '@/lib/services/html-sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

const isEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

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

        const subscriberMap = new Map<string, string>();
        
        const allSubs = await prisma.newsletter.findMany({ where: { active: true } });
        allSubs.forEach(s => subscriberMap.set(normalizeEmail(s.email), s.name || ''));
        
        let targetEmails: string[] = [];

        if (target === 'all') {
            targetEmails = allSubs.map(s => normalizeEmail(s.email));
        } else if (target === 'specific' && specificEmail) {
            const email = normalizeEmail(specificEmail);
            targetEmails = [email];
            if (!subscriberMap.has(email)) {
                const b = await prisma.booking.findFirst({ where: { email }});
                subscriberMap.set(email, b ? (b.firstName || b.name || '') : '');
            }
        }

        targetEmails = Array.from(new Set(targetEmails)).filter(isEmail);

        if (targetEmails.length === 0) {
            return NextResponse.json({ success: false, error: 'No hay destinatarios' }, { status: 400 });
        }

        const results: Array<{ email: string; success: boolean; error?: string }> = [];

        // Send one by one so the bulk path behaves like the proven individual path.
        const CHUNK_SIZE = 1;
        for (let i = 0; i < targetEmails.length; i += CHUNK_SIZE) {
            const chunk = targetEmails.slice(i, i + CHUNK_SIZE);
            
            const chunkResults = await Promise.all(chunk.map(async (email) => {
                let fullName = subscriberMap.get(email) || 'Paciente';
                if (!fullName.trim() || fullName === 'undefined') fullName = 'Paciente';
                
                const firstName = fullName.split(' ')[0]; // We use just the first name for closeness
                
                let personalizedContent = finalContent;
                // Replace variations of the placeholder
                personalizedContent = personalizedContent.replace(/\[\s*Nombre del Paciente\s*\]/gi, firstName);
                personalizedContent = personalizedContent.replace(/\[\s*Nombre\s*\]/gi, firstName);
                const safeHtml = sanitizeHtml(personalizedContent);

                try {
                    const resendData = await resend.emails.send({
                        from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                        to: email,
                        subject: String(finalTitle).slice(0, 200),
                        html: safeHtml,
                    });

                    if (resendData.error) {
                        const message = resendData.error.message || 'Resend rechazó el envío';
                        console.error(`Error sending to ${email}:`, resendData.error);
                        return { email, success: false, error: message };
                    }

                    return { email, success: true };
                } catch (error: any) {
                    const message = error?.message || 'Error inesperado al enviar';
                    console.error(`Error sending to ${email}:`, error);
                    return { email, success: false, error: message };
                }
            }));
            results.push(...chunkResults);
            // Slight delay between chunks
            await new Promise(r => setTimeout(r, 200));
        }

        const failed = results.filter(result => !result.success);
        const sentCount = results.length - failed.length;

        return NextResponse.json({
            success: sentCount > 0 && failed.length === 0,
            partial: sentCount > 0 && failed.length > 0,
            count: results.length,
            sentCount,
            failedCount: failed.length,
            failed,
            error: sentCount === 0 ? 'No se pudo enviar a ningún destinatario' : undefined,
        }, { status: sentCount > 0 ? 200 : 502 });
    } catch (error: any) {
        console.error('SEND NEWSLETTER ERROR:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error del servidor de correos' }, { status: 500 });
    }
}
