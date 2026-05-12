import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
        const newsletter = await prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
        const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);

        const patientsMap = new Map();

        bookings.forEach((b: any) => {
            if (!b.email) return;
            const email = b.email.toLowerCase().trim();
            if (!patientsMap.has(email)) {
                patientsMap.set(email, {
                    email,
                    name: b.name || 'Sin Nombre',
                    firstName: b.firstName || '',
                    secondName: b.secondName || '',
                    firstSurname: b.firstSurname || '',
                    secondSurname: b.secondSurname || '',
                    phone: b.phone || '',
                    rut: b.rut || '',
                    address: b.address || '',
                    region: b.region || '',
                    commune: b.commune || '',
                    country: b.country || 'Chile',
                    bookings: [],
                    newsletter: null,
                    totalSpent: 0
                });
            }
            const p = patientsMap.get(email);
            p.bookings.push(b);
            if (b.status === 'PAID') {
                p.totalSpent += (Number(b.amount) || 0);
            }
        });

        newsletter.forEach((n: any) => {
            if (!n.email) return;
            const email = n.email.toLowerCase().trim();
            const p = patientsMap.get(email);
            if (p) {
                p.newsletter = n;
            } else {
                patientsMap.set(email, {
                    email,
                    name: n.name || 'Suscriptor',
                    phone: '',
                    bookings: [],
                    newsletter: n,
                    totalSpent: 0
                });
            }
        });

        const patients = Array.from(patientsMap.values());

        return NextResponse.json({
            success: true,
            patients,
            bookings,
            newsletter,
            templates
        });
    } catch (error) {
        console.error('Admin data error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}
