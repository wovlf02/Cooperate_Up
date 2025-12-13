-- CreateIndex
CREATE INDEX "Sanction_userId_isActive_expiresAt_idx" ON "Sanction"("userId", "isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "StudyMember_studyId_status_idx" ON "StudyMember"("studyId", "status");

-- CreateIndex
CREATE INDEX "Warning_userId_severity_createdAt_idx" ON "Warning"("userId", "severity", "createdAt");
