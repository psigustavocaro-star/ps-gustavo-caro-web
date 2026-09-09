import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PATIENT_SESSION_COOKIE, verifyPatientSession } from '@/lib/auth/patient-session';
import { encryptRefundData } from '@/lib/security/refund-data';

const fields = ['firstName', 'secondName', 'firstSurname', 'secondSurname', 'birthDate', 'gender', 'occupation', 'companion', 'address', 'country', 'region', 'commune', 'phone', 'educationLevel', 'emergencyContact'] as const;
const clinicalFields = ['diagnoses', 'medications', 'genogram'] as const;
const clean = (value: unknown, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function PATCH(req: NextRequest) {
  const email = verifyPatientSession(req.cookies.get(PATIENT_SESSION_COOKIE)?.value);
  if (!email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const account = await prisma.patientAccount.findUnique({ where: { email } });
  if (!account) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 });
  const data = Object.fromEntries(fields.map(field => [field, clean(body[field], field === 'address' ? 300 : 160)]));
  const changedFields = fields.filter(field => account[field] !== data[field]);
  const clinical = Object.fromEntries(clinicalFields.map(field => [field, clean(body[field], 2000)]));
  const hasClinicalUpdate = clinicalFields.some(field => clinical[field]);
  await prisma.$transaction(async tx => {
    if (changedFields.length) {
      await tx.patientAccount.update({ where: { id: account.id }, data });
      await tx.patientProfileAudit.create({ data: { patientAccountId: account.id, changedFields } });
    }
    if (hasClinicalUpdate) await tx.patientClinicalUpdate.create({ data: { patientAccountId: account.id, encryptedPayload: encryptRefundData(clinical) } });
  });
  return NextResponse.json({ success: true, clinicalUpdatePending: hasClinicalUpdate });
}
