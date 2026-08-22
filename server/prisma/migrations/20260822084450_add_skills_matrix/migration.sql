-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "targetLevel" INTEGER,
    "lastAssessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillGap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "trainingPlan" JSONB,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Skill_department_idx" ON "Skill"("department");

-- CreateIndex
CREATE INDEX "Skill_isActive_idx" ON "Skill"("isActive");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employeeId_idx" ON "EmployeeSkill"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skillId_idx" ON "EmployeeSkill"("skillId");

-- CreateIndex
CREATE INDEX "EmployeeSkill_level_idx" ON "EmployeeSkill"("level");

-- CreateIndex
CREATE INDEX "EmployeeSkill_verified_idx" ON "EmployeeSkill"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employeeId_skillId_key" ON "EmployeeSkill"("employeeId", "skillId");

-- CreateIndex
CREATE INDEX "SkillGap_employeeId_idx" ON "SkillGap"("employeeId");

-- CreateIndex
CREATE INDEX "SkillGap_status_idx" ON "SkillGap"("status");

-- CreateIndex
CREATE INDEX "SkillGap_priority_idx" ON "SkillGap"("priority");
