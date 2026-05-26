ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "siiReceiptIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "siiReceiptIssuedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Booking_siiReceiptIssued_idx" ON "Booking"("siiReceiptIssued");
