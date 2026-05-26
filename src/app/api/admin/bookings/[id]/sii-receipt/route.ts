import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const issued = Boolean(body.issued);

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

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                siiReceiptIssued: issued,
                siiReceiptIssuedAt: issued ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error('SII receipt update error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}
