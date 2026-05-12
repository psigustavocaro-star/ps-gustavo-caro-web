import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, sha256Hex, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Brute force mitigation in-memory (per server instance, best-effort)
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimit(ip: string): boolean {
    const now = Date.now();
    const rec = attempts.get(ip);
    if (!rec || now - rec.firstAt > WINDOW_MS) {
        attempts.set(ip, { count: 1, firstAt: now });
        return true;
    }
    rec.count += 1;
    return rec.count <= MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(ip)) {
        return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }, { status: 429 });
    }

    let body: { email?: string; password?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
    }
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    const expectedEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const expectedHash = (process.env.ADMIN_PASSWORD_SHA256 || '').trim().toLowerCase();

    if (!expectedEmail || !expectedHash) {
        return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 500 });
    }

    const submittedHash = await sha256Hex(password);

    let ok = email === expectedEmail;
    // Constant-time comparison
    if (submittedHash.length !== expectedHash.length) ok = false;
    else {
        let diff = 0;
        for (let i = 0; i < submittedHash.length; i++) {
            diff |= submittedHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
        }
        if (diff !== 0) ok = false;
    }

    if (!ok) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = await createSessionToken(email);
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
    });
    return res;
}
