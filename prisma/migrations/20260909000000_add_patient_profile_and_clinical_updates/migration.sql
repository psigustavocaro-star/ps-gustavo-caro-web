ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "rut" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "secondName" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "firstSurname" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "secondSurname" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "companion" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "commune" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT;

CREATE TABLE "PatientProfileAudit" (
  "id" TEXT NOT NULL,
  "patientAccountId" TEXT NOT NULL,
  "changedFields" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientProfileAudit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PatientClinicalUpdate" (
  "id" TEXT NOT NULL,
  "patientAccountId" TEXT NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  CONSTRAINT "PatientClinicalUpdate_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PatientProfileAudit" ADD CONSTRAINT "PatientProfileAudit_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "PatientAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientClinicalUpdate" ADD CONSTRAINT "PatientClinicalUpdate_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "PatientAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "PatientClinicalUpdate_status_createdAt_idx" ON "PatientClinicalUpdate"("status", "createdAt");
