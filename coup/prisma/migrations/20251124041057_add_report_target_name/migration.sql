-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetName" TEXT;

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
