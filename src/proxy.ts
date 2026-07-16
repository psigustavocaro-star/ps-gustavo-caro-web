import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const config = {
    matcher: ['/admingustavo/:path*', '/api/admin/:path*'],
};

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (session) return NextResponse.next();

    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // La página administrativa puede renderizar su formulario de acceso.
    // El login vive en /api/auth/admin y no coincide con el matcher protegido.
    return NextResponse.next();
}
