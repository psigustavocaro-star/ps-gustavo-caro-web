import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'PAID',
                appointmentDate: {
                    gte: new Date().toISOString() // Solo futuras
                }
            },
            select: {
                appointmentDate: true
            }
        });

        // Formatear al formato que CustomCalendar espera: 'YYYY-MM-DD HH:MM'
        const occupiedSlots = bookings.map(b => {
            const date = new Date(b.appointmentDate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        });

        return NextResponse.json({ success: true, occupiedSlots });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch occupied slots' }, { status: 500 });
    }
}
