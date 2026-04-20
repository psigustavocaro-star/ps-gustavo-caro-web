import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, ...updateData } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
        }

        // Actualizamos todas las reservas de este email para mantener la consistencia del 'paciente'
        await prisma.booking.updateMany({
            where: { email: email.toLowerCase().trim() },
            data: {
                firstName: updateData.firstName,
                secondName: updateData.secondName,
                firstSurname: updateData.firstSurname,
                secondSurname: updateData.secondSurname,
                name: `${updateData.firstName} ${updateData.secondName} ${updateData.firstSurname} ${updateData.secondSurname}`.replace(/\s+/g, ' ').trim(),
                rut: updateData.rut,
                address: updateData.address,
                region: updateData.region,
                commune: updateData.commune,
                country: updateData.country,
                phone: updateData.phone
            }
        });

        return NextResponse.json({ success: true, message: 'Paciente actualizado correctamente' });
    } catch (error: any) {
        console.error('ADMIN PATIENT UPDATE ERROR:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
        }

        // Buscamos primero las reservas para cancelarlas en Google Calendar/Cal.com
        const userBookings = await prisma.booking.findMany({
            where: { email: email.toLowerCase().trim() }
        });

        // Cancelamos cada cita externa
        for (const booking of userBookings) {
            if (booking.calBookingId) {
                // Import dinámico para no romper si corre top-level
                const { cancelCalBooking } = await import('@/lib/services/calcom');
                await cancelCalBooking(booking.calBookingId, 'Paciente eliminado del sistema administrativo.');
            }
        }

        // Eliminamos todas las reservas asociadas a este paciente (Historial Clínico) localmente
        await prisma.booking.deleteMany({
            where: { email: email.toLowerCase().trim() }
        });

        // Eliminamos anamnesis asociada
        await prisma.anamnesis.deleteMany({
            where: { email: email.toLowerCase().trim() }
        });

        // Eliminamos registro del newsletter (Borrado total del CRM)
        await prisma.newsletter.deleteMany({
            where: { email: email.toLowerCase().trim() }
        });

        return NextResponse.json({ success: true, message: 'Paciente eliminado del sistema completamente' });
    } catch (error: any) {
        console.error('ADMIN PATIENT DELETE ERROR:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
