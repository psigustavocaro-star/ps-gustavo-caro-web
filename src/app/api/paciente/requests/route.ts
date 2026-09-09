import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PATIENT_SESSION_COOKIE, verifyPatientSession } from '@/lib/auth/patient-session';
import { encryptRefundData } from '@/lib/security/refund-data';

const has48Hours = (date: string) => Date.parse(date) - Date.now() >= 48 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const email = verifyPatientSession(req.cookies.get(PATIENT_SESSION_COOKIE)?.value);
    if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const account = await prisma.patientAccount.findUnique({ where: { email } });
    if (!account || account.mustChangePassword) return NextResponse.json({ error: 'Debes cambiar tu contraseña temporal antes de gestionar sesiones.' }, { status: 403 });
    const body = await req.json();
    const booking = await prisma.booking.findFirst({ where: { id: body.bookingId, email: { equals: email, mode: 'insensitive' }, status: 'PAID' } });
    const index = Number(body.appointmentIndex);
    const dates = booking ? (booking.appointmentDates.length ? booking.appointmentDates : booking.appointmentDate ? [booking.appointmentDate] : []) : [];
    const date = dates[index];
    if (!booking || !Number.isInteger(index) || !date) return NextResponse.json({ error: 'Sesión no encontrada.' }, { status: 404 });
    if (!has48Hours(date)) return NextResponse.json({ error: 'Esta solicitud debe hacerse con al menos 48 horas de anticipación.' }, { status: 400 });
    const type = body.type === 'CANCEL' ? 'CANCEL' : body.type === 'CHANGE' ? 'CHANGE' : '';
    if (!type) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 700) : null;
    const request = await prisma.$transaction(async tx => {
      const created = await tx.patientAppointmentRequest.create({ data: { bookingId: booking.id, appointmentIndex: index, appointmentDate: date, type, message } });
      if (type === 'CANCEL') {
        const bank = body.bank || {};
        if (!['holderName','rut','email','bank','accountType','accountNumber'].every(key => typeof bank[key] === 'string' && bank[key].trim())) throw new Error('Completa todos los datos bancarios para solicitar la devolución.');
        const grossAmount = Math.round(booking.amount / Math.max(dates.length, 1));
        const flowCommission = Math.round(grossAmount * 1366 / 36000);
        await tx.appointmentRefundRequest.upsert({ where: { bookingId_appointmentIndex_appointmentDate: { bookingId: booking.id, appointmentIndex: index, appointmentDate: date } }, update: {}, create: { bookingId: booking.id, appointmentIndex: index, appointmentDate: date, grossAmount, flowCommission, refundAmount: grossAmount - flowCommission, bankDataEncrypted: encryptRefundData(bank), status: 'PENDING' } });
      }
      return created;
    });
    return NextResponse.json({ success: true, request });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No fue posible enviar la solicitud.' }, { status: 400 });
  }
}
