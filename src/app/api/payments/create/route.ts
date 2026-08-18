import { NextRequest, NextResponse } from 'next/server';
import { createFlowPayment } from '@/lib/services/flow';
import { paymentConfig } from '@/lib/config/services';
import { isInPersonEvaluation } from '@/lib/config/pricing';
import { sendBookingNotification } from '@/lib/services/mail';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';
import { logConsent } from '@/lib/services/consent-log';

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
        const requestedCalEventTypeId = typeof body?.calEventTypeId === 'number' || typeof body?.calEventTypeId === 'string' ? body.calEventTypeId : null;
        const calEventTypeId = isInPersonEvaluation(serviceType) ? null : requestedCalEventTypeId;
        const attendeeTimeZone = typeof body?.attendeeTimeZone === 'string' ? body.attendeeTimeZone.slice(0, 80) : 'America/Santiago';
        const appointmentDates = Array.isArray(body?.appointmentDates)
            ? body.appointmentDates.filter((date: unknown): date is string => typeof date === 'string' && !Number.isNaN(Date.parse(date))).slice(0, 4)
            : [];
        const appointmentDate = appointmentDates[0] || (typeof body?.appointmentDate === 'string' ? body.appointmentDate : null);
        const email = emailRaw;

        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
        }

        if (serviceType === 'packSesiones' && appointmentDates.length !== 4) {
            return NextResponse.json({ error: 'El pack requiere agendar 4 sesiones' }, { status: 400 });
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
                subject = 'Evaluación de TDAH Presencial';
                break;
            case 'evalAutismo':
                amount = paymentConfig.pricing.evalAutismo;
                subject = 'Evaluación TEA (Autismo)';
                break;
            case 'evalWiscV':
                amount = paymentConfig.pricing.evalWiscV;
                subject = 'Evaluación Cognitiva WISC-V Presencial';
                break;
            case 'evalInteligencia':
                amount = paymentConfig.pricing.evalInteligencia;
                subject = 'Evaluación Intelectual';
                break;
            case 'evalNeuropsicologica':
                amount = paymentConfig.pricing.evalNeuropsicologica;
                subject = 'Evaluación Neurocognitiva Presencial';
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
                    appointmentDate,
                    appointmentDates: appointmentDates.length > 0 ? appointmentDates : appointmentDate ? [appointmentDate] : [],
                    attendeeTimeZone,
                    calEventTypeId: calEventTypeId || null,
                    status: 'PENDING',
                }
            });

            // Registro digital del consentimiento explícito de privacidad (Ley 21.719)
            await logConsent({
                email,
                type: 'privacy',
                granted: true,
                context: 'booking-flow',
                ip,
                userAgent: request.headers.get('user-agent'),
            });

            // Newsletter opcional: solo suscribimos si el usuario marcó el checkbox
            if (body?.newsletter === true) {
                await prisma.newsletter.upsert({
                    where: { email },
                    update: { active: true, name, confirmedAt: new Date() },
                    create: { email: email.toLowerCase(), name, active: true, confirmedAt: new Date() }
                }).catch((err: unknown) => console.error('Silent error registering newsletter:', err));

                await logConsent({
                    email,
                    type: 'newsletter',
                    granted: true,
                    context: 'booking-flow',
                    ip,
                    userAgent: request.headers.get('user-agent'),
                });
            }

            // Enviar bienvenida al newsletter (Paso 1 de la secuencia automática)
            const { sendNewsletterWelcome } = await import('@/lib/services/mail');
            sendNewsletterWelcome(email, name).catch((err: unknown) => console.error('Silent newsletter mail error:', err));

            const { markBookingLeadConverted } = await import('@/lib/services/booking-leads');
            await markBookingLeadConverted(email).catch((err: unknown) => console.error('Silent booking lead conversion error:', err));
        } catch (dbError: unknown) {
            console.error('API: Error al guardar en DB (continuando con pago):', dbError instanceof Error ? dbError.message : dbError);
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
