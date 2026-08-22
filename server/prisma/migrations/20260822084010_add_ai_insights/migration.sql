-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "employeeId" TEXT,
    "riskLevel" TEXT,
    "score" REAL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "metadata" JSONB,
    "confidence" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");

-- CreateIndex
CREATE INDEX "AIInsight_employeeId_idx" ON "AIInsight"("employeeId");

-- CreateIndex
CREATE INDEX "AIInsight_riskLevel_idx" ON "AIInsight"("riskLevel");

-- CreateIndex
CREATE INDEX "AIInsight_isActive_idx" ON "AIInsight"("isActive");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");
