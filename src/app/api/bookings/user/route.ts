import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    try {
        // Buscar el paciente por email y traer sus reservas
        const patient = await prisma.booking.findFirst({
            where: { email: email.toLowerCase() },
            orderBy: { createdAt: 'desc' },
            include: {
                // Asumiendo que hay una relación o que podemos traer múltiples bookings
            }
        });

        if (!patient) {
            return NextResponse.json({ success: false, message: 'Paciente no encontrado' });
        }

        // Traer todas las reservas del mismo email
        const allBookings = await prisma.booking.findMany({
            where: { email: email.toLowerCase() },
            orderBy: { appointmentDate: 'desc' }
        });

        return NextResponse.json({
            success: true,
            patient: {
                ...patient,
                bookings: allBookings
            }
        });
    } catch (error: any) {
        console.error('Error fetching patient data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
