import prisma from '@/lib/db';
import { PRIVACY_POLICY_VERSION } from './consent-log';

// Genera el paquete de datos personales asociados a un email.
// Estructurado para responder solicitudes de "Acceso" (Ley 21.719 art. 5°).
export async function buildArcoExport(email: string) {
    const normalized = email.trim().toLowerCase();

    const [bookings, newsletter, consents] = await Promise.all([
        prisma.booking.findMany({
            where: { email: { equals: normalized, mode: 'insensitive' } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.newsletter.findUnique({ where: { email: normalized } }),
        prisma.consentLog.findMany({
            where: { email: normalized },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const latest = bookings[0];

    return {
        _meta: {
            generado: new Date().toISOString(),
            versionPolitica: PRIVACY_POLICY_VERSION,
            responsable: 'Ps. Gustavo Caro',
            emailConsulta: normalized,
            baseLegal: 'Ley N° 19.628 y Ley N° 21.719 sobre Protección de Datos Personales (Chile)',
        },
        datosPersonales: latest
            ? {
                nombre: latest.name,
                primerNombre: latest.firstName,
                segundoNombre: latest.secondName,
                primerApellido: latest.firstSurname,
                segundoApellido: latest.secondSurname,
                email: normalized,
                rut: latest.rut,
                telefono: latest.phone,
                direccion: latest.address,
                comuna: latest.commune,
                region: latest.region,
                pais: latest.country,
            }
            : {
                email: normalized,
                nota: 'No hay reservas asociadas — solo se conoce el email a través del newsletter.',
            },
        reservas: bookings.map(b => ({
            orderId: b.orderId,
            servicio: b.serviceType,
            monto: b.amount,
            moneda: 'CLP',
            estado: b.status,
            motivo: b.reason,
            detalles: b.details,
            fechaCita: b.appointmentDate,
            fechasCitasPack: b.appointmentDates,
            zonaHoraria: b.attendeeTimeZone,
            fechaPago: b.paidAt?.toISOString() || null,
            boletaEmitida: b.siiReceiptIssued,
            fechaBoleta: b.siiReceiptIssuedAt?.toISOString() || null,
            calBookingId: b.calBookingId,
            creado: b.createdAt.toISOString(),
            actualizado: b.updatedAt.toISOString(),
        })),
        newsletter: newsletter
            ? {
                suscrito: newsletter.active,
                nombre: newsletter.name,
                fechaSuscripcion: newsletter.createdAt.toISOString(),
                fechaConfirmacion: newsletter.confirmedAt?.toISOString() || null,
                pasoActualSecuencia: newsletter.currentStep,
                ultimoEnvio: newsletter.lastSentAt.toISOString(),
            }
            : {
                suscrito: false,
                nota: 'No hay suscripción al newsletter para este email.',
            },
        consentimientos: consents.map(c => ({
            tipo: c.type,
            versionPoliticaAceptada: c.version,
            otorgado: c.granted,
            contexto: c.context,
            fecha: c.createdAt.toISOString(),
            direccionIp: c.ip,
            navegadorUsado: c.userAgent,
        })),
        derechos: {
            informacion: 'Tienes derecho a solicitar Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Bloqueo sobre estos datos.',
            comoEjercerlos: 'Escribiendo a psi.gustavocaro@gmail.com o vía https://psgustavocaro.cl/derechos-arco',
        },
    };
}

export type ArcoExport = Awaited<ReturnType<typeof buildArcoExport>>;
