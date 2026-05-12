import { NextRequest, NextResponse } from 'next/server';
import { createFlowPayment } from '@/lib/services/flow';
import { paymentConfig } from '@/lib/config/services';
import { sendBookingNotification } from '@/lib/services/mail';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`payments:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();

        const emailRaw = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const name = isNonEmptyString(body?.name, 200) ? body.name.trim() : '';
        const serviceType = typeof body?.serviceType === 'string' ? body.serviceType : 'sesion';
        const motivo = typeof body?.motivo === 'string' ? body.motivo.slice(0, 2000) : '';
        const detalles = typeof body?.detalles === 'string' ? body.detalles.slice(0, 5000) : '';
        const calEventTypeId = typeof body?.calEventTypeId === 'number' || typeof body?.calEventTypeId === 'string' ? body.calEventTypeId : null;
        const email = emailRaw;

        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
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

        // Aplicar cupón (validación server-side)
        if (body.coupon) {
            const { applyCoupon } = await import('@/lib/services/coupons');
            const couponResult = applyCoupon(body.coupon, amount);
            if (!couponResult.ok) {
                return NextResponse.json({ error: couponResult.reason }, { status: 400 });
            }
            amount = couponResult.amount;
        }

        // Generar ID único de orden
        const commerceOrder = `PSG-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`;

        // Guardar en base de datos (no bloquea el pago si falla)
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
                    amount,
                    reason: motivo || '',
                    details: detalles || '',
                    appointmentDate: body.appointmentDate || null,
                    calEventTypeId: calEventTypeId || null,
                    status: 'PENDING',
                }
            });

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

    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: 'No fue posible iniciar el pago' },
            { status: 500 }
        );
    }
}
