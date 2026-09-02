import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { createRescheduleToken } from '@/lib/auth/reschedule-link';
import { cancelCalBooking } from '@/lib/services/calcom';
import { sendProfessionalCancellationEmail } from '@/lib/services/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clinicDateKey(value: string) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(value));
    const read = (type: string) => parts.find(part => part.type === type)?.value || '';
    return `${read('year')}-${read('month')}-${read('day')}`;
}

export async function POST(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const date = typeof body.date === 'string' ? body.date : '';
        const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 300) : '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json({ success: false, error: 'Fecha inválida' }, { status: 400 });
        }

        const bookings = await prisma.booking.findMany({ where: { status: 'PAID' } });
        const sessions = bookings.flatMap(booking => {
            const appointments = booking.appointmentDates.length ? booking.appointmentDates : booking.appointmentDate ? [booking.appointmentDate] : [];
            return appointments
                .map((appointmentDate, appointmentIndex) => ({ booking, appointmentDate, appointmentIndex }))
                .filter(session => clinicDateKey(session.appointmentDate) === date);
        });
        if (!sessions.length) return NextResponse.json({ success: true, summary: { affected: 0, cancelled: 0, emailed: 0, failed: 0 } });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';
        let cancelled = 0;
        let emailed = 0;
        const failures: Array<{ patient: string; error: string }> = [];

        for (const sessionToCancel of sessions) {
            const { booking, appointmentDate, appointmentIndex } = sessionToCancel;
            const cancellation = await prisma.appointmentCancellation.upsert({
                where: { bookingId_appointmentIndex_originalAppointmentDate: { bookingId: booking.id, appointmentIndex, originalAppointmentDate: appointmentDate } },
                update: { reason: reason || null },
                create: { bookingId: booking.id, appointmentIndex, originalAppointmentDate: appointmentDate, reason: reason || null },
            });
            try {
                if (!cancellation.calCancelledAt) {
                    const calBookingId = booking.calBookingIds[appointmentIndex] || (appointmentIndex === 0 ? booking.calBookingId : null);
                    if (calBookingId) {
                        const result = await cancelCalBooking(calBookingId, reason || 'Cancelación por motivos de fuerza mayor.');
                        if (!result.success) throw new Error('No fue posible cancelar el evento en Cal.com');
                    }
                    await prisma.appointmentCancellation.update({ where: { id: cancellation.id }, data: { calCancelledAt: new Date() } });
                    cancelled++;
                }
                if (!cancellation.emailSentAt) {
                    const token = await createRescheduleToken({ bookingId: booking.id, appointmentIndex, originalAppointmentDate: appointmentDate });
                    await sendProfessionalCancellationEmail({
                        patientName: booking.name || '', email: booking.email, appointmentDate,
                        rescheduleUrl: `${baseUrl}/reagendar/${token}`, reason,
                    });
                    await prisma.appointmentCancellation.update({ where: { id: cancellation.id }, data: { emailSentAt: new Date() } });
                    emailed++;
                }
            } catch (error) {
                failures.push({ patient: booking.name || booking.email, error: error instanceof Error ? error.message : 'Error inesperado' });
            }
        }
        return NextResponse.json({ success: true, summary: { affected: sessions.length, cancelled, emailed, failed: failures.length }, failures });
    } catch (error) {
        console.error('Appointment cancellation error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible cancelar la jornada' }, { status: 500 });
    }
}
