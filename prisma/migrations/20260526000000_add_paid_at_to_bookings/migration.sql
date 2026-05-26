ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

UPDATE "Booking"
SET "paidAt" = COALESCE("paidAt", "updatedAt", "createdAt")
WHERE UPPER("status") = 'PAID'
  AND "paidAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Booking_status_paidAt_idx" ON "Booking"("status", "paidAt");
