import { NextRequest, NextResponse } from 'next/server';
import { finalizePaidBooking } from '@/lib/services/booking-finalization';
import { verifyPayPalWebhook } from '@/lib/services/paypal';

export const dynamic = 'force-dynamic';

const getOrderIdFromEvent = (event: any) => {
    const purchaseUnit = event?.resource?.purchase_units?.[0];
    return purchaseUnit?.custom_id || purchaseUnit?.reference_id || purchaseUnit?.invoice_id || null;
};

export async function POST(request: NextRequest) {
    try {
        const event = await request.json();

        if (process.env.PAYPAL_WEBHOOK_ID) {
            const verified = await verifyPayPalWebhook(request, event);
            if (!verified) {
                return NextResponse.json({ error: 'Invalid PayPal webhook signature' }, { status: 400 });
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
                    rawPaymentData: event,
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ received: true });
    }
}
