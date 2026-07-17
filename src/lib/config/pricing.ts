// Fuente única de verdad para precios CLP visibles tanto en cliente como servidor.
// Mantener sincronizado con paymentConfig.pricing en src/lib/config/services.ts.
// (services.ts importa este módulo para evitar duplicación).

export const PRICING = {
    sesion: 36000,
    primeraConsulta: 0,
    packSesiones: 140000,
    evalTDAH: 135000,
    evalAutismo: 220000,
    evalWiscV: 135000,
    evalInteligencia: 160000,
    evalNeuropsicologica: 135000,
    evalEmocional: 140000,
} as const;

export type ServiceType = keyof typeof PRICING;

export const IN_PERSON_EVALUATION_TYPES = [
    'evalWiscV',
    'evalTDAH',
    'evalNeuropsicologica',
] as const;

export function isInPersonEvaluation(serviceType: string): boolean {
    return IN_PERSON_EVALUATION_TYPES.includes(
        serviceType as (typeof IN_PERSON_EVALUATION_TYPES)[number]
    );
}

export function getServicePrice(serviceType: string): number {
    if (serviceType in PRICING) return PRICING[serviceType as ServiceType];
    if (serviceType.startsWith('evalFree')) return 0;
    return 0;
}

// Cal.com event type IDs. Los IDs específicos por servicio vienen de env vars
// (NEXT_PUBLIC_CALCOM_EVENT_*). Si no están definidos, cae al ID de sesión.
export function getCalEventTypeId(serviceType: string): number | null {
    // Requieren sala presencial arrendada por hora. La fecha se coordina
    // después del pago y no debe bloquearse automáticamente en Cal.com.
    if (isInPersonEvaluation(serviceType)) return null;

    const ids: Record<string, string | undefined> = {
        sesion: process.env.NEXT_PUBLIC_CALCOM_EVENT_SESION_ID,
        primeraConsulta: process.env.NEXT_PUBLIC_CALCOM_EVENT_PRIMERA_ID,
        packSesiones: process.env.NEXT_PUBLIC_CALCOM_EVENT_SESION_ID,
        evalTDAH: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
        evalAutismo: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
        evalWiscV: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
        evalInteligencia: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
        evalNeuropsicologica: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
        evalEmocional: process.env.NEXT_PUBLIC_CALCOM_EVENT_EVALUACION_ID,
    };
    const raw = ids[serviceType] || process.env.NEXT_PUBLIC_CALCOM_EVENT_SESION_ID;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
}
