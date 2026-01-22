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
            case 'planMensual':
                amount = paymentConfig.pricing.planMensual;
                subject = 'Pack de 4 Sesiones Integrativas';
                break;
            case 'evaluacion':
                amount = paymentConfig.pricing.evaluacion;
                subject = 'Evaluación Neuropsicológica';
                break;
            default:
                amount = paymentConfig.pricing.sesionIndividual;
                subject = 'Sesión de Psicoterapia Online';
        }

        // Generar ID único de orden
        const commerceOrder = `PSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Guardar en base de datos local
        console.log('API: Guardando reserva en DB...', { commerceOrder });
        const { default: prisma } = await import('@/lib/db');
        await prisma.booking.create({
            data: {
                orderId: commerceOrder,
                name,
                email,
                phone: body.phone || '',
                serviceType,
                amount,
                reason: motivo || '',
                details: detalles || '',
                status: 'PENDING',
            }
        });

        // Crear pago en Flow
        const payment = await createFlowPayment({
            amount,
            email,
            subject,
            commerceOrder,
            optional: {
                clientName: name,
                motivo: motivo || '',
                detalles: detalles || '',
                serviceType,
                phone: body.phone || '',
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
