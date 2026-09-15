import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyRescheduleToken } from '@/lib/auth/reschedule-link';
import { calendarConfig } from '@/lib/config/services';
import { clinicWallTimeToIso } from '@/lib/util/timezone';
import { getAvailableSlotsForDay, isDateValid } from '@/lib/config/availability';
import { createCalBooking } from '@/lib/services/calcom';
import { sendRescheduleConfirmationEmail } from '@/lib/services/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getRequest(token: string) {
    const link = await verifyRescheduleToken(token);
    if (!link) return null;
    const booking = await prisma.booking.findUnique({ where: { id: link.bookingId } });
    if (!booking || booking.status !== 'PAID') return null;
    const appointments = booking.appointmentDates.length > 0
        ? booking.appointmentDates
        : booking.appointmentDate ? [booking.appointmentDate] : [];
    if (appointments[link.appointmentIndex] !== link.originalAppointmentDate) return null;
    return { link, booking, appointments };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const request = await getRequest(token);
    if (!request) return NextResponse.json({ success: false, error: 'Este enlace ya no es válido o venció' }, { status: 404 });

    const eventTypeId = request.booking.calEventTypeId || Number(
        calendarConfig.calcom.eventTypes[request.booking.serviceType as keyof typeof calendarConfig.calcom.eventTypes] || 0
    );
    return NextResponse.json({ success: true, eventTypeId: eventTypeId || null });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const pending = await getRequest(token);
    if (!pending) return NextResponse.json({ success: false, error: 'Este enlace ya no es válido o venció' }, { status: 404 });

    try {
        const body = await request.json();
        const date = typeof body.date === 'string' ? body.date : '';
        const time = typeof body.time === 'string' ? body.time : '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
            return NextResponse.json({ success: false, error: 'Horario inválido' }, { status: 400 });
        }
        const day = new Date(`${date}T12:00:00Z`);
        if (!isDateValid(day) || !getAvailableSlotsForDay(day.getUTCDay()).includes(time)) {
            return NextResponse.json({ success: false, error: 'Ese horario ya no está disponible' }, { status: 409 });
        }
        const appointmentDate = clinicWallTimeToIso(day, time);
        const conflicting = await prisma.booking.findFirst({
            where: {
                status: 'PAID', id: { not: pending.booking.id },
                OR: [{ appointmentDates: { has: appointmentDate } }, { appointmentDate }],
            },
            select: { id: true },
        });
        if (conflicting) return NextResponse.json({ success: false, error: 'Ese horario acaba de ser reservado. Elige otro, por favor.' }, { status: 409 });

        const eventTypeId = pending.booking.calEventTypeId || Number(
            calendarConfig.calcom.eventTypes[pending.booking.serviceType as keyof typeof calendarConfig.calcom.eventTypes] || 0
        );
        let createdCalBookingId: string | null = null;
        if (eventTypeId) {
            const created = await createCalBooking({
                eventTypeId, start: appointmentDate, name: pending.booking.name || 'Paciente', email: pending.booking.email,
                attendeeTimeZone: pending.booking.attendeeTimeZone || 'America/Santiago',
            });
            if (!created.success) return NextResponse.json({ success: false, error: 'No pudimos confirmar el horario. Inténtalo nuevamente.' }, { status: 502 });
            createdCalBookingId = created.bookingId ? String(created.bookingId) : null;
        }

        const appointmentDates = [...pending.appointments];
        appointmentDates[pending.link.appointmentIndex] = appointmentDate;
        const calBookingIds = [...pending.booking.calBookingIds];
        if (createdCalBookingId) calBookingIds[pending.link.appointmentIndex] = createdCalBookingId;
        await prisma.booking.update({
            where: { id: pending.booking.id },
            data: {
                appointmentDate: appointmentDates[0] || appointmentDate,
                appointmentDates,
                ...(createdCalBookingId ? { calBookingId: calBookingIds[0] || createdCalBookingId, calBookingIds } : {}),
            },
        });
        await prisma.appointmentCancellation.updateMany({
            where: {
                bookingId: pending.booking.id,
                appointmentIndex: pending.link.appointmentIndex,
                originalAppointmentDate: pending.link.originalAppointmentDate,
            },
            data: { rebookedAt: new Date() },
        });
        await sendRescheduleConfirmationEmail({
            patientName: pending.booking.name || '', email: pending.booking.email, appointmentDate,
        }).catch(error => console.error('Reschedule confirmation email error:', error));
        return NextResponse.json({ success: true, appointmentDate });
    } catch (error) {
        console.error('Reschedule error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible confirmar la nueva hora' }, { status: 500 });
    }
}
