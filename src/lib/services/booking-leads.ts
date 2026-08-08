import prisma from '@/lib/db';
import { serviceCatalog } from '@/lib/config/services';

type LeadInput = {
    email: string;
    name?: string;
    firstName?: string;
    secondName?: string;
    firstSurname?: string;
    secondSurname?: string;
    phone?: string;
    rut?: string;
    address?: string;
    region?: string;
    commune?: string;
    serviceType?: string;
    reason?: string;
    details?: string;
    appointmentDate?: string | null;
    appointmentDates?: string[];
    attendeeTimeZone?: string;
    calEventTypeId?: number | string | null;
};

const LEAD_STATUS = 'LEAD';
const CONVERTED_STATUS = 'CONVERTED';

export function getLeadStatus() {
    return LEAD_STATUS;
}

function clean(value: unknown, max = 500) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

function buildFullName(input: LeadInput) {
    const explicitName = clean(input.name, 200);
    if (explicitName) return explicitName;

    return [
        clean(input.firstName, 80),
        clean(input.secondName, 80),
        clean(input.firstSurname, 80),
        clean(input.secondSurname, 80),
    ].filter(Boolean).join(' ').trim();
}

function getLeadAmount(serviceType: string) {
    const service = serviceCatalog[serviceType as keyof typeof serviceCatalog];
    return typeof service?.price === 'number' ? service.price : serviceCatalog.sesion.price;
}

export async function upsertBookingLead(input: LeadInput) {
    const email = clean(input.email, 254).toLowerCase();
    const serviceType = clean(input.serviceType, 80) || 'sesion';
    const name = buildFullName(input);
    const now = new Date();
    const appointmentDates = Array.isArray(input.appointmentDates)
        ? input.appointmentDates.filter((date) => typeof date === 'string' && !Number.isNaN(Date.parse(date))).slice(0, 4)
        : [];
    const appointmentDate = appointmentDates[0] || (typeof input.appointmentDate === 'string' ? input.appointmentDate : null);

    const existing = await prisma.booking.findFirst({
        where: {
            email,
            status: LEAD_STATUS,
        },
        orderBy: { updatedAt: 'desc' },
    });

    const data = {
        name: name || existing?.name || '',
        firstName: clean(input.firstName, 80) || existing?.firstName || '',
        secondName: clean(input.secondName, 80) || existing?.secondName || '',
        firstSurname: clean(input.firstSurname, 80) || existing?.firstSurname || '',
        secondSurname: clean(input.secondSurname, 80) || existing?.secondSurname || '',
        phone: clean(input.phone, 40) || existing?.phone || '',
        rut: clean(input.rut, 30) || existing?.rut || '',
        address: clean(input.address, 300) || existing?.address || '',
        region: clean(input.region, 100) || existing?.region || '',
        commune: clean(input.commune, 100) || existing?.commune || '',
        serviceType,
        amount: getLeadAmount(serviceType),
        reason: clean(input.reason, 2000) || existing?.reason || '',
        details: clean(input.details, 5000) || existing?.details || '',
        appointmentDate,
        appointmentDates: appointmentDates.length > 0 ? appointmentDates : appointmentDate ? [appointmentDate] : existing?.appointmentDates || [],
        attendeeTimeZone: clean(input.attendeeTimeZone, 80) || existing?.attendeeTimeZone || 'America/Santiago',
        calEventTypeId: input.calEventTypeId ? Number(input.calEventTypeId) : existing?.calEventTypeId || null,
        updatedAt: now,
    };

    if (existing) {
        return prisma.booking.update({
            where: { id: existing.id },
            data,
        });
    }

    return prisma.booking.create({
        data: {
            orderId: `LEAD-${Date.now()}-${crypto.randomUUID().slice(0, 12)}`,
            email,
            status: LEAD_STATUS,
            ...data,
        },
    });
}

export async function markBookingLeadConverted(email: string) {
    const normalizedEmail = clean(email, 254).toLowerCase();
    if (!normalizedEmail) return { count: 0 };

    return prisma.booking.updateMany({
        where: {
            email: normalizedEmail,
            status: LEAD_STATUS,
        },
        data: {
            status: CONVERTED_STATUS,
            updatedAt: new Date(),
        },
    });
}
