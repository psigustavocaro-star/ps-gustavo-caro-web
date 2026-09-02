import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { createRescheduleToken } from '@/lib/auth/reschedule-link';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const bookingId = typeof body.bookingId === 'string' ? body.bookingId : '';
        const appointmentIndex = Number.isInteger(body.appointmentIndex) ? body.appointmentIndex : 0;
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking || booking.status !== 'PAID') {
            return NextResponse.json({ success: false, error: 'No se encontró una reserva pagada' }, { status: 404 });
        }

        const appointments = booking.appointmentDates.length > 0
            ? booking.appointmentDates
            : booking.appointmentDate ? [booking.appointmentDate] : [];
        const originalAppointmentDate = appointments[appointmentIndex];
        if (!originalAppointmentDate) {
            return NextResponse.json({ success: false, error: 'La sesión seleccionada no tiene fecha' }, { status: 400 });
        }

        const token = await createRescheduleToken({ bookingId, appointmentIndex, originalAppointmentDate });
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';
        return NextResponse.json({ success: true, url: `${baseUrl}/reagendar/${token}` });
    } catch (error) {
        console.error('Error creating reschedule link:', error);
        return NextResponse.json({ success: false, error: 'No fue posible crear el enlace' }, { status: 500 });
    }
}
