import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getInvoiceSessionSlots, getIssuedInvoiceSessionIds, stampIssuedInvoiceSessionIds } from '@/lib/invoice-sessions';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: sessionId
                ? {
                    siiReceiptIssued: false,
                    siiReceiptIssuedAt: null,
                    details: stampIssuedInvoiceSessionIds(
                        booking.details,
                        issued
                            ? Array.from(new Set([...getIssuedInvoiceSessionIds(booking), sessionId]))
                            : getIssuedInvoiceSessionIds(booking).filter((id) => id !== sessionId),
                    ),
                }
                : {
                    siiReceiptIssued: issued,
                    siiReceiptIssuedAt: issued ? new Date() : null,
                    // Una boleta única reemplaza cualquier registro previo por sesión.
                    details: stampIssuedInvoiceSessionIds(booking.details, []),
                },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('SII receipt update error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}
