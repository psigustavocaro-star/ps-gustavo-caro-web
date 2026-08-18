import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// Ruta protegida por el middleware /api/admin/* con la cookie de sesión.
// Devuelve el histórico de consentimientos para un email dado.
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = (searchParams.get('email') || '').trim().toLowerCase();
        if (!email) {
            return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
        }

        const consents = await prisma.consentLog.findMany({
            where: { email },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });

        return NextResponse.json({ success: true, consents });
    } catch (error) {
        console.error('Admin consent-log error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
