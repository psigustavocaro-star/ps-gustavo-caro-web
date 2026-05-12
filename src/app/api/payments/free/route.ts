import { NextRequest, NextResponse } from 'next/server';
import { sendBookingNotification } from '@/lib/services/mail';
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
        const appointmentDate = typeof body?.appointmentDate === 'string' ? body.appointmentDate : null;

        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
        }

        // Determinar nombre del servicio para el email
        let subject: string;
        if (serviceType === 'primeraConsulta') {
            subject = 'Primera Consulta (Gratis)';
        } else if (serviceType === 'sesion') {
            subject = 'Sesión de Psicoterapia Online';
        } else if (serviceType === 'packSesiones') {
            subject = 'Pack de 4 Sesiones';
        } else if (serviceType.startsWith('eval')) {
            subject = 'Evaluación Clínica';
        } else {
            subject = 'Servicio Clínico';
        }

        // Generar ID único de orden (aunque sea gratis para mantener consistencia)
        const commerceOrder = `FREE-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`;

        // Guardar en base de datos como CONFIRMADA directamente
        try {
            const { default: prisma } = await import('@/lib/db');
            await prisma.booking.create({
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
                    calEventTypeId: calEventTypeId || null,
                    status: 'PAID', // Se marca como pagado porque no requiere transacción
                }
            });

            // Suscribir al newsletter AUTOMÁTICAMENTE (Requerimiento del profesional para cada agendamiento)
            await prisma.newsletter.upsert({
                where: { email },
                update: { active: true, name },
                create: { email: email.toLowerCase(), name, active: true }
            }).catch((err: any) => console.error('Silent error registering newsletter:', err));
        } catch (dbError) {
            console.error('Free booking DB error:', dbError);
        }

        // Agendar en Cal.com vía API para que aparezca en Google Calendar
        let calBookingId = null;
        if (calEventTypeId && appointmentDate) {
            try {
                const { createCalBooking } = await import('@/lib/services/calcom');
                const calResult = await createCalBooking({
                    eventTypeId: parseInt(calEventTypeId),
                    start: appointmentDate,
                    name: name,
                    email: email,
                    notes: motivo || detalles || 'Agendamiento Gratuito / Cupón de Prueba'
                });
                
                if (calResult.success) {
                    calBookingId = calResult.bookingId;
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
