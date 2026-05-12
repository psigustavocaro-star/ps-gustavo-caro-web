-- Drop Anamnesis table (no longer used)
DROP TABLE IF EXISTS "Anamnesis";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_email_idx" ON "Booking"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_createdAt_idx" ON "Booking"("createdAt");
