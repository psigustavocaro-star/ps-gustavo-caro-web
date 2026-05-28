ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "appointmentDates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "calBookingIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Booking"
SET "appointmentDates" = ARRAY["appointmentDate"]::TEXT[]
WHERE "appointmentDate" IS NOT NULL
  AND cardinality("appointmentDates") = 0;

UPDATE "Booking"
SET "calBookingIds" = ARRAY["calBookingId"]::TEXT[]
WHERE "calBookingId" IS NOT NULL
  AND cardinality("calBookingIds") = 0;
