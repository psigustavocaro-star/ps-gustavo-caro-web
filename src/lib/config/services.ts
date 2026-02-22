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

    // Configuración de precios en CLP
    pricing: {
        // Sesiones de psicoterapia
        sesionIndividual: 40000,     // CLP - Sesión individual (45 min)
        primeraConsulta: 0,          // CLP - Primera sesión GRATIS
        packSesiones: 140000,        // CLP - Pack 4 sesiones (ahorro de $20.000)

        // Evaluaciones neuropsicológicas (4 sesiones + feedback + informe)
        evalTDAH: 180000,            // Evaluación TDAH Adulto
        evalAutismo: 220000,         // Evaluación TEA (ADOS-2)
        evalInteligencia: 160000,    // Evaluación Intelectual (WISC-V / WAIS-IV)
        evalNeuropsicologica: 240000, // Evaluación Neuropsicológica Completa
        evalEmocional: 140000,       // Evaluación Socioemocional
    },

    // URLs de retorno
    urls: {
        success: `${getBaseUrl()}/pago/exito`,
        failure: `${getBaseUrl()}/pago/error`,
        pending: `${getBaseUrl()}/pago/pendiente`,
    }
};

// Catálogo de servicios con descripciones
export const serviceCatalog = {
    // Psicoterapia
    sesion: {
        id: 'sesion',
        name: 'Sesión Individual',
        price: paymentConfig.pricing.sesionIndividual,
        description: 'Sesión de psicoterapia TCC de 45 minutos.',
        duration: '45 min',
    },
    primeraConsulta: {
        id: 'primeraConsulta',
        name: 'Primera Consulta',
        price: paymentConfig.pricing.primeraConsulta,
        description: 'Sesión inicial de evaluación sin costo (20 minutos). Conocemos tu caso y definimos objetivos.',
        duration: '20 min',
        badge: '¡GRATIS!',
    },
    evalFreeNeuro: {
        id: 'evalFreeNeuro',
        name: 'Sesión Inicial de Evaluación',
        price: 0,
        description: 'Entrevista obligatoria previa a cualquier proceso de evaluación.',
        duration: '15-20 min',
        badge: 'GRATIS',
    },
    packSesiones: {
        id: 'packSesiones',
        name: 'Pack 4 Sesiones',
        price: paymentConfig.pricing.packSesiones,
        description: 'Cuatro sesiones de psicoterapia con ahorro incluido. Ideal para procesos continuados.',
        duration: '4 × 45 min',
        savings: 20000,
    },

    // Evaluaciones Neuropsicológicas
    evalTDAH: {
        id: 'evalTDAH',
        name: 'Evaluación TDAH Adulto',
        price: paymentConfig.pricing.evalTDAH,
        description: 'Evaluación completa de TDAH en adultos. Incluye 4 sesiones, aplicación de pruebas estandarizadas, entrevista clínica, sesión de feedback y entrega de informe detallado.',
        duration: '4 sesiones',
        includes: ['Entrevista clínica estructurada', 'Escalas ASRS, CAARS', 'Pruebas de atención CPT', 'Informe clínico'],
    },
    evalAutismo: {
        id: 'evalAutismo',
        name: 'Evaluación TEA (Autismo)',
        price: paymentConfig.pricing.evalAutismo,
        description: 'Evaluación de Trastorno del Espectro Autista con ADOS-2. Incluye 4 sesiones, observación clínica, entrevistas, sesión de feedback y entrega de informe diagnóstico.',
        duration: '4 sesiones',
        includes: ['ADOS-2 (Observación)', 'Entrevista ADI-R', 'Evaluación funcional', 'Informe diagnóstico'],
    },
    evalInteligencia: {
        id: 'evalInteligencia',
        name: 'Evaluación Intelectual',
        price: paymentConfig.pricing.evalInteligencia,
        description: 'Evaluación de capacidad intelectual con WISC-V (niños) o WAIS-IV (adultos). Incluye 4 sesiones, aplicación completa del test, sesión de feedback y entrega de informe con perfil cognitivo.',
        duration: '4 sesiones',
        includes: ['WISC-V o WAIS-IV', 'Análisis de índices', 'Perfil cognitivo', 'Recomendaciones'],
    },
    evalNeuropsicologica: {
        id: 'evalNeuropsicologica',
        name: 'Evaluación Neuropsicológica Completa',
        price: paymentConfig.pricing.evalNeuropsicologica,
        description: 'Evaluación integral de funciones cognitivas: atención, memoria, funciones ejecutivas, lenguaje y más. Incluye 4-5 sesiones, batería completa de pruebas, sesión de feedback y entrega de informe.',
        duration: '4-5 sesiones',
        includes: ['Batería neuropsicológica', 'Pruebas de memoria', 'Funciones ejecutivas', 'Informe extenso'],
    },
    evalEmocional: {
        id: 'evalEmocional',
        name: 'Evaluación Socioemocional',
        price: paymentConfig.pricing.evalEmocional,
        description: 'Evaluación del funcionamiento emocional y social. Incluye 4 sesiones con pruebas proyectivas y psicométricas, sesión de feedback y entrega de informe con plan de intervención.',
        duration: '4 sesiones',
        includes: ['Tests proyectivos', 'Inventarios emocionales', 'Habilidades sociales', 'Plan de intervención'],
    },
};

export const invoiceConfig = {
    // Proveedor de facturación electrónica (Bsale, Facele, Nubox, etc.)
    // O integración directa con SII (vía SimpleAPI)
    provider: 'sii-directo', // Opciones: 'bsale', 'facele', 'sii-directo'

    simpleapi: {
        apiKey: process.env.SIMPLE_API_KEY || '',
        siiClave: process.env.SII_CLAVE || '',
    },

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
        eventTypes: {
            sesion: process.env.NEXT_PUBLIC_CALCOM_EVENT_SESION_ID || '',
            primeraConsulta: process.env.NEXT_PUBLIC_CALCOM_EVENT_PRIMERA_ID || '',
            packSesiones: process.env.NEXT_PUBLIC_CALCOM_EVENT_PACK_ID || '',
            evaluacion: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID || '',
        }
    },

    calendly: {
        accessToken: process.env.CALENDLY_ACCESS_TOKEN || '',
        eventUri: process.env.CALENDLY_EVENT_URI || '',
    }
};

