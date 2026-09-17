import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTime = (value: unknown): value is string => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

async function authorized(request: NextRequest) {
    return verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export async function POST(request: NextRequest) {
    if (!await authorized(request)) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        const allDay = Boolean(body.allDay);
        if (!isDate(body.date)) return NextResponse.json({ success: false, error: 'Selecciona una fecha válida.' }, { status: 400 });
        if (!allDay && (!isTime(body.startTime) || !isTime(body.endTime) || body.startTime >= body.endTime)) {
            return NextResponse.json({ success: false, error: 'Indica un horario de inicio y término válido.' }, { status: 400 });
        }
        const block = await prisma.scheduleBlock.create({
            data: { date: body.date, allDay, startTime: allDay ? null : body.startTime, endTime: allDay ? null : body.endTime, reason: typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) || null : null },
        });
        return NextResponse.json({ success: true, block });
    } catch (error) {
        console.error('Schedule block creation error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible guardar el bloqueo.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!await authorized(request)) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Falta identificar el bloqueo.' }, { status: 400 });
    try {
        await prisma.scheduleBlock.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: 'No fue posible eliminar el bloqueo.' }, { status: 404 });
    }
}
