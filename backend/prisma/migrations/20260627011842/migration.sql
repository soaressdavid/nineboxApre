/*
  Warnings:

  - The `tipoAvaliacao` column on the `evaluation_campaigns` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[nome]` on the table `competencies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pessoaId]` on the table `nine_box` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoAvaliacao" AS ENUM ('desempenho', 'potencial');

-- DropIndex
DROP INDEX "competencies_competenciaDe_idx";

-- DropIndex
DROP INDEX "competencies_tipo_idx";

-- DropIndex
DROP INDEX "nine_box_data_idx";

-- AlterTable
ALTER TABLE "competencies" ADD COLUMN     "a_melhorar" TEXT,
ADD COLUMN     "bom" TEXT,
ADD COLUMN     "ideal" TEXT,
ADD COLUMN     "mediano" TEXT,
ALTER COLUMN "tipo" SET DEFAULT '',
ALTER COLUMN "competenciaDe" SET DEFAULT '';

-- AlterTable
ALTER TABLE "evaluation_campaigns" DROP COLUMN "tipoAvaliacao",
ADD COLUMN     "tipoAvaliacao" "TipoAvaliacao" NOT NULL DEFAULT 'desempenho';

-- AlterTable
ALTER TABLE "nine_box" ALTER COLUMN "performance" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "potential" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "campaign_gestor_colaboradores" (
    "id" TEXT NOT NULL,
    "campaignGestorId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_gestor_colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userTipo" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_templates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "criterios" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_gestor_colaboradores_campaignGestorId_idx" ON "campaign_gestor_colaboradores"("campaignGestorId");

-- CreateIndex
CREATE INDEX "campaign_gestor_colaboradores_colaboradorId_idx" ON "campaign_gestor_colaboradores"("colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_gestor_colaboradores_campaignGestorId_colaboradorI_key" ON "campaign_gestor_colaboradores"("campaignGestorId", "colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_nome_key" ON "competencies"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "nine_box_pessoaId_key" ON "nine_box"("pessoaId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "campaign_gestor_colaboradores" ADD CONSTRAINT "campaign_gestor_colaboradores_campaignGestorId_fkey" FOREIGN KEY ("campaignGestorId") REFERENCES "campaign_gestores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_gestor_colaboradores" ADD CONSTRAINT "campaign_gestor_colaboradores_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
