import { NextRequest, NextResponse } from 'next/server';
import { sendAnamnesisData } from '@/lib/services/mail';
import prisma from '@/lib/db';
import { isEmail, isNonEmptyString, rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`anamnesis:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const data = await request.json();

        const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
        const name = isNonEmptyString(data?.name, 200) ? data.name.trim() : '';
        if (!isEmail(email) || !name) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const safe = {
            name,
            email,
            age: typeof data.age === 'string' || typeof data.age === 'number' ? String(data.age).slice(0, 10) : '',
            medications: typeof data.medications === 'string' ? data.medications.slice(0, 2000) : '',
            history: typeof data.history === 'string' ? data.history.slice(0, 5000) : '',
        };

        await prisma.anamnesis.create({ data: safe });
        await sendAnamnesisData(safe);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Anamnesis submission error:', error);
        return NextResponse.json({ error: 'No fue posible procesar la solicitud' }, { status: 500 });
    }
}
