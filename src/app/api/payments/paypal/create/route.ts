import { NextRequest, NextResponse } from 'next/server';
import { paymentConfig } from '@/lib/config/services';
import { createPayPalOrder } from '@/lib/services/paypal';
import { sendBookingNotification } from '@/lib/services/mail';
import { applyCoupon } from '@/lib/services/coupons';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

const getServicePaymentDetails = (serviceType: string) => {
    switch (serviceType) {
        case 'packSesiones':
            return { amount: paymentConfig.pricing.packSesiones, subject: 'Pack de 4 Sesiones' };
        case 'evalTDAH':
            return { amount: paymentConfig.pricing.evalTDAH, subject: 'Evaluación TDAH Adulto' };
        case 'evalAutismo':
            return { amount: paymentConfig.pricing.evalAutismo, subject: 'Evaluación TEA (Autismo)' };
        case 'evalInteligencia':
            return { amount: paymentConfig.pricing.evalInteligencia, subject: 'Evaluación Intelectual' };
        case 'evalNeuropsicologica':
            return { amount: paymentConfig.pricing.evalNeuropsicologica, subject: 'Evaluación Neuropsicológica Completa' };
        case 'evalEmocional':
            return { amount: paymentConfig.pricing.evalEmocional, subject: 'Evaluación Socioemocional' };
        case 'sesion':
        default:
            return { amount: paymentConfig.pricing.sesionIndividual, subject: 'Sesión de Psicoterapia Online' };
    }
};

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`paypal:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();

        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        const name = isNonEmptyString(body?.name, 200) ? body.name.trim() : '';
        const serviceType = typeof body?.serviceType === 'string' ? body.serviceType : 'sesion';

        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
        }

        const { amount: baseAmount, subject } = getServicePaymentDetails(serviceType);

        let amount: number = baseAmount;
        if (body.coupon) {
            const result = applyCoupon(body.coupon, amount);
            if (!result.ok) {
                return NextResponse.json({ error: result.reason }, { status: 400 });
            }
            amount = result.amount;
        }

        if (amount <= 0) {
            return NextResponse.json({ error: 'Este servicio no requiere pago PayPal' }, { status: 400 });
        }

        const commerceOrder = `PAYPAL-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

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
                reason: typeof body.motivo === 'string' ? body.motivo.slice(0, 2000) : '',
                details: typeof body.detalles === 'string' ? body.detalles.slice(0, 5000) : '',
                appointmentDate: body.appointmentDate || null,
                calEventTypeId: body.calEventTypeId || null,
                status: 'PENDING',
            },
        });

        await prisma.newsletter.upsert({
            where: { email },
            update: { active: true, name },
            create: { email, name, active: true },
        }).catch((err: unknown) => console.error('Silent newsletter upsert error:', err));

        const paypalOrder = await createPayPalOrder({
            amountClp: amount,
            commerceOrder,
            subject,
            returnUrl: `${baseUrl}/api/payments/paypal/return?orderId=${encodeURIComponent(commerceOrder)}`,
            cancelUrl: `${baseUrl}/pago/exito?order=${encodeURIComponent(commerceOrder)}&status=cancelled`,
        });

        sendBookingNotification({
            name,
            email,
            phone: body.phone,
            reason: body.motivo,
            details: body.detalles,
            amount,
            orderId: commerceOrder,
        }).catch(err => console.error('Silent error sending notification:', err));

        return NextResponse.json({
            success: true,
            paymentUrl: paypalOrder.approvalUrl,
            orderId: commerceOrder,
            paypalOrderId: paypalOrder.id,
            amount,
            paypalAmount: paypalOrder.value,
            paypalCurrency: paypalOrder.currencyCode,
        });
    } catch (error) {
        console.error('PayPal payment creation error:', error);
        return NextResponse.json({ error: 'No fue posible iniciar el pago PayPal' }, { status: 500 });
    }
}
