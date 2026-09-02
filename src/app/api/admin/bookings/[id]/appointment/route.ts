import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { createCalBooking, rescheduleCalBooking } from '@/lib/services/calcom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();
        const appointmentIndex = Number.isInteger(body.appointmentIndex) ? body.appointmentIndex : -1;
        const appointmentDate = typeof body.appointmentDate === 'string' ? body.appointmentDate : '';
        if (appointmentIndex < 0 || Number.isNaN(Date.parse(appointmentDate)) || new Date(appointmentDate).getTime() <= Date.now()) {
            return NextResponse.json({ success: false, error: 'Selecciona una fecha futura válida.' }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking || booking.status !== 'PAID') return NextResponse.json({ success: false, error: 'No se encontró una sesión pagada.' }, { status: 404 });
        const dates = booking.appointmentDates.length ? [...booking.appointmentDates] : booking.appointmentDate ? [booking.appointmentDate] : [];
        if (!dates[appointmentIndex]) return NextResponse.json({ success: false, error: 'La sesión seleccionada no tiene fecha.' }, { status: 400 });

        const calBookingIds = booking.calBookingIds.length ? [...booking.calBookingIds] : booking.calBookingId ? [booking.calBookingId] : [];
        const currentCalBookingId = calBookingIds[appointmentIndex] || (appointmentIndex === 0 ? booking.calBookingId : null);
        let newCalBookingId = currentCalBookingId || '';

        if (currentCalBookingId) {
            const result = await rescheduleCalBooking({ bookingUid: currentCalBookingId, start: appointmentDate, rescheduledBy: booking.email });
            if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 409 });
            newCalBookingId = result.bookingId;
        } else if (booking.calEventTypeId) {
            const result = await createCalBooking({ eventTypeId: booking.calEventTypeId, start: appointmentDate, name: booking.name || 'Paciente', email: booking.email, attendeeTimeZone: booking.attendeeTimeZone });
            if (!result.success) return NextResponse.json({ success: false, error: 'Cal.com no tiene disponibilidad para esa hora.' }, { status: 409 });
            newCalBookingId = result.bookingId;
        }

        dates[appointmentIndex] = appointmentDate;
        while (calBookingIds.length <= appointmentIndex) calBookingIds.push('');
        if (newCalBookingId) calBookingIds[appointmentIndex] = newCalBookingId;
        const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                appointmentDate: appointmentIndex === 0 ? appointmentDate : booking.appointmentDate,
                appointmentDates: booking.appointmentDates.length ? dates : booking.appointmentDates,
                calBookingId: calBookingIds.find(Boolean) || null,
                calBookingIds,
            },
        });
        return NextResponse.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Admin appointment edit error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible modificar la fecha.' }, { status: 500 });
    }
}
