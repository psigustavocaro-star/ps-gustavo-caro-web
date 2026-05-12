-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_email_idx" ON "Booking"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Anamnesis_email_idx" ON "Anamnesis"("email");
