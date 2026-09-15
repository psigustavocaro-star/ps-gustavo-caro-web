import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import {
    getCompletedSessionNumbers,
    getInvoiceSessionSlots,
    getSessionAlignedAppointmentDates,
    stampCompletedSessionNumbers,
} from '@/lib/invoice-sessions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const sessionNumber = Number(body.sessionNumber);
        const completed = Boolean(body.completed);
        const booking = await prisma.booking.findUnique({ where: { id } });

        if (!booking || (booking.status || '').toUpperCase() !== 'PAID') {
            return NextResponse.json({ success: false, error: 'No se encontró una reserva pagada.' }, { status: 404 });
        }

        const slots = getInvoiceSessionSlots(booking);
        if (!Number.isInteger(sessionNumber) || !slots.some((slot) => slot.number === sessionNumber)) {
            return NextResponse.json({ success: false, error: 'La sesión indicada no pertenece a este proceso.' }, { status: 400 });
        }

        const current = getCompletedSessionNumbers(booking);
        const next = completed
            ? Array.from(new Set([...current, sessionNumber]))
            : current.filter((number) => number !== sessionNumber);
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                details: stampCompletedSessionNumbers(booking.details, next),
                appointmentDates: booking.appointmentDates.length ? getSessionAlignedAppointmentDates(booking) : booking.appointmentDates,
            },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('Session status update error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible actualizar el estado de la sesión.' }, { status: 500 });
    }
}
