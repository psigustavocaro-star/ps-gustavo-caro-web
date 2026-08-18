-- Newsletter: doble opt-in
ALTER TABLE public."Newsletter"
    ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "confirmationToken" TEXT;

-- Filas existentes se marcan como confirmadas (retroactivo) para no perder
-- suscriptores actuales. Los nuevos empiezan inactivos hasta confirmar.
UPDATE public."Newsletter"
SET "confirmedAt" = COALESCE("confirmedAt", "createdAt"),
    "active" = TRUE
WHERE "confirmedAt" IS NULL AND "active" = TRUE;

CREATE INDEX IF NOT EXISTS "Newsletter_confirmationToken_idx"
    ON public."Newsletter" ("confirmationToken");

-- Registro digital de consentimientos (Ley 21.719 exige poder demostrar el consentimiento)
CREATE TABLE IF NOT EXISTS public."ConsentLog" (
    "id"         TEXT PRIMARY KEY,
    "email"      TEXT NOT NULL,
    "type"       TEXT NOT NULL, -- privacy | newsletter | cookies
    "version"    TEXT NOT NULL,
    "granted"    BOOLEAN NOT NULL DEFAULT TRUE,
    "ip"         TEXT,
    "userAgent"  TEXT,
    "context"    TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ConsentLog_email_idx"       ON public."ConsentLog" ("email");
CREATE INDEX IF NOT EXISTS "ConsentLog_type_created_idx" ON public."ConsentLog" ("type", "createdAt");

-- Habilita RLS para bloquear acceso desde el Data API público de Supabase.
ALTER TABLE public."ConsentLog" ENABLE ROW LEVEL SECURITY;
