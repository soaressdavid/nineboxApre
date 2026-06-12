-- Add tipoAvaliacao column to evaluation_campaigns
-- Values: 'desempenho' (X-axis) or 'potencial' (Y-axis) for Nine Box
ALTER TABLE "evaluation_campaigns" ADD COLUMN "tipoAvaliacao" TEXT NOT NULL DEFAULT 'desempenho';
