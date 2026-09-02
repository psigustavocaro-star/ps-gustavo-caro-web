import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { sendProfessionalCancellationEmail } from '@/lib/services/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';
        const sent = await sendProfessionalCancellationEmail({
            patientName: 'María',
            email: 'psi.gustavocaro@gmail.com',
            appointmentDate: '2026-09-07T15:00:00.000Z',
            rescheduleUrl: `${baseUrl}/agendar`,
        });

        return NextResponse.json({ success: true, id: sent?.id });
    } catch (error) {
        console.error('Error sending cancellation email test:', error);
        return NextResponse.json({ success: false, error: 'No fue posible enviar el correo de prueba' }, { status: 500 });
    }
}
