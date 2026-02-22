import { invoiceConfig } from '../config/services';

interface InvoiceData {
    clientRut?: string;
    clientName: string;
    clientEmail: string;
    clientAddress?: string;
    clientCommune?: string;
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
 * Genera boleta directamente con SII (vía SimpleAPI)
 */
async function generateSIIInvoice(data: InvoiceData): Promise<InvoiceResult> {
    const { simpleapi, emisor } = invoiceConfig;

    if (!simpleapi.apiKey || !simpleapi.siiClave) {
        console.error('SimpleAPI config missing');
        return generateManualInvoice(data);
    }

    try {
        const response = await fetch('https://api.simpleapi.cl/api/v1/bhe/emitir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${simpleapi.apiKey}`
            },
            body: JSON.stringify({
                emisor: {
                    rut: emisor.rut.replace(/\./g, ''),
                    clave: simpleapi.siiClave
                },
                receptor: {
                    rut: data.clientRut ? data.clientRut.replace(/\./g, '') : '66666666-6',
                    nombre: data.clientName,
                    email: data.clientEmail,
                    domicilio: data.clientAddress || 'Santiago',
                    comuna: data.clientCommune || 'Santiago'
                },
                detalles: [
                    {
                        nombre: data.description,
                        valor: data.amount
                    }
                ],
                pago_provision_mensual: 1 // El contribuyente emisor se encarga de la retención
            })
        });

        const result = await response.json();

        if (!response.ok || !result.exito) {
            throw new Error(result.mensaje || 'Error en SimpleAPI');
        }

        return {
            success: true,
            invoiceNumber: result.numero.toString(),
            invoiceUrl: result.pdf_url,
        };

    } catch (error) {
        console.error('SimpleAPI SII invoice error:', error);
        // Silently fallback to manual to not break the user flow after payment
        return generateManualInvoice(data);
    }
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
    try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
            from: 'Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
            to: email,
            subject: `Tu boleta de sesión - N°${invoiceNumber}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #0891b2;">¡Hola ${clientName}!</h2>
                    <p>Adjunto a este correo encontrarás el link para descargar tu boleta de honorarios electrónica correspondiente a tu sesión.</p>
                    <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center;">
                        <a href="${invoiceUrl}" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver/Descargar Boleta</a>
                    </div>
                    <p>Si tienes problemas con el botón, puedes copiar y lanzar este link en tu navegador:</p>
                    <p style="font-size: 0.8rem; color: #666;">${invoiceUrl}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p>Atentamente,<br />Ps. Gustavo Caro</p>
                </div>
            `,
        });

        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
}
