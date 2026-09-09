ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "meetUrl" TEXT;
CREATE TABLE "PatientAppointmentRequest" (
 "id" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "appointmentIndex" INTEGER NOT NULL, "appointmentDate" TEXT NOT NULL, "type" TEXT NOT NULL, "message" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "reviewedAt" TIMESTAMP(3), CONSTRAINT "PatientAppointmentRequest_pkey" PRIMARY KEY ("id"));
ALTER TABLE "PatientAppointmentRequest" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
CREATE INDEX "PatientAppointmentRequest_status_createdAt_idx" ON "PatientAppointmentRequest"("status","createdAt");
ALTER TABLE "PatientAppointmentRequest" ADD CONSTRAINT "PatientAppointmentRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
