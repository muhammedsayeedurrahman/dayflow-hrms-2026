-- CreateTable
CREATE TABLE "PerformanceGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OKR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "quarter" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "keyResults" JSONB NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FeedbackRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "requestorId" TEXT NOT NULL,
    "reviewers" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "anonymousMode" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FeedbackRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "ratings" JSONB NOT NULL,
    "strengths" TEXT,
    "areasForImprovement" TEXT,
    "overallRating" INTEGER,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "scheduledDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OnboardingTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tasks" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OnboardingJourney" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "templateId" TEXT,
    "startDate" DATETIME NOT NULL,
    "tasks" JSONB NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShiftTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "department" TEXT,
    "requiredStaff" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShiftSwapRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalShiftId" TEXT NOT NULL,
    "requestorId" TEXT NOT NULL,
    "targetEmployeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ExpenseClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "externalUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "assignedBy" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "certificateUrl" TEXT
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "fileUrl" TEXT,
    "verificationUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "salaryRange" TEXT,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "postedBy" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "resumeUrl" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "rating" INTEGER,
    "notes" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WellnessProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "participants" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WellnessActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "programId" TEXT,
    "activityDate" DATETIME NOT NULL,
    "activityType" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT,
    "taskDescription" TEXT,
    "date" DATETIME NOT NULL,
    "hours" REAL NOT NULL,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PerformanceGoal_employeeId_idx" ON "PerformanceGoal"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceGoal_status_idx" ON "PerformanceGoal"("status");

-- CreateIndex
CREATE INDEX "PerformanceGoal_quarter_idx" ON "PerformanceGoal"("quarter");

-- CreateIndex
CREATE INDEX "PerformanceGoal_endDate_idx" ON "PerformanceGoal"("endDate");

-- CreateIndex
CREATE INDEX "FeedbackRequest_subjectId_idx" ON "FeedbackRequest"("subjectId");

-- CreateIndex
CREATE INDEX "FeedbackRequest_status_idx" ON "FeedbackRequest"("status");

-- CreateIndex
CREATE INDEX "FeedbackRequest_dueDate_idx" ON "FeedbackRequest"("dueDate");

-- CreateIndex
CREATE INDEX "FeedbackResponse_requestId_idx" ON "FeedbackResponse"("requestId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_reviewerId_idx" ON "FeedbackResponse"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResponse_requestId_reviewerId_key" ON "FeedbackResponse"("requestId", "reviewerId");

-- CreateIndex
CREATE INDEX "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewerId_idx" ON "PerformanceReview"("reviewerId");

-- CreateIndex
CREATE INDEX "PerformanceReview_period_idx" ON "PerformanceReview"("period");

-- CreateIndex
CREATE INDEX "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- CreateIndex
CREATE INDEX "OnboardingTemplate_department_idx" ON "OnboardingTemplate"("department");

-- CreateIndex
CREATE INDEX "OnboardingTemplate_role_idx" ON "OnboardingTemplate"("role");

-- CreateIndex
CREATE INDEX "OnboardingJourney_employeeId_idx" ON "OnboardingJourney"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingJourney_status_idx" ON "OnboardingJourney"("status");

-- CreateIndex
CREATE INDEX "ShiftTemplate_department_idx" ON "ShiftTemplate"("department");

-- CreateIndex
CREATE INDEX "Shift_date_idx" ON "Shift"("date");

-- CreateIndex
CREATE INDEX "Shift_employeeId_idx" ON "Shift"("employeeId");

-- CreateIndex
CREATE INDEX "Shift_status_idx" ON "Shift"("status");

-- CreateIndex
CREATE INDEX "ShiftSwapRequest_requestorId_idx" ON "ShiftSwapRequest"("requestorId");

-- CreateIndex
CREATE INDEX "ShiftSwapRequest_status_idx" ON "ShiftSwapRequest"("status");

-- CreateIndex
CREATE INDEX "ExpenseClaim_employeeId_idx" ON "ExpenseClaim"("employeeId");

-- CreateIndex
CREATE INDEX "ExpenseClaim_status_idx" ON "ExpenseClaim"("status");

-- CreateIndex
CREATE INDEX "ExpenseClaim_date_idx" ON "ExpenseClaim"("date");

-- CreateIndex
CREATE INDEX "Course_type_idx" ON "Course"("type");

-- CreateIndex
CREATE INDEX "Course_mandatory_idx" ON "Course"("mandatory");

-- CreateIndex
CREATE INDEX "EmployeeCourse_employeeId_idx" ON "EmployeeCourse"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCourse_courseId_idx" ON "EmployeeCourse"("courseId");

-- CreateIndex
CREATE INDEX "EmployeeCourse_status_idx" ON "EmployeeCourse"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCourse_employeeId_courseId_key" ON "EmployeeCourse"("employeeId", "courseId");

-- CreateIndex
CREATE INDEX "Certification_employeeId_idx" ON "Certification"("employeeId");

-- CreateIndex
CREATE INDEX "Certification_expiryDate_idx" ON "Certification"("expiryDate");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_department_idx" ON "JobPosting"("department");

-- CreateIndex
CREATE INDEX "Candidate_jobId_idx" ON "Candidate"("jobId");

-- CreateIndex
CREATE INDEX "Candidate_stage_idx" ON "Candidate"("stage");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "WellnessProgram_type_idx" ON "WellnessProgram"("type");

-- CreateIndex
CREATE INDEX "WellnessProgram_isActive_idx" ON "WellnessProgram"("isActive");

-- CreateIndex
CREATE INDEX "WellnessActivity_employeeId_idx" ON "WellnessActivity"("employeeId");

-- CreateIndex
CREATE INDEX "WellnessActivity_programId_idx" ON "WellnessActivity"("programId");

-- CreateIndex
CREATE INDEX "WellnessActivity_activityDate_idx" ON "WellnessActivity"("activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_code_idx" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_isActive_idx" ON "Project"("isActive");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_projectId_idx" ON "TimeEntry"("projectId");

-- CreateIndex
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");

-- CreateIndex
CREATE INDEX "TimeEntry_approved_idx" ON "TimeEntry"("approved");
