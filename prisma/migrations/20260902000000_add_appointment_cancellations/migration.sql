CREATE TABLE "AppointmentCancellation" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "appointmentIndex" INTEGER NOT NULL,
    "originalAppointmentDate" TEXT NOT NULL,
    "reason" TEXT,
    "calCancelledAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "rebookedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppointmentCancellation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppointmentCancellation_bookingId_appointmentIndex_originalAppointmentDate_key"
ON "AppointmentCancellation"("bookingId", "appointmentIndex", "originalAppointmentDate");
CREATE INDEX "AppointmentCancellation_originalAppointmentDate_idx" ON "AppointmentCancellation"("originalAppointmentDate");
CREATE INDEX "AppointmentCancellation_emailSentAt_idx" ON "AppointmentCancellation"("emailSentAt");
ALTER TABLE "AppointmentCancellation" ADD CONSTRAINT "AppointmentCancellation_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
