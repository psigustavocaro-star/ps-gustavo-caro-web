-- Supabase exposes tables in the public schema through its Data API.
-- Enabling RLS without public policies blocks anon/auth API access by default,
-- while the server-side Prisma connection can continue using its database role.

ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Anamnesis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Newsletter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailTemplate" ENABLE ROW LEVEL SECURITY;
