import { invoiceConfig } from '../config/services';

interface InvoiceData {
    clientRut?: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    description: string;
    paymentMethod: string;
    commerceOrder: string;
}

interface InvoiceResult {
    success: boolean;
    invoiceNumber?: string;
    invoiceUrl?: string;
    error?: string;
}

/**
 * Genera una boleta de honorarios electrónica
 */
export async function generateInvoice(data: InvoiceData): Promise<InvoiceResult> {
    const { provider } = invoiceConfig;

    switch (provider) {
        case 'bsale':
            return generateBsaleInvoice(data);
        case 'sii-directo':
            return generateSIIInvoice(data);
        default:
            // Fallback: generar boleta manual y notificar
            return generateManualInvoice(data);
    }
}

/**
 * Genera boleta via Bsale API
 */
async function generateBsaleInvoice(data: InvoiceData): Promise<InvoiceResult> {
    const { bsale, tipoDTE, emisor } = invoiceConfig;

    try {
        // 1. Crear cliente si no existe
        const clientResponse = await fetch(`${bsale.apiUrl}/clients.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': bsale.accessToken,
            },
            body: JSON.stringify({
                firstName: data.clientName,
                email: data.clientEmail,
                code: data.clientRut || 'SIN-RUT',
            }),
        });

        const client = await clientResponse.json();

        // 2. Crear documento (boleta)
        const documentResponse = await fetch(`${bsale.apiUrl}/documents.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': bsale.accessToken,
            },
            body: JSON.stringify({
                documentTypeId: tipoDTE,
                emissionDate: Math.floor(Date.now() / 1000),
                expirationDate: Math.floor(Date.now() / 1000),
                clientId: client.id,
                netAmount: data.amount,
                taxAmount: 0, // Boleta honorarios exenta
                totalAmount: data.amount,
                details: [
                    {
                        netUnitValue: data.amount,
                        quantity: 1,
                        comment: data.description,
                        discount: 0,
                    }
                ],
                payments: [
                    {
                        paymentTypeId: 1, // Efectivo/Transferencia
                        amount: data.amount,
                    }
                ],
            }),
        });

        if (!documentResponse.ok) {
            throw new Error('Error creating Bsale document');
        }

        const document = await documentResponse.json();

        return {
            success: true,
            invoiceNumber: document.number?.toString(),
            invoiceUrl: document.urlPublicView,
        };

    } catch (error) {
        console.error('Bsale invoice error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error generando boleta',
        };
    }
}

/**
 * Genera boleta directamente con SII (requiere certificado digital)
 */
async function generateSIIInvoice(data: InvoiceData): Promise<InvoiceResult> {
    // Esta integración requiere:
    // 1. Certificado digital del SII
    // 2. Firma electrónica del DTE
    // 3. Envío al SII y timbraje

    // Por complejidad, se recomienda usar un proveedor como Bsale/Facele
    console.log('SII Direct integration requires digital certificate setup');

    return {
        success: false,
        error: 'Integración SII directa requiere configuración de certificado digital. Use Bsale o Facele.',
    };
}

/**
 * Fallback: Registra la venta y notifica para generar boleta manual
 */
async function generateManualInvoice(data: InvoiceData): Promise<InvoiceResult> {
    // Guardar en base de datos o archivo para procesamiento manual
    console.log('Manual invoice pending:', data);

    // Enviar notificación por email al profesional
    // await sendEmail({ to: 'psi.gustavocaro@gmail.com', subject: 'Nueva boleta pendiente', ... });

    return {
        success: true,
        invoiceNumber: `MANUAL-${data.commerceOrder}`,
        error: 'Boleta será generada manualmente dentro de 24 horas.',
    };
}

/**
 * Envía la boleta por email al cliente
 */
export async function sendInvoiceEmail(
    email: string,
    invoiceUrl: string,
    invoiceNumber: string,
    clientName: string
): Promise<boolean> {
    // Integración con servicio de email (Resend, SendGrid, etc.)
    // Por ahora, log para desarrollo
    console.log(`Sending invoice ${invoiceNumber} to ${email}: ${invoiceUrl}`);

    // TODO: Implementar envío real de email
    // await resend.emails.send({
    //     from: 'Ps. Gustavo Caro <contacto@psgustavocaro.cl>',
    //     to: email,
    //     subject: `Tu boleta de sesión - ${invoiceNumber}`,
    //     html: `<p>Hola ${clientName}, adjunto tu boleta...</p>`,
    // });

    return true;
}
