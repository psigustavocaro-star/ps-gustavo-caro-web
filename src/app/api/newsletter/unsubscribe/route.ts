import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyUnsubscribeToken } from '@/lib/util/unsubscribe';
import { isEmail, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

async function handle(email: string, token: string, ip: string) {
    const rl = rateLimit(`unsub:${ip}`, 20, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    if (!isEmail(email) || !token) {
        return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const valid = await verifyUnsubscribeToken(email, token);
    if (!valid) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    await prisma.newsletter.updateMany({
        where: { email: email.toLowerCase() },
        data: { active: false },
    });

    return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const token = typeof body?.token === 'string' ? body.token : '';
        return await handle(email, token, ip);
    } catch (error) {
        console.error('unsubscribe error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Permite un one-click desde el email (algunos clientes de correo abren el link como GET).
    const ip = ipFromHeaders(request.headers);
    try {
        const { searchParams } = new URL(request.url);
        const email = (searchParams.get('email') || '').trim().toLowerCase();
        const token = searchParams.get('t') || '';
        return await handle(email, token, ip);
    } catch (error) {
        console.error('unsubscribe error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
