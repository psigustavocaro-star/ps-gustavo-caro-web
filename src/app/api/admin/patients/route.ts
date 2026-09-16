import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export async function PUT(request: NextRequest) {
    try {
        const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
        if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { email, ...updateData } = body;

        if (typeof email !== 'string' || !email.trim()) {
            return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
        const patientData = {
            firstName: text(updateData.firstName) || null,
            secondName: text(updateData.secondName) || null,
            firstSurname: text(updateData.firstSurname) || null,
            secondSurname: text(updateData.secondSurname) || null,
            rut: text(updateData.rut) || null,
            address: text(updateData.address) || null,
            region: text(updateData.region) || null,
            commune: text(updateData.commune) || null,
            country: text(updateData.country) || 'Chile',
            phone: text(updateData.phone) || null,
        };
        const fullName = [patientData.firstName, patientData.secondName, patientData.firstSurname, patientData.secondSurname]
            .filter(Boolean)
            .join(' ');

        // La ficha administrativa se alimenta de las reservas. Si la persona
        // tiene acceso al portal, actualizamos también su perfil para que el
        // mismo nombre se vea en ambos lugares.
        await prisma.$transaction([
            prisma.booking.updateMany({
                where: { email: normalizedEmail },
                data: { ...patientData, name: fullName || null },
            }),
            prisma.patientAccount.updateMany({
                where: { email: normalizedEmail },
                data: patientData,
            }),
            prisma.newsletter.updateMany({
                where: { email: normalizedEmail },
                data: { name: fullName || null },
            }),
        ]);

        return NextResponse.json({ success: true, message: 'Paciente actualizado correctamente' });
    } catch (error) {
        console.error('Admin patient update error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
        if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

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

        // Eliminamos registro del newsletter (Borrado total del CRM)
        await prisma.newsletter.deleteMany({
            where: { email: email.toLowerCase().trim() }
        });

        return NextResponse.json({ success: true, message: 'Paciente eliminado del sistema completamente' });
    } catch (error) {
        console.error('Admin patient delete error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
