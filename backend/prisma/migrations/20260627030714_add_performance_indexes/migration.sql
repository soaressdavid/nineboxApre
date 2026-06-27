-- CreateIndex
CREATE INDEX "evaluations_campaignId_avaliadoId_idx" ON "evaluations"("campaignId", "avaliadoId");

-- CreateIndex
CREATE INDEX "nine_box_categoria_idx" ON "nine_box"("categoria");

-- CreateIndex
CREATE INDEX "users_tipo_idx" ON "users"("tipo");

-- CreateIndex
CREATE INDEX "users_departamento_idx" ON "users"("departamento");
