type PayPalLink = {
    href: string;
    rel: string;
    method: string;
};

type PayPalOrderResponse = {
    id: string;
    status: string;
    links?: PayPalLink[];
};

const getPayPalBaseUrl = () => {
    return process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
};

const getAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET deben estar configurados');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal OAuth error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.access_token as string;
};

export const getPayPalCurrency = () => process.env.PAYPAL_CURRENCY || 'USD';

export const convertClpToPayPalAmount = (amountClp: number) => {
    const currency = getPayPalCurrency();

    if (currency === 'CLP') {
        return String(Math.round(amountClp));
    }

    const clpPerUnit = Number(process.env.PAYPAL_CLP_PER_UNIT || process.env.PAYPAL_CLP_PER_USD || 950);
    if (!Number.isFinite(clpPerUnit) || clpPerUnit <= 0) {
        throw new Error('PAYPAL_CLP_PER_UNIT debe ser un número mayor a 0');
    }

    return (Math.ceil((amountClp / clpPerUnit) * 100) / 100).toFixed(2);
};

export async function createPayPalOrder(params: {
    amountClp: number;
    commerceOrder: string;
    subject: string;
    returnUrl: string;
    cancelUrl: string;
}) {
    const accessToken = await getAccessToken();
    const currencyCode = getPayPalCurrency();
    const value = convertClpToPayPalAmount(params.amountClp);

    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': params.commerceOrder,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: params.commerceOrder,
                    custom_id: params.commerceOrder,
                    invoice_id: params.commerceOrder,
                    description: params.subject.substring(0, 127),
                    amount: {
                        currency_code: currencyCode,
                        value,
                    },
                },
            ],
            payment_source: {
                paypal: {
                    experience_context: {
                        payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                        landing_page: 'LOGIN',
                        shipping_preference: 'NO_SHIPPING',
                        user_action: 'PAY_NOW',
                        return_url: params.returnUrl,
                        cancel_url: params.cancelUrl,
                    },
                },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal create order error (${response.status}): ${errorText}`);
    }

    const order = (await response.json()) as PayPalOrderResponse;
    const approvalUrl = order.links?.find(link => link.rel === 'payer-action' || link.rel === 'approve')?.href;

    if (!approvalUrl) {
        throw new Error('PayPal no devolvió URL de aprobación');
    }

    return {
        id: order.id,
        status: order.status,
        approvalUrl,
        currencyCode,
        value,
    };
}

export async function capturePayPalOrder(payPalOrderId: string, requestId: string) {
    const accessToken = await getAccessToken();

    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${payPalOrderId}/capture`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `${requestId}-capture`,
        },
        body: '{}',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(`PayPal capture error (${response.status}): ${JSON.stringify(data)}`);
    }

    return data;
}

export async function verifyPayPalWebhook(request: Request, event: unknown) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) return false;

    const accessToken = await getAccessToken();
    const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            auth_algo: request.headers.get('paypal-auth-algo'),
            cert_url: request.headers.get('paypal-cert-url'),
            transmission_id: request.headers.get('paypal-transmission-id'),
            transmission_sig: request.headers.get('paypal-transmission-sig'),
            transmission_time: request.headers.get('paypal-transmission-time'),
            webhook_id: webhookId,
            webhook_event: event,
        }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}
