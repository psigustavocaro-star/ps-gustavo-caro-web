-- Reactiva Row Level Security en las tablas que Supabase expone vía Data API.
-- Sin RLS, cualquiera que conozca la anon key pública del proyecto puede
-- consultar todo el contenido de estas tablas vía https://<proj>.supabase.co/rest/v1/...
--
-- La app usa Prisma con una conexión directa Postgres (role postgres o
-- service_role) que hace bypass de RLS por diseño. Los roles anon y
-- authenticated de Supabase quedan bloqueados por defecto (sin políticas)
-- cuando RLS está activo.
--
-- NOTA: si alguna migración futura vuelve a crear estas tablas, hay que
-- re-aplicar ALTER TABLE ... ENABLE ROW LEVEL SECURITY. Prisma no expone
-- esa opción en el schema.

ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Newsletter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailTemplate" ENABLE ROW LEVEL SECURITY;
