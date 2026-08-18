import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { logConsent } from '@/lib/services/consent-log';
import { rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

async function handle(email: string, token: string, ip: string, userAgent: string | null) {
    const rl = rateLimit(`confirm:${ip}`, 20, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    if (!email || !token) {
        return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const record = await prisma.newsletter.findUnique({ where: { email } });
    if (!record || record.confirmationToken !== token) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    if (record.confirmedAt) {
        return NextResponse.json({ success: true, alreadyConfirmed: true });
    }

    await prisma.newsletter.update({
        where: { email },
        data: {
            active: true,
            confirmedAt: new Date(),
            confirmationToken: null,
        },
    });

    await logConsent({
        email,
        type: 'newsletter',
        granted: true,
        context: 'newsletter-double-optin',
        ip,
        userAgent,
    });

    return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const ua = request.headers.get('user-agent');
    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const token = typeof body?.token === 'string' ? body.token : '';
        return await handle(email, token, ip, ua);
    } catch {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const ua = request.headers.get('user-agent');
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();
    const token = searchParams.get('t') || '';
    return await handle(email, token, ip, ua);
}
