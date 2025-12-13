// src/app/api/studies/[id]/files/[fileId]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyFileException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'
import { unlink } from "fs/promises"
import { join } from "path"

/**
 * DELETE /api/studies/[id]/files/[fileId]
 * 스터디 파일 삭제
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, fileId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;
  const { session, member } = result;

  // 2. 파일 확인
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });

  if (!file) {
    throw StudyFileException.fileNotFound(fileId, { studyId });
  }

  if (file.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId);
  }

  // 3. 업로더 또는 ADMIN+ 권한 확인
  if (file.uploaderId !== session.user.id && !['OWNER', 'ADMIN'].includes(member.role)) {
    throw StudyFileException.cannotDeleteFile(session.user.id, fileId, file.uploaderId, {
      studyId,
      userRole: member.role
    });
  }

  // 4. 파일 시스템에서 삭제
  try {
    const filepath = join(process.cwd(), 'public', file.url);
    await unlink(filepath);
  } catch (error) {
    console.error('File system delete error:', error);
    // 파일이 없어도 DB에서는 삭제 진행
  }

  // 5. DB에서 파일 정보 삭제
  try {
    await prisma.file.delete({
      where: { id: fileId }
    });
  } catch (error) {
    throw StudyFileException.fileDeletionFailed(fileId, error.message, { studyId });
  }

  // 6. 로깅
  StudyLogger.logFileDelete(fileId, studyId, session.user.id, {
    filename: file.name,
    size: file.size
  });

  // 7. 응답
  return createSuccessResponse(null, '파일이 삭제되었습니다');
});

