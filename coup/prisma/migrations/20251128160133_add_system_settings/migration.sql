/*
  Warnings:

  - The values [USER_RESTRICT,REPORT_APPROVE] on the enum `AdminAction` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN] on the enum `MemberRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUSPEND,UNSUSPEND,RESTRICT] on the enum `SanctionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,SYSTEM_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `details` on the `AdminLog` table. All the data in the column will be lost.
  - You are about to drop the column `unsuspendAdminId` on the `Sanction` table. All the data in the column will be lost.
  - You are about to drop the column `unsuspendAt` on the `Sanction` table. All the data in the column will be lost.
  - You are about to drop the `FunctionRestriction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WarningSeverity" AS ENUM ('MINOR', 'NORMAL', 'SERIOUS', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AdminRoleType" AS ENUM ('VIEWER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "AdminAction_new" AS ENUM ('USER_VIEW', 'USER_SEARCH', 'USER_WARN', 'USER_SUSPEND', 'USER_UNSUSPEND', 'USER_DELETE', 'USER_RESTORE', 'USER_UPDATE', 'STUDY_VIEW', 'STUDY_HIDE', 'STUDY_CLOSE', 'STUDY_DELETE', 'STUDY_RECOMMEND', 'REPORT_VIEW', 'REPORT_ASSIGN', 'REPORT_RESOLVE', 'REPORT_REJECT', 'CONTENT_DELETE', 'CONTENT_RESTORE', 'SETTINGS_VIEW', 'SETTINGS_UPDATE', 'SETTINGS_CACHE_CLEAR', 'AUDIT_VIEW', 'AUDIT_EXPORT');
ALTER TABLE "AdminLog" ALTER COLUMN "action" TYPE "AdminAction_new" USING ("action"::text::"AdminAction_new");
ALTER TYPE "AdminAction" RENAME TO "AdminAction_old";
ALTER TYPE "AdminAction_new" RENAME TO "AdminAction";
DROP TYPE "public"."AdminAction_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MemberRole_new" AS ENUM ('OWNER', 'MEMBER');
ALTER TABLE "public"."StudyMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "StudyMember" ALTER COLUMN "role" TYPE "MemberRole_new" USING ("role"::text::"MemberRole_new");
ALTER TYPE "MemberRole" RENAME TO "MemberRole_old";
ALTER TYPE "MemberRole_new" RENAME TO "MemberRole";
DROP TYPE "public"."MemberRole_old";
ALTER TABLE "StudyMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SanctionType_new" AS ENUM ('WARNING', 'CHAT_BAN', 'STUDY_CREATE_BAN', 'FILE_UPLOAD_BAN', 'SUSPENSION', 'PERMANENT_BAN');
ALTER TABLE "Sanction" ALTER COLUMN "type" TYPE "SanctionType_new" USING ("type"::text::"SanctionType_new");
ALTER TYPE "SanctionType" RENAME TO "SanctionType_old";
ALTER TYPE "SanctionType_new" RENAME TO "SanctionType";
DROP TYPE "public"."SanctionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropIndex
DROP INDEX "Sanction_adminId_idx";

-- AlterTable
ALTER TABLE "AdminLog" DROP COLUMN "details",
ADD COLUMN     "after" JSONB,
ADD COLUMN     "before" JSONB,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Sanction" DROP COLUMN "unsuspendAdminId",
DROP COLUMN "unsuspendAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unsuspendedAt" TIMESTAMP(3),
ADD COLUMN     "unsuspendedBy" TEXT;

-- DropTable
DROP TABLE "FunctionRestriction";

-- DropTable
DROP TABLE "Setting";

-- DropEnum
DROP TYPE "SettingType";

-- CreateTable
CREATE TABLE "NoticeFile" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" "WarningSeverity" NOT NULL DEFAULT 'NORMAL',
    "relatedContent" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminRoleType" NOT NULL,
    "permissions" JSONB NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoticeFile_noticeId_idx" ON "NoticeFile"("noticeId");

-- CreateIndex
CREATE INDEX "NoticeFile_fileId_idx" ON "NoticeFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeFile_noticeId_fileId_key" ON "NoticeFile"("noticeId", "fileId");

-- CreateIndex
CREATE INDEX "Warning_userId_createdAt_idx" ON "Warning"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Warning_severity_createdAt_idx" ON "Warning"("severity", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_userId_key" ON "AdminRole"("userId");

-- CreateIndex
CREATE INDEX "AdminRole_role_idx" ON "AdminRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "AdminLog_targetType_targetId_idx" ON "AdminLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Sanction_isActive_expiresAt_idx" ON "Sanction"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- AddForeignKey
ALTER TABLE "NoticeFile" ADD CONSTRAINT "NoticeFile_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeFile" ADD CONSTRAINT "NoticeFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
