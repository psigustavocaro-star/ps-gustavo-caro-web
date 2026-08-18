import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Resend } from 'resend';
import { isEmail, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';

function generateToken(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendConfirmationEmail(email: string, name: string, token: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const confirmUrl = `${BASE_URL}/newsletter/confirmar?email=${encodeURIComponent(email)}&t=${token}`;
    await resend.emails.send({
        from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
        to: email,
        subject: '👋 Confirma tu suscripción al newsletter',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                <h2 style="color: #0891b2;">Un último paso, ${name || 'hola'}</h2>
                <p>Recibiste este correo porque te suscribiste al newsletter de Ps. Gustavo Caro.</p>
                <p>Para completar tu suscripción y empezar a recibir recursos de salud mental, confirma haciendo click aquí:</p>
                <p style="text-align: center; margin: 32px 0;">
                    <a href="${confirmUrl}"
                       style="background: #0891b2; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Confirmar suscripción
                    </a>
                </p>
                <p style="font-size: 0.85rem; color: #64748b;">
                    Si el botón no funciona, copia este enlace: <br/>
                    <code style="word-break: break-all;">${confirmUrl}</code>
                </p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 0.8rem; color: #94a3b8;">
                    Si no fuiste tú quien pidió suscribirse, ignora este correo — no se hará nada.
                </p>
            </div>
        `,
    });
}

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';

        if (!isEmail(email)) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        const token = generateToken();

        // Doble opt-in: creamos/actualizamos como INACTIVO hasta que confirme por email.
        // Si ya estaba confirmado antes, no lo re-desactivamos (idempotente).
        const existing = await prisma.newsletter.findUnique({ where: { email } });

        if (existing?.confirmedAt) {
            // Ya estaba confirmado — respondemos success sin re-enviar email.
            return NextResponse.json({
                success: true,
                alreadySubscribed: true,
                message: 'Ya estás suscrito. ¡Gracias!',
            });
        }

        await prisma.newsletter.upsert({
            where: { email },
            update: { name: name || undefined, confirmationToken: token, active: false },
            create: { email, name: name || undefined, confirmationToken: token, active: false },
        });

        await sendConfirmationEmail(email, name, token);

        return NextResponse.json({
            success: true,
            pendingConfirmation: true,
            message: 'Te enviamos un correo para confirmar tu suscripción.',
        });
    } catch (error) {
        console.error('Newsletter signup error:', error);
        return NextResponse.json({ error: 'No fue posible procesar la solicitud' }, { status: 500 });
    }
}
