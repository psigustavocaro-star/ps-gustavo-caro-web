import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/services/paypal';
import { finalizePaidBooking } from '@/lib/services/booking-finalization';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const payPalOrderId = searchParams.get('token');
    const orderId = searchParams.get('orderId');

    if (!payPalOrderId || !orderId) {
        return NextResponse.redirect(new URL('/pago/exito?order=N/A', request.url), 302);
    }

    try {
        const capture = await capturePayPalOrder(payPalOrderId, orderId);

        if (capture.status === 'COMPLETED') {
            const { default: prisma } = await import('@/lib/db');
            const booking = await prisma.booking.findUnique({ where: { orderId } });
            await finalizePaidBooking({
                orderId,
                amount: booking?.amount,
                paymentMethod: 'PayPal',
                auditLabel: 'PAGO PAYPAL',
                rawPaymentData: capture,
            });
        }

        return NextResponse.redirect(new URL(`/pago/exito?order=${encodeURIComponent(orderId)}`, request.url), 302);
    } catch (error: any) {
        console.error('PayPal return capture error:', error);
        return NextResponse.redirect(new URL(`/pago/exito?order=${encodeURIComponent(orderId)}&status=error`, request.url), 302);
    }
}
