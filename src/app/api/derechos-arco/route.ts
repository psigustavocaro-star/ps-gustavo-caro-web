import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';
import { buildArcoExport } from '@/lib/services/arco-export';

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

        // Si es una solicitud de acceso o portabilidad, generamos el export
        // completo y lo adjuntamos al correo interno para que el profesional
        // pueda reenviarlo con un click.
        const shouldAttachExport = type === 'acceso' || type === 'portabilidad';
        let attachments: Array<{ filename: string; content: string }> | undefined;
        let exportSummary = '';

        if (shouldAttachExport) {
            try {
                const data = await buildArcoExport(email);
                const jsonString = JSON.stringify(data, null, 2);
                const base64 = Buffer.from(jsonString, 'utf-8').toString('base64');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                attachments = [
                    {
                        filename: `datos-personales-${email.split('@')[0]}-${timestamp}.json`,
                        content: base64,
                    },
                ];
                exportSummary = `
                    <p style="background: #ecfeff; border-left: 3px solid #0891b2; padding: 12px 14px; border-radius: 4px;">
                        📎 <strong>Adjunto:</strong> archivo JSON con todos los datos que tenemos sobre este email
                        (${data.reservas.length} reserva(s), ${data.consentimientos.length} consentimiento(s) registrado(s)).
                        <br/><br/>
                        <strong>Antes de reenviar al solicitante</strong>:
                        <ol style="margin: 6px 0 0 20px; padding: 0;">
                            <li>Verifica su identidad respondiendo a su correo o pidiendo un dato adicional.</li>
                            <li>Cuando confirmes, reenvía este mismo email al solicitante.</li>
                        </ol>
                    </p>
                `;
            } catch (exportErr) {
                console.error('ARCO export build error:', exportErr);
                exportSummary = `
                    <p style="background: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 14px; border-radius: 4px;">
                        ⚠️ No se pudo generar el export automático. Consulta el admin manualmente.
                    </p>
                `;
            }
        }

        await resend.emails.send({
            from: 'Derechos ARCO <notificaciones@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            replyTo: email,
            subject: `🛡️ Solicitud ARCO: ${label} — ${name}`,
            attachments,
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
                    ${exportSummary}
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 0.85rem; color: #64748b;">
                        Recuerda: la Ley 21.719 exige responder esta solicitud dentro de 15 días hábiles.
                        Antes de resolver, verifica la identidad del solicitante respondiendo al mismo email registrado.
                    </p>
                </div>
            `,
        });

        // Confirmación al solicitante
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
