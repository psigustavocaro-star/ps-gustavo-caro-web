ALTER TABLE "AppointmentCancellation"
ADD COLUMN IF NOT EXISTS "rescheduledAppointmentDate" TEXT;

-- Completa el pack de Agustín con las fechas históricas confirmadas.
UPDATE "Booking"
SET "appointmentDate" = '2026-08-10T23:15:00.000Z',
    "appointmentDates" = ARRAY['2026-08-10T23:15:00.000Z','2026-08-31T23:15:00.000Z','2026-09-14T23:15:00.000Z','2026-09-21T22:30:00.000Z'],
    "details" = regexp_replace(regexp_replace(coalesce("details", ''), E'\\n?\\[completed_sessions:[^\\]]*\\]\\n?', '', 'g'), E'\\n?\\[completed_session_numbers:[^\\]]*\\]\\n?', '', 'g') || E'\\n[completed_session_numbers:1,2,3]'
WHERE "status" = 'PAID' AND "serviceType" = 'packSesiones'
  AND "firstName" = 'Agustín' AND "firstSurname" = 'Núñez' AND "secondSurname" = 'Sepúlveda';
