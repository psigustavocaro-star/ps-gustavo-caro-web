import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const config = {
    matcher: ['/admingustavo/:path*', '/api/admin/:path*'],
};

export async function middleware(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (session) return NextResponse.next();

    const isApi = request.nextUrl.pathname.startsWith('/api/');
    if (isApi) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // /admingustavo without session: let the page render its login form
    // The login form posts to /api/admin/login which is intentionally NOT under /api/admin/* matcher rules
    // (we only protect /api/admin/* — login route lives at /api/auth/admin instead, see route file)
    return NextResponse.next();
}
