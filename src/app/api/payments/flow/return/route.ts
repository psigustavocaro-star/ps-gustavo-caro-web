import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/services/flow';

export async function POST(request: NextRequest) {
    try {
        let token = '';

        // Flow envía los datos vía POST form data
        try {
            const formData = await request.formData();
            token = formData.get('token') as string;
        } catch (e) {}

        // En caso excepcional que lo mande por query
        if (!token) {
            token = request.nextUrl.searchParams.get('token') || '';
        }

        if (!token) {
            return NextResponse.redirect(new URL('/pago/exito?order=N/A', request.url), 302);
        }

        // Obtener el ID de la orden (commerceOrder)
        const paymentStatus = await getFlowPaymentStatus(token);
        const orderId = paymentStatus.commerceOrder || 'N/A';

        // Redirigir limpiamente a la página de éxito frontend usando método GET
        return NextResponse.redirect(new URL(`/pago/exito?order=${orderId}`, request.url), 302);
    } catch (error) {
        console.error('Error in flow return handler:', error);
        return NextResponse.redirect(new URL('/pago/exito?order=N/A', request.url), 302);
    }
}
