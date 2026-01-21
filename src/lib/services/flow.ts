import crypto from 'crypto';
import { paymentConfig } from '../config/services';

interface FlowPaymentParams {
    amount: number;
    email: string;
    subject: string;
    commerceOrder: string;
    optional?: Record<string, string>;
}

interface FlowPaymentResponse {
    url: string;
    token: string;
    flowOrder: number;
}

/**
 * Crea una orden de pago en Flow
 */
export async function createFlowPayment(params: FlowPaymentParams): Promise<FlowPaymentResponse> {
    const { flow } = paymentConfig;

    const data = {
        apiKey: flow.apiKey,
        commerceOrder: params.commerceOrder,
        subject: params.subject,
        currency: 'CLP',
        amount: params.amount,
        email: params.email,
        urlConfirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/flow/confirm`,
        urlReturn: paymentConfig.urls.success,
        optional: JSON.stringify(params.optional || {}),
    };

    // Crear firma
    const signature = signFlowData(data, flow.secretKey);

    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    formData.append('s', signature);

    const response = await fetch(`${flow.apiUrl}/payment/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Flow API error response:', errorText);
        throw new Error(`Flow API Error (${response.status}): ${errorText}`);
    }

    let result;
    try {
        result = await response.json();
    } catch (e) {
        const text = await response.text();
        console.error('Flow response is not JSON:', text);
        throw new Error('Flow API returned invalid JSON');
    }

    return {
        url: result.url + '?token=' + result.token,
        token: result.token,
        flowOrder: result.flowOrder,
    };
}

/**
 * Obtiene el estado de un pago en Flow
 */
export async function getFlowPaymentStatus(token: string): Promise<{
    status: number;
    statusMessage: string;
    commerceOrder: string;
    amount: number;
    email: string;
    paymentData?: {
        date: string;
        media: string;
        conversionDate?: string;
        conversionRate?: number;
        amount: number;
        currency: string;
        fee: number;
        balance: number;
    };
}> {
    const { flow } = paymentConfig;

    const data = {
        apiKey: flow.apiKey,
        token: token,
    };

    const signature = signFlowData(data, flow.secretKey);

    const response = await fetch(`${flow.apiUrl}/payment/getStatus?apiKey=${flow.apiKey}&token=${token}&s=${signature}`);

    if (!response.ok) {
        throw new Error('Error getting payment status');
    }

    return response.json();
}

/**
 * Firma los datos para Flow
 */
function signFlowData(data: Record<string, unknown>, secretKey: string): string {
    // Ordenar keys alfabéticamente
    const sortedKeys = Object.keys(data).sort();

    // Concatenar key=value
    const toSign = sortedKeys.map(key => `${key}${data[key]}`).join('');

    // HMAC SHA256
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

/**
 * Verifica la firma de un callback de Flow
 */
export function verifyFlowSignature(data: Record<string, unknown>, signature: string): boolean {
    const { flow } = paymentConfig;
    const calculatedSignature = signFlowData(data, flow.secretKey);
    return calculatedSignature === signature;
}
