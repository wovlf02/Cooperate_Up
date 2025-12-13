-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('WARNING', 'SUSPEND', 'UNSUSPEND', 'RESTRICT');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('USER_WARN', 'USER_SUSPEND', 'USER_UNSUSPEND', 'USER_RESTRICT', 'USER_DELETE', 'STUDY_HIDE', 'STUDY_CLOSE', 'STUDY_RECOMMEND', 'REPORT_ASSIGN', 'REPORT_APPROVE', 'REPORT_REJECT', 'CONTENT_DELETE', 'SETTINGS_UPDATE');

-- CreateTable
CREATE TABLE "Sanction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SanctionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" TEXT,
    "relatedReportId" TEXT,
    "adminId" TEXT NOT NULL,
    "unsuspendReason" TEXT,
    "unsuspendAdminId" TEXT,
    "unsuspendAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sanction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionRestriction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restrictedFunctions" TEXT[],
    "restrictedUntil" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunctionRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sanction_userId_type_createdAt_idx" ON "Sanction"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Sanction_adminId_idx" ON "Sanction"("adminId");

-- CreateIndex
CREATE INDEX "FunctionRestriction_userId_restrictedUntil_idx" ON "FunctionRestriction"("userId", "restrictedUntil");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_action_createdAt_idx" ON "AdminLog"("action", "createdAt");
