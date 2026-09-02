CREATE TABLE "AppointmentRefundRequest" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "appointmentIndex" INTEGER NOT NULL,
  "appointmentDate" TEXT NOT NULL,
  "grossAmount" INTEGER NOT NULL,
  "flowCommission" INTEGER NOT NULL,
  "refundAmount" INTEGER NOT NULL,
  "bankDataEncrypted" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AppointmentRefundRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AppointmentRefundRequest_bookingId_appointmentIndex_appointmentDate_key" ON "AppointmentRefundRequest"("bookingId", "appointmentIndex", "appointmentDate");
CREATE INDEX "AppointmentRefundRequest_status_requestedAt_idx" ON "AppointmentRefundRequest"("status", "requestedAt");
ALTER TABLE "AppointmentRefundRequest" ADD CONSTRAINT "AppointmentRefundRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PatientAccount" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PatientAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PatientAccount_email_key" ON "PatientAccount"("email");
