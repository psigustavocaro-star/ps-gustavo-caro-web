import { NextRequest, NextResponse } from 'next/server';
import { finalizePaidBooking } from '@/lib/services/booking-finalization';
import { verifyPayPalWebhook } from '@/lib/services/paypal';

export const dynamic = 'force-dynamic';

type PayPalEvent = {
    event_type?: string;
    resource?: {
        purchase_units?: Array<{ custom_id?: string; reference_id?: string; invoice_id?: string }>;
    };
};

const getOrderIdFromEvent = (event: PayPalEvent) => {
    const purchaseUnit = event?.resource?.purchase_units?.[0];
    return purchaseUnit?.custom_id || purchaseUnit?.reference_id || purchaseUnit?.invoice_id || null;
};

export async function POST(request: NextRequest) {
    try {
        // Fail-closed: en producción exigimos PAYPAL_WEBHOOK_ID y validamos firma.
        // En dev permitimos skip si la env var no está, para facilitar pruebas locales.
        if (process.env.NODE_ENV === 'production' && !process.env.PAYPAL_WEBHOOK_ID) {
            console.error('PayPal webhook called in production without PAYPAL_WEBHOOK_ID configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
        }

        const event = (await request.json()) as PayPalEvent;

        if (process.env.PAYPAL_WEBHOOK_ID) {
            const verified = await verifyPayPalWebhook(request, event);
            if (!verified) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const orderId = getOrderIdFromEvent(event);
            if (orderId) {
                const { default: prisma } = await import('@/lib/db');
                const booking = await prisma.booking.findUnique({ where: { orderId } });
                await finalizePaidBooking({
                    orderId,
                    amount: booking?.amount,
                    paymentMethod: 'PayPal',
                    auditLabel: 'WEBHOOK PAYPAL',
                    rawPaymentData: { event_type: event.event_type, orderId },
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ received: true });
    }
}
