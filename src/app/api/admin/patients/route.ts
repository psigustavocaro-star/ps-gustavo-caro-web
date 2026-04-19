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

        // Eliminamos todas las reservas asociadas a este paciente
        await prisma.booking.deleteMany({
            where: { email: email.toLowerCase().trim() }
        });

        // También podríamos eliminar su suscripción si se desea, 
        // pero por ahora mantendremos el borrado de historial clínico (bookings).
        // Si quieres borrarlo del newsletter también:
        // await prisma.newsletter.delete({ where: { email: email.toLowerCase().trim() } }).catch(() => {});

        return NextResponse.json({ success: true, message: 'Historial del paciente eliminado' });
    } catch (error: any) {
        console.error('ADMIN PATIENT DELETE ERROR:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
