import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPatientPortalToken } from '@/lib/auth/patient-portal-link';
import { encryptRefundBankData } from '@/lib/security/refund-bank-data';
import { cancelCalBooking } from '@/lib/services/calcom';

const FLOW_FEE_RATE = 1366 / 36000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const token = verifyPatientPortalToken((await params).token);
    if (!token) return NextResponse.json({ success: false, error: 'El enlace ya no es válido.' }, { status: 401 });
    const body = await request.json();
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId : '';
    const appointmentIndex = Number.isInteger(body.appointmentIndex) ? body.appointmentIndex : -1;
    const required = ['accountHolder', 'rut', 'bank', 'accountType', 'accountNumber', 'email'];
    if (appointmentIndex < 0 || required.some(key => typeof body[key] !== 'string' || !body[key].trim())) return NextResponse.json({ success: false, error: 'Completa todos los datos bancarios.' }, { status: 400 });
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, email: { equals: token.email, mode: 'insensitive' }, status: 'PAID' } });
    const dates = booking?.appointmentDates.length ? booking.appointmentDates : booking?.appointmentDate ? [booking.appointmentDate] : [];
    const appointmentDate = dates[appointmentIndex];
    if (!booking || !appointmentDate || new Date(appointmentDate).getTime() - Date.now() < 48 * 60 * 60 * 1000) return NextResponse.json({ success: false, error: 'Las anulaciones deben solicitarse con al menos 48 horas de anticipación.' }, { status: 400 });
    const sessionCount = Math.max(dates.length, booking.serviceType === 'packSesiones' ? 4 : 1);
    const grossAmount = Math.round(booking.amount / sessionCount);
    const flowCommission = Math.round(grossAmount * FLOW_FEE_RATE);
    const refundAmount = grossAmount - flowCommission;
    const existing = await prisma.appointmentRefundRequest.findUnique({ where: { bookingId_appointmentIndex_appointmentDate: { bookingId, appointmentIndex, appointmentDate } } });
    if (existing) return NextResponse.json({ success: false, error: 'Ya existe una solicitud para esta sesión.' }, { status: 409 });
    const calBookingId = booking.calBookingIds[appointmentIndex] || (appointmentIndex === 0 ? booking.calBookingId : null);
    if (calBookingId && !(await cancelCalBooking(calBookingId, 'Anulación solicitada por el paciente.')).success) return NextResponse.json({ success: false, error: 'No fue posible anular la cita.' }, { status: 409 });
    await prisma.appointmentRefundRequest.create({ data: { bookingId, appointmentIndex, appointmentDate, grossAmount, flowCommission, refundAmount, bankDataEncrypted: encryptRefundBankData({ accountHolder: body.accountHolder.trim(), rut: body.rut.trim(), bank: body.bank.trim(), accountType: body.accountType.trim(), accountNumber: body.accountNumber.trim(), email: body.email.trim().toLowerCase() }) } });
    return NextResponse.json({ success: true, refundAmount });
}
