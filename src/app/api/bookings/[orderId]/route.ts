import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calendarConfig } from '@/lib/config/services';

export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const orderId = params.orderId;

        const booking = await prisma.booking.findUnique({
            where: { orderId },
            select: {
                serviceType: true,
                status: true,
                name: true,
                email: true,
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Obtener el ID del evento según el tipo de servicio
        const eventTypeId = calendarConfig.calcom.eventTypes[booking.serviceType as keyof typeof calendarConfig.calcom.eventTypes] || '';

        return NextResponse.json({
            ...booking,
            eventTypeId
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
