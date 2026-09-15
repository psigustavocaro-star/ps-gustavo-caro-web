CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "preheader" TEXT;
ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "recipientCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "sentCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "failedCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "EmailTemplate_status_updatedAt_idx" ON "EmailTemplate"("status", "updatedAt");
CREATE INDEX IF NOT EXISTS "EmailTemplate_sentAt_idx" ON "EmailTemplate"("sentAt");

CREATE TABLE IF NOT EXISTS "ContentPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContentPost_status_check" CHECK ("status" IN ('DRAFT', 'PUBLISHED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentPost_slug_key" ON "ContentPost"("slug");
CREATE INDEX IF NOT EXISTS "ContentPost_status_publishedAt_idx" ON "ContentPost"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "ContentPost_updatedAt_idx" ON "ContentPost"("updatedAt");

ALTER TABLE public."ContentPost" ENABLE ROW LEVEL SECURITY;
