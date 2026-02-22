import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        // Obtenemos los bookings ordenados por fecha y unimos con anamnesis por email
        const bookings = await prisma.booking.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Obtenemos los suscriptores del newsletter
        const newsletter = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const anamnesis = await prisma.anamnesis.findMany();

        const enrichedBookings = bookings.map((b: any) => ({
            ...b,
            anamnesis: anamnesis.find((a: any) => a.email.toLowerCase() === b.email.toLowerCase())
        }));

        return NextResponse.json({
            success: true,
            bookings: enrichedBookings,
            newsletter
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
