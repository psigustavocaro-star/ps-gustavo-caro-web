import prisma from '@/lib/db';

// Versión actual de la política de privacidad. Actualiza esto cuando
// modifiques /privacidad de forma sustancial — así el registro histórico
// deja constancia de qué versión aceptó cada usuario.
export const PRIVACY_POLICY_VERSION = '2026-08';

export type ConsentType = 'privacy' | 'newsletter' | 'cookies';

export async function logConsent(params: {
    email: string;
    type: ConsentType;
    granted?: boolean;
    context?: string;
    ip?: string | null;
    userAgent?: string | null;
    version?: string;
}) {
    try {
        await prisma.consentLog.create({
            data: {
                email: params.email.trim().toLowerCase(),
                type: params.type,
                version: params.version || PRIVACY_POLICY_VERSION,
                granted: params.granted !== false,
                context: params.context || null,
                ip: params.ip || null,
                userAgent: (params.userAgent || null)?.slice(0, 500) || null,
            },
        });
    } catch (err) {
        console.error('logConsent error:', err);
    }
}
