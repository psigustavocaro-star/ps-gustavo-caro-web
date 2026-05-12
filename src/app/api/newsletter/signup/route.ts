import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendNewsletterWelcome } from '@/lib/services/mail';
import { isEmail, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

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

        await prisma.newsletter.upsert({
            where: { email },
            update: { active: true, name: name || undefined },
            create: { email, name: name || undefined }
        });

        sendNewsletterWelcome(email, name).catch(err => console.error('Silent newsletter mail error:', err));

        return NextResponse.json({ success: true, message: 'Suscripción exitosa' });
    } catch (error) {
        console.error('Newsletter error:', error);
        return NextResponse.json({ error: 'No fue posible procesar la solicitud' }, { status: 500 });
    }
}
