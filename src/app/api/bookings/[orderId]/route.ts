import { NextRequest, NextResponse } from 'next/server';
import { calendarConfig } from '@/lib/config/services';
import { rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Endpoint público consumido por /pago/exito. Solo devuelve lo mínimo
// necesario para renderizar el calendario post-pago — sin PII (email/nombre).
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`booking-get:${ip}`, 30, 5 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const { orderId } = await params;
        if (!/^[A-Z]+-\d+-[A-Za-z0-9-]+$/.test(orderId)) {
            return NextResponse.json({ error: 'Order id inválido' }, { status: 400 });
        }

        const { default: prisma } = await import('@/lib/db');

        const booking = await prisma.booking.findUnique({
            where: { orderId },
            select: {
                serviceType: true,
                status: true,
                appointmentDate: true,
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const eventTypeId =
            calendarConfig.calcom.eventTypes[
                booking.serviceType as keyof typeof calendarConfig.calcom.eventTypes
            ] || '';

        return NextResponse.json({
            serviceType: booking.serviceType,
            status: booking.status,
            appointmentDate: booking.appointmentDate,
            eventTypeId,
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
