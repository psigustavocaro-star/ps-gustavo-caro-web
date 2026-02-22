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
        } else if (serviceType.startsWith('evalFree')) {
            subject = 'Sesión Inicial Evaluación (Gratis)';
        } else {
            subject = 'Servicio Gratuito';
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

            // Suscribir al newsletter si se seleccionó
            if (body.newsletter) {
                await prisma.newsletter.upsert({
                    where: { email },
                    update: { active: true, name },
                    create: { email, name }
                }).catch((err: any) => console.error('Silent error registering newsletter:', err));
            }
        } catch (dbError: any) {
            console.error('API: Error al guardar en DB:', dbError.message);
            // Si falla la DB en un agendamiento gratis, notificamos pero igual devolvemos éxito para no bloquear al usuario
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
            serviceType
        }).catch(err => console.error('Silent error sending notification:', err));

        // NOTA: Aquí idealmente agendaríamos en Cal.com vía API si no se hizo en el frontend

        return NextResponse.json({
            success: true,
            orderId: commerceOrder,
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
