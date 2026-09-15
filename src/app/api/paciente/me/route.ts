import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; import { PATIENT_SESSION_COOKIE, verifyPatientSession } from '@/lib/auth/patient-session';
export async function GET(req: NextRequest) {
  const email = verifyPatientSession(req.cookies.get(PATIENT_SESSION_COOKIE)?.value);
  if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [account, rawBookings, appointmentCancellations, requests] = await Promise.all([
    prisma.patientAccount.findUnique({ where: { email }, select: { id: true, email: true, mustChangePassword: true, rut: true, firstName: true, secondName: true, firstSurname: true, secondSurname: true, birthDate: true, gender: true, occupation: true, companion: true, address: true, country: true, region: true, commune: true, phone: true, educationLevel: true, emergencyContact: true, clinicalUpdates: { select: { id: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 3 } } }),
    prisma.booking.findMany({ where: { email: { equals: email, mode: 'insensitive' }, status: 'PAID' }, orderBy: { appointmentDate: 'asc' } }),
    prisma.appointmentCancellation.findMany({ where: { booking: { email: { equals: email, mode: 'insensitive' } } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.patientAppointmentRequest.findMany({ where: { booking: { email: { equals: email, mode: 'insensitive' } } }, orderBy: { createdAt: 'desc' } })
  ]);
  const cancellationsByBooking = new Map<string, typeof appointmentCancellations>();
  appointmentCancellations.forEach((item) => {
    const entries = cancellationsByBooking.get(item.bookingId) || [];
    entries.push(item);
    cancellationsByBooking.set(item.bookingId, entries);
  });
  const bookings = rawBookings.map((booking) => ({ ...booking, appointmentCancellations: cancellationsByBooking.get(booking.id) || [] }));
  return NextResponse.json({ email, mustChangePassword: account?.mustChangePassword, profile: account, bookings, requests });
}
