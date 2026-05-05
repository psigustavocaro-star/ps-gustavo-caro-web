import { NextRequest, NextResponse } from 'next/server';
import { paymentConfig } from '@/lib/config/services';
import { createPayPalOrder } from '@/lib/services/paypal';
import { sendBookingNotification } from '@/lib/services/mail';

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

const applyCoupon = (amount: number, coupon?: string) => {
    if (!coupon) return amount;
    const normalized = coupon.toUpperCase();
    if (normalized === 'TEST100') return 350;
    if (normalized === 'GUSTAVO10') return Math.max(0, amount - 10000);
    return amount;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const serviceType = body.serviceType || 'sesion';
        const { amount: baseAmount, subject } = getServicePaymentDetails(serviceType);
        const amount = applyCoupon(baseAmount, body.coupon);

        if (!body.email || !body.name) {
            return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
        }

        if (amount <= 0) {
            return NextResponse.json({ error: 'Este servicio no requiere pago PayPal' }, { status: 400 });
        }

        const commerceOrder = `PAYPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

        const { default: prisma } = await import('@/lib/db');
        await prisma.booking.create({
            data: {
                orderId: commerceOrder,
                name: body.name,
                firstName: body.firstName || '',
                secondName: body.secondName || '',
                firstSurname: body.firstSurname || '',
                secondSurname: body.secondSurname || '',
                email: body.email,
                phone: body.phone || '',
                rut: body.rut || '',
                address: body.address || '',
                region: body.region || '',
                commune: body.commune || '',
                serviceType,
                amount,
                reason: body.motivo || '',
                details: body.detalles || '',
                appointmentDate: body.appointmentDate || null,
                calEventTypeId: body.calEventTypeId || null,
                status: 'PENDING',
            },
        });

        await prisma.newsletter.upsert({
            where: { email: body.email },
            update: { active: true, name: body.name },
            create: { email: body.email.toLowerCase(), name: body.name, active: true },
        }).catch((err: any) => console.error('Silent error registering newsletter:', err));

        const paypalOrder = await createPayPalOrder({
            amountClp: amount,
            commerceOrder,
            subject,
            returnUrl: `${baseUrl}/api/payments/paypal/return?orderId=${encodeURIComponent(commerceOrder)}`,
            cancelUrl: `${baseUrl}/pago/exito?order=${encodeURIComponent(commerceOrder)}&status=cancelled`,
        });

        sendBookingNotification({
            name: body.name,
            email: body.email,
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
    } catch (error: any) {
        console.error('PayPal payment creation error:', error);
        return NextResponse.json({ error: `PAYPAL ERROR: ${error.message}` }, { status: 500 });
    }
}
