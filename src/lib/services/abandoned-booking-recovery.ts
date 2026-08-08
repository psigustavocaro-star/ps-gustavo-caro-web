import { Resend } from 'resend';
import prisma from '@/lib/db';
import { getLeadStatus } from '@/lib/services/booking-leads';
import { serviceCatalog } from '@/lib/config/services';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_MAX_SENDS = 40;
const STALE_AFTER_HOURS = 2;
const SECOND_REMINDER_AFTER_HOURS = 48;
const THIRD_REMINDER_AFTER_HOURS = 168;

function firstNameFromLead(lead: { name: string | null; firstName: string | null }) {
    return lead.firstName?.trim() || lead.name?.trim().split(/\s+/)[0] || 'hola';
}

function serviceName(serviceType: string) {
    const service = serviceCatalog[serviceType as keyof typeof serviceCatalog];
    return service?.name || 'sesion';
}

function inferReminderNumber(details: string | null) {
    const match = details?.match(/\[recovery_sent:(\d+)\]/);
    return match ? Number(match[1]) : 0;
}

function stampReminder(details: string | null, nextCount: number) {
    const base = (details || '').replace(/\n?\[recovery_sent:\d+\]\n?/g, '').trim();
    return `${base}${base ? '\n' : ''}[recovery_sent:${nextCount}]`;
}

function canSendReminder(lead: { updatedAt: Date; details: string | null }, now: Date) {
    const sent = inferReminderNumber(lead.details);
    if (sent >= 3) return false;

    const hoursSinceUpdate = (now.getTime() - lead.updatedAt.getTime()) / (60 * 60 * 1000);
    if (sent === 0) return hoursSinceUpdate >= STALE_AFTER_HOURS;
    if (sent === 1) return hoursSinceUpdate >= SECOND_REMINDER_AFTER_HOURS;
    return hoursSinceUpdate >= THIRD_REMINDER_AFTER_HOURS;
}

async function hasConvertedAfterLead(email: string, leadCreatedAt: Date) {
    const paidBooking = await prisma.booking.findFirst({
        where: {
            email,
            status: 'PAID',
            createdAt: { gte: leadCreatedAt },
        },
        select: { id: true },
    });

    return Boolean(paidBooking);
}

function renderRecoveryEmail(input: {
    firstName: string;
    serviceType: string;
    reminderNumber: number;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';
    const selectedService = serviceName(input.serviceType).toLowerCase();
    const subjectLine = input.reminderNumber === 0
        ? 'quedaste cerca de reservar'
        : input.reminderNumber === 1
            ? 'te dejo este recordatorio por si aun quieres agendar'
            : 'ultimo recordatorio por si quieres retomar tu reserva';

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.65; color: #263238; max-width: 640px; margin: 0 auto;">
            <p style="display:none; max-height:0; overflow:hidden; opacity:0;">${subjectLine}</p>
            <p>Hola ${input.firstName},</p>
            <p>Vi que comenzaste el proceso para agendar ${selectedService}, pero parece que no alcanzaste a terminar la reserva.</p>
            <p>Te escribo solo por si te quedaste con alguna duda, se te cruzo el dia o preferiste pensarlo con mas calma. A veces dar el paso de agendar toma un poco, y esta bien que sea asi.</p>
            <div style="background:#f8fafc; border-left:4px solid #0891b2; padding:16px 18px; margin:24px 0; border-radius:8px;">
                <p style="margin:0;"><strong>Si todavia te hace sentido, puedes retomar desde aqui.</strong><br/>El proceso es simple: eliges el servicio, revisas horarios disponibles y confirmas tu reserva.</p>
            </div>
            <div style="margin:30px 0; text-align:center;">
                <a href="${siteUrl}/agendar" style="background:#0891b2; color:#ffffff; padding:13px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Retomar agendamiento</a>
            </div>
            <p style="font-size:14px; color:#52616b;">Si ya no lo necesitas, puedes ignorar este correo. No pasa nada.</p>
            <p>Un abrazo,<br/><strong>Ps. Gustavo Caro</strong></p>
        </div>
    `;
}

export async function processAbandonedBookingRecovery() {
    const now = new Date();
    const maxSends = Number(process.env.ABANDONED_BOOKING_MAX_SENDS || DEFAULT_MAX_SENDS);

    const leads = await prisma.booking.findMany({
        where: {
            status: getLeadStatus(),
            email: { not: '' },
        },
        orderBy: { updatedAt: 'asc' },
        take: maxSends * 3,
        select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            serviceType: true,
            details: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const results: Array<{ email: string; success: boolean; action: string; error?: string }> = [];
    const candidates = leads.filter((lead) => canSendReminder(lead, now)).slice(0, maxSends);

    for (const lead of candidates) {
        const email = lead.email.trim().toLowerCase();

        if (await hasConvertedAfterLead(email, lead.createdAt)) {
            await prisma.booking.update({
                where: { id: lead.id },
                data: { status: 'CONVERTED' },
            });
            results.push({ email, success: true, action: 'already_converted' });
            continue;
        }

        const subscriber = await prisma.newsletter.findUnique({ where: { email } }).catch(() => null);
        if (subscriber?.active === false) {
            results.push({ email, success: false, action: 'skipped', error: 'subscriber_inactive' });
            continue;
        }

        const reminderNumber = inferReminderNumber(lead.details);
        const firstName = firstNameFromLead(lead);
        const subject = reminderNumber === 0
            ? '¿Quieres retomar tu reserva?'
            : reminderNumber === 1
                ? 'Te dejo este recordatorio por si quieres agendar'
                : 'Ultimo recordatorio sobre tu agendamiento';

        try {
            const response = await resend.emails.send({
                from: 'Ps. Gustavo Caro <newsletter@psgustavocaro.cl>',
                to: email,
                subject,
                html: renderRecoveryEmail({
                    firstName,
                    serviceType: lead.serviceType,
                    reminderNumber,
                }),
            });

            if (response.error) {
                results.push({ email, success: false, action: 'send_failed', error: response.error.message || 'resend_error' });
                continue;
            }

            await prisma.booking.update({
                where: { id: lead.id },
                data: {
                    details: stampReminder(lead.details, reminderNumber + 1),
                    updatedAt: now,
                },
            });

            await prisma.newsletter.upsert({
                where: { email },
                update: { name: lead.name || firstName, active: true, lastSentAt: now },
                create: { email, name: lead.name || firstName, active: true, currentStep: 0, lastSentAt: now },
            });

            results.push({ email, success: true, action: `sent_${reminderNumber + 1}` });
        } catch (error: any) {
            results.push({ email, success: false, action: 'send_failed', error: error?.message || 'unexpected_error' });
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const sentCount = results.filter((result) => result.action.startsWith('sent_')).length;
    const summary = {
        success: true,
        checkedLeads: leads.length,
        candidateCount: candidates.length,
        sentCount,
        results,
    };

    await resend.emails.send({
        from: 'Web Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
        to: 'psi.gustavocaro@gmail.com',
        subject: `Auditoria recuperacion agendamientos: ${sentCount} enviados`,
        html: `<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;">${JSON.stringify(summary, null, 2)}</pre>`,
    }).catch((error) => {
        console.error('Abandoned booking audit email error:', error);
    });

    return summary;
}
