import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/services/flow';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
    try {
        let token = '';
        const rawText = await request.text();
        try {
            const params = new URLSearchParams(rawText);
            if (params.has('token')) token = params.get('token') as string;
        } catch {}

        if (!token) {
            try {
                const jsonObj = JSON.parse(rawText);
                if (jsonObj.token) token = jsonObj.token;
            } catch {}
        }

        if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 });

        // Authoritative status comes from Flow API (HMAC-signed with our secret).
        const paymentStatus = await getFlowPaymentStatus(token);

        if (paymentStatus.status === 2) {
            const orderId = paymentStatus.commerceOrder;
            try {
                const { finalizePaidBooking } = await import('@/lib/services/booking-finalization');
                await finalizePaidBooking({
                    orderId,
                    amount: paymentStatus.amount,
                    paymentMethod: paymentStatus.paymentData?.media || 'Webpay',
                    auditLabel: 'PAGO FLOW',
                    rawPaymentData: paymentStatus,
                });
            } catch (finalizeError) {
                console.error('Flow confirm: finalize error', finalizeError);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Flow confirm error:', error);
        return NextResponse.json({ received: true });
    }
}
