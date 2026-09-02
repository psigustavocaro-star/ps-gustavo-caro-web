import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { getCalEventTypeId, PRICING } from '@/lib/config/pricing';
import { cancelCalBooking, createCalBooking } from '@/lib/services/calcom';
import { sendBookingConfirmation } from '@/lib/services/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const validServices = new Set(Object.keys(PRICING));

export async function POST(request: NextRequest) {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 160) : '';
        const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';
        const serviceType = typeof body.serviceType === 'string' ? body.serviceType : '';
        const amount = Number(body.amount);
        const sendEmail = body.sendEmail !== false;
        const appointmentDates = Array.isArray(body.appointmentDates)
            ? body.appointmentDates.filter((value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value)))
            : [];

        if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ success: false, error: 'Ingresa el nombre y correo del paciente.' }, { status: 400 });
        }
        if (!validServices.has(serviceType) || !Number.isInteger(amount) || amount < 0 || amount > 5_000_000) {
            return NextResponse.json({ success: false, error: 'Revisa el servicio y el monto ingresado.' }, { status: 400 });
        }
        if (!appointmentDates.length || new Set(appointmentDates).size !== appointmentDates.length) {
            return NextResponse.json({ success: false, error: 'Ingresa al menos una fecha válida, sin repetirla.' }, { status: 400 });
        }

        const eventTypeId = getCalEventTypeId(serviceType);
        const calBookingIds = appointmentDates.map(() => '');
        const createdCalBookingIds: string[] = [];

        if (eventTypeId) {
            for (const [index, start] of appointmentDates.entries()) {
                // Las citas históricas se registran en la ficha, pero no se envían a Cal.com.
                if (new Date(start).getTime() <= Date.now()) continue;
                const calResult = await createCalBooking({
                    eventTypeId,
                    start,
                    name,
                    email,
                    notes: 'Pago por transferencia registrado por administración',
                    attendeeTimeZone: 'America/Santiago',
                });
                if (!calResult.success) {
                    await Promise.all(createdCalBookingIds.map(id => cancelCalBooking(id, 'Registro manual incompleto.')));
                    return NextResponse.json({ success: false, error: 'La fecha no está disponible en Cal.com. Elige otra hora e inténtalo nuevamente.' }, { status: 409 });
                }
                calBookingIds[index] = calResult.bookingId;
                createdCalBookingIds.push(calResult.bookingId);
            }
        }

        const orderId = `MANUAL-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
        const booking = await prisma.booking.create({
            data: {
                orderId,
                name,
                email,
                phone: phone || null,
                serviceType,
                amount,
                status: 'PAID',
                paidAt: new Date(),
                reason: 'Pago por transferencia manual registrado desde el panel administrativo.',
                appointmentDate: appointmentDates[0],
                appointmentDates,
                attendeeTimeZone: 'America/Santiago',
                calEventTypeId: eventTypeId,
                calBookingId: calBookingIds.find(Boolean) || null,
                calBookingIds,
            },
        });

        if (sendEmail) {
            await sendBookingConfirmation({
                name, email, phone, reason: booking.reason || '', details: '', amount, orderId,
            }).catch(error => console.error('Manual booking confirmation email error:', error));
        }

        return NextResponse.json({ success: true, booking: { id: booking.id, orderId }, scheduledInCal: createdCalBookingIds.length });
    } catch (error) {
        console.error('Manual booking error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible registrar el pago por transferencia.' }, { status: 500 });
    }
}
