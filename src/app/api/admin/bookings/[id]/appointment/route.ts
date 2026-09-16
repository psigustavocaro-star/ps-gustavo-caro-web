import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { cancelCalBooking, createCalBooking, rescheduleCalBooking } from '@/lib/services/calcom';
import { createGoogleCalendarOverbook, deleteGoogleCalendarOverbook, updateGoogleCalendarOverbook } from '@/lib/services/google-calendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const manualEventPattern = /\n?\[manual_overbook_event:(\d+):([^\]]+)\]\n?/g;

function getManualEventId(details: string | null, appointmentIndex: number) {
    return Array.from((details || '').matchAll(manualEventPattern))
        .find((match) => Number(match[1]) === appointmentIndex)?.[2] || null;
}

function stampManualEventId(details: string | null, appointmentIndex: number, eventId: string) {
    const cleaned = (details || '').replace(manualEventPattern, (match, index) => Number(index) === appointmentIndex ? '' : match).trim();
    return `${cleaned}${cleaned ? '\n' : ''}[manual_overbook_event:${appointmentIndex}:${eventId}]`;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();
        const appointmentIndex = Number.isInteger(body.appointmentIndex) ? body.appointmentIndex : -1;
        const appointmentDate = typeof body.appointmentDate === 'string' ? body.appointmentDate : '';
        const manualOverbook = body.manualOverbook === true;
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
        let nextDetails = booking.details;

        if (manualOverbook) {
            const existingGoogleEventId = getManualEventId(booking.details, appointmentIndex);
            const eventInput = { name: booking.name || 'Paciente', email: booking.email, start: appointmentDate, bookingId: booking.id };
            const googleEvent = existingGoogleEventId
                ? await updateGoogleCalendarOverbook(existingGoogleEventId, eventInput).then(success => success ? { success: true as const, eventId: existingGoogleEventId } : { success: false as const, error: 'No fue posible actualizar el sobrecupo en Google Calendar.' })
                : await createGoogleCalendarOverbook(eventInput);
            if (!googleEvent.success) return NextResponse.json({ success: false, error: googleEvent.error }, { status: 503 });

            if (currentCalBookingId) {
                const cancelled = await cancelCalBooking(currentCalBookingId, 'Reagendada como sobrecupo por administración.');
                if (!cancelled.success) {
                    if (!existingGoogleEventId) await deleteGoogleCalendarOverbook(googleEvent.eventId);
                    return NextResponse.json({ success: false, error: 'No se pudo anular la cita anterior en Cal.com. No se realizaron cambios.' }, { status: 409 });
                }
            }
            while (calBookingIds.length <= appointmentIndex) calBookingIds.push('');
            calBookingIds[appointmentIndex] = '';
            newCalBookingId = '';
            nextDetails = stampManualEventId(booking.details, appointmentIndex, googleEvent.eventId);
        } else {

        if (currentCalBookingId) {
            const result = await rescheduleCalBooking({ bookingUid: currentCalBookingId, start: appointmentDate, rescheduledBy: booking.email });
            if (result.success) {
                newCalBookingId = result.bookingId;
            } else if (booking.calEventTypeId) {
                // Algunas reservas antiguas de Cal.com no admiten el endpoint de mover.
                // En ese caso, reemplazamos la reserva de forma segura: primero se crea la nueva
                // y sólo después se anula la antigua.
                const replacement = await createCalBooking({ eventTypeId: booking.calEventTypeId, start: appointmentDate, name: booking.name || 'Paciente', email: booking.email, attendeeTimeZone: booking.attendeeTimeZone });
                if (!replacement.success) return NextResponse.json({ success: false, error: 'La nueva hora no está disponible en Cal.com. Elige otra e inténtalo nuevamente.' }, { status: 409 });
                const cancelled = await cancelCalBooking(currentCalBookingId, 'Fecha corregida por administración.');
                if (!cancelled.success) return NextResponse.json({ success: false, error: 'La nueva cita fue creada, pero no se pudo anular la anterior. Revísala en Cal.com antes de reintentar.' }, { status: 409 });
                newCalBookingId = replacement.bookingId;
            } else {
                return NextResponse.json({ success: false, error: result.error }, { status: 409 });
            }
        } else if (booking.calEventTypeId) {
            const result = await createCalBooking({ eventTypeId: booking.calEventTypeId, start: appointmentDate, name: booking.name || 'Paciente', email: booking.email, attendeeTimeZone: booking.attendeeTimeZone });
            if (!result.success) return NextResponse.json({ success: false, error: 'Cal.com no tiene disponibilidad para esa hora.' }, { status: 409 });
            newCalBookingId = result.bookingId;
        }
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
                details: nextDetails,
            },
        });
        await prisma.appointmentCancellation.upsert({
            where: {
                bookingId_appointmentIndex_originalAppointmentDate: {
                    bookingId: booking.id,
                    appointmentIndex,
                    originalAppointmentDate: dates[appointmentIndex] === appointmentDate ? (booking.appointmentDates[appointmentIndex] || booking.appointmentDate || appointmentDate) : appointmentDate,
                },
            },
            create: {
                bookingId: booking.id,
                appointmentIndex,
                originalAppointmentDate: booking.appointmentDates[appointmentIndex] || booking.appointmentDate || appointmentDate,
                reason: body.reason || 'Fecha reagendada por administración.',
                rebookedAt: new Date(),
            },
            update: {
                reason: body.reason || undefined,
                rebookedAt: new Date(),
            },
        }).catch(error => console.error('Reschedule history error:', error));
        return NextResponse.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Admin appointment edit error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible modificar la fecha.' }, { status: 500 });
    }
}
