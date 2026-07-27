import { Resend } from 'resend';
import prisma from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_INACTIVE_DAYS = 45;
const DEFAULT_MAX_SENDS = 60;

function firstNameFromBooking(name?: string | null, firstName?: string | null) {
    const explicit = firstName?.trim();
    if (explicit) return explicit;

    const fromFullName = name?.trim().split(/\s+/)[0];
    return fromFullName || 'hola';
}

function latestDateFromBooking(booking: {
    paidAt: Date | null;
    appointmentDate: string | null;
    appointmentDates: string[];
    createdAt: Date;
}) {
    const candidates = [
        booking.paidAt?.getTime(),
        booking.createdAt.getTime(),
        booking.appointmentDate ? Date.parse(booking.appointmentDate) : undefined,
        ...booking.appointmentDates.map((date) => Date.parse(date)),
    ].filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    return new Date(Math.max(...candidates));
}

function hasFutureAppointment(booking: { appointmentDate: string | null; appointmentDates: string[] }, now: Date) {
    const dates = booking.appointmentDates.length > 0
        ? booking.appointmentDates
        : booking.appointmentDate ? [booking.appointmentDate] : [];

    return dates.some((date) => {
        const timestamp = Date.parse(date);
        return Number.isFinite(timestamp) && timestamp > now.getTime();
    });
}

function renderReactivationEmail(name: string) {
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.65; color: #263238; max-width: 640px; margin: 0 auto;">
            <p style="display:none; max-height:0; overflow:hidden; opacity:0;">Un recordatorio cercano por si quieres retomar tu proceso terapeutico.</p>
            <p>Hola ${name},</p>
            <p>Te escribo con un recordatorio simple y sin presion: si en algun momento quedaste con ganas de retomar tu proceso, revisar como has estado o volver a ordenar algunos temas, puedes agendar una nueva sesion.</p>
            <p>A veces uno espera estar muy sobrepasado para pedir ayuda, pero tambien es valido volver antes: para prevenir recaidas, ajustar herramientas o tener un espacio tranquilo donde pensar lo que viene pasando.</p>
            <div style="background: #f0fdfa; border-left: 4px solid #0891b2; padding: 16px 18px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0;"><strong>Pregunta breve para esta semana:</strong><br/>Si tuvieras una sesion ahora, que tema te gustaria poder mirar con mas calma?</p>
            </div>
            <p>Si te hace sentido, puedes revisar los horarios disponibles aqui:</p>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${siteUrl}/agendar" style="background: #0891b2; color: #ffffff; padding: 13px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Agendar una nueva sesion</a>
            </div>
            <p style="font-size: 14px; color: #52616b;">Si estas bien por ahora, no necesitas hacer nada. Este correo es solo una invitacion a retomar si lo necesitas.</p>
            <p>Un abrazo,<br/><strong>Ps. Gustavo Caro</strong></p>
        </div>
    `;
}

export async function processPatientReactivation() {
    const now = new Date();
    const inactiveDays = Number(process.env.REACTIVATION_INACTIVE_DAYS || DEFAULT_INACTIVE_DAYS);
    const maxSends = Number(process.env.REACTIVATION_MAX_SENDS || DEFAULT_MAX_SENDS);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - inactiveDays);

    const bookings = await prisma.booking.findMany({
        where: {
            status: 'PAID',
            email: { not: '' },
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            firstName: true,
            email: true,
            paidAt: true,
            appointmentDate: true,
            appointmentDates: true,
            createdAt: true,
        },
    });

    const latestByEmail = new Map<string, typeof bookings[number]>();

    for (const booking of bookings) {
        const email = booking.email.trim().toLowerCase();
        if (!email) continue;

        const current = latestByEmail.get(email);
        if (!current || latestDateFromBooking(booking) > latestDateFromBooking(current)) {
            latestByEmail.set(email, booking);
        }
    }

    const candidates = Array.from(latestByEmail.values())
        .filter((booking) => latestDateFromBooking(booking) <= cutoff)
        .filter((booking) => !hasFutureAppointment(booking, now))
        .slice(0, maxSends);

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const booking of candidates) {
        const email = booking.email.trim().toLowerCase();
        const subscriber = await prisma.newsletter.findUnique({ where: { email } }).catch(() => null);

        if (subscriber?.active === false) {
            results.push({ email, success: false, error: 'subscriber_inactive' });
            continue;
        }

        if (subscriber?.lastSentAt) {
            const lastNewsletterCutoff = new Date(now);
            lastNewsletterCutoff.setDate(lastNewsletterCutoff.getDate() - 21);
            if (subscriber.lastSentAt > lastNewsletterCutoff) {
                results.push({ email, success: false, error: 'recent_newsletter_contact' });
                continue;
            }
        }

        try {
            const firstName = firstNameFromBooking(booking.name, booking.firstName);
            const response = await resend.emails.send({
                from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
                to: email,
                subject: 'Por si quieres retomar tu proceso',
                html: renderReactivationEmail(firstName),
            });

            if (response.error) {
                results.push({ email, success: false, error: response.error.message || 'resend_error' });
                continue;
            }

            await prisma.newsletter.upsert({
                where: { email },
                update: {
                    name: booking.name || booking.firstName || undefined,
                    active: true,
                    lastSentAt: now,
                },
                create: {
                    email,
                    name: booking.name || booking.firstName || undefined,
                    active: true,
                    currentStep: 0,
                    lastSentAt: now,
                },
            });

            results.push({ email, success: true });
        } catch (error: any) {
            results.push({ email, success: false, error: error?.message || 'unexpected_error' });
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const sentCount = results.filter((result) => result.success).length;

    return {
        success: true,
        inactiveDays,
        checkedPatients: latestByEmail.size,
        candidateCount: candidates.length,
        sentCount,
        skippedOrFailedCount: results.length - sentCount,
        results,
    };
}
