-- Migration: Refresh Tokens + Soft Delete
-- Data: 2026-06-16

-- ============================================================
-- 1. Tabela de Refresh Tokens
-- ============================================================
CREATE TABLE "refresh_tokens" (
    "id"        TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

ALTER TABLE "refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 2. Soft Delete em Users
-- ============================================================
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- ============================================================
-- 3. Soft Delete em evaluation_campaigns
-- ============================================================
ALTER TABLE "evaluation_campaigns" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "evaluation_campaigns_deletedAt_idx" ON "evaluation_campaigns"("deletedAt");

-- ============================================================
-- 4. Soft Delete em competencies
-- ============================================================
ALTER TABLE "competencies" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "competencies_deletedAt_idx" ON "competencies"("deletedAt");
