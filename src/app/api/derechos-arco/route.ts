import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

const REQUEST_TYPES = new Set(['acceso', 'rectificacion', 'cancelacion', 'oposicion', 'portabilidad']);

const REQUEST_LABELS: Record<string, string> = {
    acceso: 'Acceso a datos',
    rectificacion: 'Rectificación',
    cancelacion: 'Cancelación / eliminación',
    oposicion: 'Oposición (baja newsletter)',
    portabilidad: 'Portabilidad',
};

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`arco:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();
        const type = typeof body?.type === 'string' ? body.type : '';
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const name = isNonEmptyString(body?.name, 200) ? body.name.trim() : '';
        const details = typeof body?.details === 'string' ? body.details.slice(0, 2000) : '';

        if (!REQUEST_TYPES.has(type) || !isEmail(email) || !name) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const label = REQUEST_LABELS[type];
        const resend = new Resend(process.env.RESEND_API_KEY);

        const escape = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', '\'': '&#39;' }[c] || c));

        await resend.emails.send({
            from: 'Derechos ARCO <notificaciones@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            replyTo: email,
            subject: `🛡️ Solicitud ARCO: ${label} — ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; color: #334155;">
                    <h1 style="color: #0891b2;">Solicitud de ejercicio de derechos ARCO</h1>
                    <p>Recibimos una solicitud a través del formulario /derechos-arco.</p>
                    <table style="border-collapse: collapse; margin: 20px 0;">
                        <tr><td style="padding: 6px 12px;"><strong>Tipo:</strong></td><td style="padding: 6px 12px;">${escape(label)}</td></tr>
                        <tr><td style="padding: 6px 12px;"><strong>Nombre:</strong></td><td style="padding: 6px 12px;">${escape(name)}</td></tr>
                        <tr><td style="padding: 6px 12px;"><strong>Email:</strong></td><td style="padding: 6px 12px;">${escape(email)}</td></tr>
                    </table>
                    ${details ? `
                        <h3>Detalles adicionales</h3>
                        <p style="background: #f1f5f9; padding: 14px; border-radius: 6px; white-space: pre-wrap;">${escape(details)}</p>
                    ` : ''}
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 0.85rem; color: #64748b;">
                        Recuerda: la Ley 21.719 exige responder esta solicitud dentro de 15 días hábiles.
                        Antes de resolver, verifica la identidad del solicitante respondiendo al mismo email registrado.
                    </p>
                </div>
            `,
        });

        // También le confirmamos al solicitante que recibimos su solicitud.
        await resend.emails.send({
            from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
            to: email,
            subject: 'Recibimos tu solicitud de derechos ARCO',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; color: #334155;">
                    <h2 style="color: #0891b2;">Hola ${escape(name.split(' ')[0])}</h2>
                    <p>Confirmamos que recibimos tu solicitud de <strong>${escape(label)}</strong>.</p>
                    <p>
                        Te responderemos personalmente a este mismo correo dentro de un plazo máximo
                        de 15 días hábiles, conforme a la Ley 21.719 sobre Protección de Datos Personales.
                    </p>
                    <p>
                        Si tu solicitud requiere aclaraciones adicionales, te contactaremos antes de ese plazo.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 0.85rem; color: #64748b;">Ps. Gustavo Caro — psgustavocaro.cl</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('ARCO submission error:', error);
        return NextResponse.json({ error: 'No fue posible procesar la solicitud' }, { status: 500 });
    }
}
