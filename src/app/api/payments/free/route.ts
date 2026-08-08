import { NextRequest, NextResponse } from 'next/server';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`free:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();

        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const name = isNonEmptyString(body?.name, 200) ? body.name.trim() : '';
        const serviceType = typeof body?.serviceType === 'string' ? body.serviceType : 'primeraConsulta';
        const motivo = typeof body?.motivo === 'string' ? body.motivo.slice(0, 2000) : '';
        const detalles = typeof body?.detalles === 'string' ? body.detalles.slice(0, 5000) : '';
        const calEventTypeId = body?.calEventTypeId ?? null;
        const appointmentDates = Array.isArray(body?.appointmentDates)
            ? body.appointmentDates.filter((date: unknown): date is string => typeof date === 'string' && !Number.isNaN(Date.parse(date))).slice(0, 4)
            : [];
        const appointmentDate = appointmentDates[0] || (typeof body?.appointmentDate === 'string' ? body.appointmentDate : null);
        const attendeeTimeZone = typeof body?.attendeeTimeZone === 'string' ? body.attendeeTimeZone.slice(0, 80) : 'America/Santiago';

        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
        }

        if (serviceType === 'packSesiones' && appointmentDates.length !== 4) {
            return NextResponse.json({ error: 'El pack requiere agendar 4 sesiones' }, { status: 400 });
        }

        // Generar ID único de orden (aunque sea gratis para mantener consistencia)
        const commerceOrder = `FREE-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`;

        // Guardar en base de datos como CONFIRMADA directamente
        let createdBookingId: string | null = null;
        try {
            const { default: prisma } = await import('@/lib/db');
            const createdBooking = await prisma.booking.create({
                data: {
                    orderId: commerceOrder,
                    name,
                    firstName: body.firstName || '',
                    secondName: body.secondName || '',
                    firstSurname: body.firstSurname || '',
                    secondSurname: body.secondSurname || '',
                    email,
                    phone: body.phone || '',
                    rut: body.rut || '',
                    address: body.address || '',
                    region: body.region || '',
                    commune: body.commune || '',
                    serviceType,
                    amount: 0,
                    reason: motivo || '',
                    details: detalles || '',
                    appointmentDate: appointmentDate || null,
                    appointmentDates: appointmentDates.length > 0 ? appointmentDates : appointmentDate ? [appointmentDate] : [],
                    attendeeTimeZone,
                    calEventTypeId: calEventTypeId || null,
                    status: 'PAID', // Se marca como pagado porque no requiere transacción
                    paidAt: new Date(),
                }
            });
            createdBookingId = createdBooking.id;

            // Suscribir al newsletter AUTOMÁTICAMENTE (Requerimiento del profesional para cada agendamiento)
            await prisma.newsletter.upsert({
                where: { email },
                update: { active: true, name },
                create: { email: email.toLowerCase(), name, active: true }
            }).catch((err: unknown) => console.error('Silent error registering newsletter:', err));

            const { markBookingLeadConverted } = await import('@/lib/services/booking-leads');
            await markBookingLeadConverted(email).catch((err: unknown) => console.error('Silent booking lead conversion error:', err));
        } catch (dbError) {
            console.error('Free booking DB error:', dbError);
        }

        // Agendar en Cal.com vía API para que aparezca en Google Calendar
        let calBookingId = null;
        if (calEventTypeId && appointmentDate) {
            try {
                const { createCalBooking } = await import('@/lib/services/calcom');
                const calBookingIds: string[] = [];
                const starts = appointmentDates.length > 0 ? appointmentDates : [appointmentDate];

                for (const [index, start] of starts.entries()) {
                    const calResult = await createCalBooking({
                        eventTypeId: parseInt(calEventTypeId),
                        start,
                        name: name,
                        email: email,
                        notes: starts.length > 1
                            ? `Agendamiento gratuito / cupón - sesión ${index + 1} de ${starts.length}`
                            : motivo || detalles || 'Agendamiento Gratuito / Cupón de Prueba',
                        attendeeTimeZone,
                    });

                    if (calResult.success && calResult.bookingId) {
                        calBookingIds.push(String(calResult.bookingId));
                    }
                }

                calBookingId = calBookingIds[0] || null;

                if (createdBookingId && calBookingIds.length > 0) {
                    const { default: prisma } = await import('@/lib/db');
                    await prisma.booking.update({
                        where: { id: createdBookingId },
                        data: {
                            calBookingId,
                            calBookingIds,
                        },
                    });
                }
            } catch (calError) {
                console.error('Cal.com booking error:', calError);
            }
        }

        // Enviar notificación por email al profesional y paciente
        const { sendFreeBookingConfirmation } = await import('@/lib/services/mail');
        sendFreeBookingConfirmation({
            name,
            email,
            phone: body.phone,
            reason: motivo,
            details: detalles,
            orderId: commerceOrder,
            serviceType: serviceType // Ahora el serviceType puede ser 'sesion' o 'packSesiones' si se usó cupón
        }).catch(err => console.error('Silent error sending notification:', err));

        return NextResponse.json({
            success: true,
            orderId: commerceOrder,
            calBookingId,
            amount: 0,
        });

    } catch (error) {
        console.error('Free booking error:', error);
        return NextResponse.json(
            { error: 'No fue posible completar el agendamiento' },
            { status: 500 }
        );
    }
}
