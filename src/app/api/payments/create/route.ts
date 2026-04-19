import { NextRequest, NextResponse } from 'next/server';
import { createFlowPayment } from '@/lib/services/flow';
import { paymentConfig } from '@/lib/config/services';
import { sendBookingNotification } from '@/lib/services/mail';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('API: Iniciando creación de pago...');
    try {
        const body = await request.json();

        const {
            email,
            name,
            serviceType = 'sesion',
            motivo,
            detalles,
            calEventTypeId,
        } = body;

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email y nombre son requeridos' },
                { status: 400 }
            );
        }

        // Determinar precio según tipo de servicio
        let amount: number;
        let subject: string;

        switch (serviceType) {
            case 'primeraConsulta':
                amount = paymentConfig.pricing.primeraConsulta;
                subject = 'Primera Consulta (Gratis)';
                break;
            case 'packSesiones':
                amount = paymentConfig.pricing.packSesiones;
                subject = 'Pack de 4 Sesiones';
                break;
            case 'evalTDAH':
                amount = paymentConfig.pricing.evalTDAH;
                subject = 'Evaluación TDAH Adulto';
                break;
            case 'evalAutismo':
                amount = paymentConfig.pricing.evalAutismo;
                subject = 'Evaluación TEA (Autismo)';
                break;
            case 'evalInteligencia':
                amount = paymentConfig.pricing.evalInteligencia;
                subject = 'Evaluación Intelectual';
                break;
            case 'evalNeuropsicologica':
                amount = paymentConfig.pricing.evalNeuropsicologica;
                subject = 'Evaluación Neuropsicológica Completa';
                break;
            case 'evalEmocional':
                amount = paymentConfig.pricing.evalEmocional;
                subject = 'Evaluación Socioemocional';
                break;
            case 'sesion':
            default:
                amount = paymentConfig.pricing.sesionIndividual;
                subject = 'Sesión de Psicoterapia Online';
        }

        // Aplicar cupón si existe
        if (body.coupon) {
            const coupon = body.coupon.toUpperCase();
            if (coupon === 'TEST100') {
                amount = 350; // Monto mínimo seguro para Webpay/Flow
            } else if (coupon === 'GUSTAVO10') {
                amount = Math.max(0, amount - 10000);
            }
        }

        // Generar ID único de orden
        const commerceOrder = `PSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Guardar en base de datos (no bloquea el pago si falla)
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
                    amount,
                    reason: motivo || '',
                    details: detalles || '',
                    appointmentDate: body.appointmentDate || null,
                    calEventTypeId: calEventTypeId || null,
                    status: 'PENDING',
                }
            });
            console.log('API: Reserva guardada en DB', { commerceOrder });

            // Suscribir al newsletter AUTOMÁTICAMENTE (Requerimiento del profesional para cada agendamiento)
            await prisma.newsletter.upsert({
                where: { email },
                update: { active: true, name },
                create: { email: email.toLowerCase(), name, active: true }
            }).catch((err: any) => console.error('Silent error registering newsletter:', err));

            // Enviar bienvenida al newsletter (Paso 1 de la secuencia automática)
            const { sendNewsletterWelcome } = await import('@/lib/services/mail');
            sendNewsletterWelcome(email, name).catch((err: any) => console.error('Silent newsletter mail error:', err));
        } catch (dbError: any) {
            console.error('API: Error al guardar en DB (continuando con pago):', dbError.message);
        }

        // Crear pago en Flow
        // Nota: El parámetro "optional" de Flow tiene un límite estricto de caracteres (~255).
        // Evitamos enviar campos de texto libre (detalles, motivo, dirección) para evitar el Error 400.
        // Toda la información completa ya quedó guardada y segura en nuestra Base de Datos bajo el commerceOrder.
        const payment = await createFlowPayment({
            amount,
            email,
            subject,
            commerceOrder,
            optional: {
                clientName: name.substring(0, 30),
                serviceType,
                phone: body.phone ? body.phone.substring(0, 20) : '',
                clientRut: body.rut ? body.rut.substring(0, 15) : '',
            },
        });

        // Enviar notificación por email (opcional, no bloqueante)
        sendBookingNotification({
            name,
            email,
            phone: body.phone,
            reason: motivo,
            details: detalles,
            amount,
            orderId: commerceOrder,
        }).catch(err => console.error('Silent error sending notification:', err));

        return NextResponse.json({
            success: true,
            paymentUrl: payment.url,
            orderId: commerceOrder,
            amount,
        });

    } catch (error: any) {
        console.error('CRITICAL: Payment creation error details:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: `API ERROR: ${error.message}` },
            { status: 500 }
        );
    }
}
