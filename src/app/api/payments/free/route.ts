import { NextRequest, NextResponse } from 'next/server';
import { sendBookingNotification } from '@/lib/services/mail';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('API: Iniciando agendamiento gratuito...');
    try {
        const body = await request.json();

        const {
            email,
            name,
            serviceType = 'primeraConsulta',
            motivo,
            detalles,
            calEventTypeId,
            appointmentDate
        } = body;

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email y nombre son requeridos' },
                { status: 400 }
            );
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
        const commerceOrder = `FREE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Guardar en base de datos como CONFIRMADA directamente
        try {
            const { default: prisma } = await import('@/lib/db');
            await prisma.booking.create({
                data: {
                    orderId: commerceOrder,
                    name,
                    email,
                    rut: body.rut || '',
                    address: body.address || '',
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
            console.log('API: Reserva gratuita guardada en DB', { commerceOrder });

            // Suscribir al newsletter AUTOMÁTICAMENTE (Requerimiento del profesional para cada agendamiento)
            await prisma.newsletter.upsert({
                where: { email },
                update: { active: true, name },
                create: { email: email.toLowerCase(), name, active: true }
            }).catch((err: any) => console.error('Silent error registering newsletter:', err));
        } catch (dbError: any) {
            console.error('API: Error al guardar en DB:', dbError.message);
            // Si falla la DB en un agendamiento gratis, notificamos pero igual devolvemos éxito para no bloquear al usuario
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
            } catch (calError: any) {
                console.error('API: Error al agendar en Cal.com (continuando):', calError.message);
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

    } catch (error: any) {
        console.error('CRITICAL: Free booking error details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: `API ERROR: ${error.message}` },
            { status: 500 }
        );
    }
}
