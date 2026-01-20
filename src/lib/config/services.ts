// Configuración de servicios de pago y facturación
// IMPORTANTE: Estas credenciales deben estar en variables de entorno (.env.local)

const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // Usar rutas relativas en el cliente
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export const paymentConfig = {
    // Flow - Pasarela de pagos Chile
    flow: {
        apiKey: process.env.FLOW_API_KEY || '',
        secretKey: process.env.FLOW_SECRET_KEY || '',
        apiUrl: process.env.FLOW_API_URL || 'https://sandbox.flow.cl/api',
    },

    // Configuración de precios
    pricing: {
        sesionIndividual: 40000, // CLP
        planMensual: 115000,     // CLP (4 sesiones)
        evaluacion: 80000,      // CLP
    },

    // URLs de retorno
    urls: {
        success: `${getBaseUrl()}/pago/exito`,
        failure: `${getBaseUrl()}/pago/error`,
        pending: `${getBaseUrl()}/pago/pendiente`,
    }
};

export const invoiceConfig = {
    // Proveedor de facturación electrónica (Bsale, Facele, Nubox, etc.)
    // O integración directa con SII
    provider: 'bsale', // Opciones: 'bsale', 'facele', 'sii-directo'

    bsale: {
        accessToken: process.env.BSALE_ACCESS_TOKEN || '',
        apiUrl: 'https://api.bsale.cl/v1',
    },

    // Datos del emisor (tu información)
    emisor: {
        rut: process.env.EMISOR_RUT || '12.345.678-9',
        razonSocial: 'Gustavo Caro Psicología',
        giro: 'Servicios de Psicología',
        direccion: 'Santiago, Chile',
        comuna: 'Santiago',
        ciudad: 'Santiago',
    },

    // Tipo de documento
    tipoDTE: 39, // 39 = Boleta Electrónica, 41 = Boleta Exenta
};

export const calendarConfig = {
    // Integración con Cal.com o Calendly
    provider: 'cal.com', // Opciones: 'cal.com', 'calendly'

    calcom: {
        apiKey: process.env.CALCOM_API_KEY || '',
        eventTypeId: process.env.CALCOM_EVENT_TYPE_ID || '',
    },

    calendly: {
        accessToken: process.env.CALENDLY_ACCESS_TOKEN || '',
        eventUri: process.env.CALENDLY_EVENT_URI || '',
    }
};
