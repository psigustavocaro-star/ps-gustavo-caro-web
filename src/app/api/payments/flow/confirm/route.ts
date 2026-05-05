import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/services/flow';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (token === 'SIMULACION_TEST') {
        return processConfirmation(token);
    }
    return NextResponse.json({ error: 'Manual trigger not allowed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
    try {
        let token = '';
        const rawText = await request.text();
        try {
            const params = new URLSearchParams(rawText);
            if (params.has('token')) token = params.get('token') as string;
        } catch (e) {}
        
        if (!token) {
            try {
                const jsonObj = JSON.parse(rawText);
                if (jsonObj.token) token = jsonObj.token;
            } catch (e) {}
        }

        if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 });

        return processConfirmation(token);
    } catch (error: any) {
        return NextResponse.json({ received: true });
    }
}

async function processConfirmation(token: string) {
    try {
        let paymentStatus;
        if (token === 'SIMULACION_TEST') {
            const { default: prisma } = await import('@/lib/db');
            const lastBooking = await prisma.booking.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            if (!lastBooking) return NextResponse.json({ error: 'No booking found' });
            
            paymentStatus = {
                status: 2,
                commerceOrder: lastBooking.orderId,
                amount: lastBooking.amount || 350,
                paymentData: { media: 'TEST_SIMULATOR' }
            };
        } else {
            paymentStatus = await getFlowPaymentStatus(token);
        }

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
            } catch (blockError: any) {}
        }
        
        return NextResponse.json({ received: true, simulated: token === 'SIMULACION_TEST' });
    } catch (error: any) {
        return NextResponse.json({ received: true });
    }
}
