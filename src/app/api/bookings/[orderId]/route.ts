import { NextRequest, NextResponse } from 'next/server';
import { calendarConfig } from '@/lib/config/services';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Import prisma dynamically to avoid build-time initialization
        const { default: prisma } = await import('@/lib/db');

        const booking = await prisma.booking.findUnique({
            where: { orderId },
            select: {
                serviceType: true,
                status: true,
                name: true,
                email: true,
                appointmentDate: true,
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

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
