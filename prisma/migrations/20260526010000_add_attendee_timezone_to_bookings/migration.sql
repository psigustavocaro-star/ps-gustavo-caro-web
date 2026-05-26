ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "attendeeTimeZone" TEXT;

UPDATE "Booking"
SET "attendeeTimeZone" = COALESCE("attendeeTimeZone", 'America/Santiago')
WHERE "attendeeTimeZone" IS NULL;
