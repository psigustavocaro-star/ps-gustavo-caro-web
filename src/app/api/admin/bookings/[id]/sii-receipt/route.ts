import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import {
    getInvoiceSessionSlots,
    getIssuedInvoiceSessionIds,
    getSessionAlignedAppointmentDates,
    stampIssuedInvoiceSessionIds,
} from '@/lib/invoice-sessions';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const issued = Boolean(body.issued);
        const sessionId = typeof body.sessionId === 'string' ? body.sessionId : null;

        const booking = await prisma.booking.findUnique({ where: { id } });

        if (!booking) {
            return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 });
        }

        if ((booking.status || '').toUpperCase() !== 'PAID') {
            return NextResponse.json(
                { success: false, error: 'Solo las reservas pagadas pueden marcarse con boleta SII' },
                { status: 400 }
            );
        }

        if (sessionId && !getInvoiceSessionSlots(booking).some((session) => session.id === sessionId)) {
            return NextResponse.json({ success: false, error: 'Sesión no válida para esta reserva' }, { status: 400 });
        }

        const slots = getInvoiceSessionSlots(booking);
        const nextIssuedSessionIds = sessionId
            ? issued
                ? Array.from(new Set([...getIssuedInvoiceSessionIds(booking), sessionId]))
                : getIssuedInvoiceSessionIds(booking).filter((id) => id !== sessionId)
            : [];
        const updatedDetails = stampIssuedInvoiceSessionIds(booking.details, nextIssuedSessionIds);

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: sessionId
                ? {
                    siiReceiptIssued: false,
                    siiReceiptIssuedAt: null,
                    details: updatedDetails,
                    appointmentDates: booking.appointmentDates.length ? getSessionAlignedAppointmentDates(booking) : booking.appointmentDates,
                }
                : {
                    siiReceiptIssued: issued,
                    siiReceiptIssuedAt: issued ? new Date() : null,
                    details: updatedDetails,
                    appointmentDates: booking.appointmentDates.length ? getSessionAlignedAppointmentDates(booking) : booking.appointmentDates,
                },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('SII receipt update error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}
