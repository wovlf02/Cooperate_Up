// src/app/api/studies/[id]/files/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse,
  createPaginatedResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyFileException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import {
  validateFileSecurity,
  generateSafeFilename,
  checkStudyStorageQuota
} from "@/lib/utils/file-security-validator"
import { sanitizeFilename } from "@/lib/utils/xss-sanitizer"

/**
 * GET /api/studies/[id]/files
 * 스터디 파일 목록 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  // 2. 쿼리 파라미터 추출 및 검증
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;

  // 3. where 조건 생성
  let whereClause = { studyId };
  if (folderId) {
    whereClause.folderId = folderId;
  } else {
    whereClause.folderId = null; // 루트만
  }

  // 4. 비즈니스 로직 - 데이터 조회
  const [total, files] = await Promise.all([
    prisma.file.count({ where: whereClause }),
    prisma.file.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })
  ]);

  // 5. 로깅
  StudyLogger.logFileList(studyId, { page, limit, folderId, total });

  // 6. 응답
  return createPaginatedResponse(files, total, page, limit);
});

/**
 * POST /api/studies/[id]/files
 * 스터디 파일 업로드
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  // 2. FormData 파싱
  const formData = await request.formData();
  const file = formData.get('file');
  const rawFolderId = formData.get('folderId');
  const folderId = rawFolderId && rawFolderId !== '' ? rawFolderId : null;
  const rawCategory = formData.get('category');
  
  // 파일 확장자에 따라 카테고리 자동 결정
  const getAutoCategory = (filename) => {
    if (!filename) return 'DOCUMENT';
    const ext = filename.toLowerCase().split('.').pop();

    // 이미지
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'heic', 'heif'].includes(ext)) {
      return 'IMAGE';
    }
    // 비디오
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(ext)) {
      return 'VIDEO';
    }
    // 오디오
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) {
      return 'AUDIO';
    }
    // 압축
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(ext)) {
      return 'ARCHIVE';
    }
    // 코드
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rb', 'php', 'swift', 'kt', 'rs', 'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash'].includes(ext)) {
      return 'CODE';
    }
    // 기본: 문서
    return 'DOCUMENT';
  };

  // 유효한 카테고리 목록
  const validCategories = ['IMAGE', 'DOCUMENT', 'ARCHIVE', 'VIDEO', 'AUDIO', 'CODE'];
  // rawCategory가 유효하면 사용, 아니면 파일 확장자 기반 자동 결정
  const category = validCategories.includes(rawCategory) ? rawCategory : getAutoCategory(file?.name);

  // 3. 파일 존재 확인
  if (!file) {
    throw StudyFileException.fileRequired({ studyId });
  }

  // 3-1. 파일 객체 검증 (FormData에서 File 객체가 아닌 경우)
  if (typeof file === 'string' || !file.name || typeof file.arrayBuffer !== 'function') {
    throw StudyFileException.fileRequired({ 
      studyId,
      userMessage: '올바른 파일을 선택해주세요'
    });
  }

  // 4. 파일 이름 정제
  const sanitizedFilename = sanitizeFilename(file.name);

  if (!sanitizedFilename || sanitizedFilename === 'untitled') {
    throw StudyFileException.invalidFileType(file.name, [], {
      studyId,
      userMessage: '유효하지 않은 파일명입니다'
    });
  }

  // 5. 파일 크기 검증 (10MB for safety)
  const maxFileSize = 10 * 1024 * 1024;
  if (file.size > maxFileSize) {
    throw StudyFileException.fileSizeTooLarge(file.size, maxFileSize, { studyId });
  }

  // 6. 파일 버퍼 읽기
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 7. 파일 보안 검증 (통합)
  const securityValidation = await validateFileSecurity({
    filename: sanitizedFilename,
    mimeType: file.type,
    size: file.size,
    buffer: buffer,
  }, category);

  if (!securityValidation.valid) {
    console.warn('[File Security] Validation failed:', {
      userId: session.user.id,
      studyId,
      filename: sanitizedFilename,
      errors: securityValidation.errors,
    });

    const allowedTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md', 'zip'];
    throw StudyFileException.invalidFileType(file.type, allowedTypes, {
      studyId,
      filename: sanitizedFilename,
      errors: securityValidation.errors.map(e => e.message)
    });
  }

  // 경고 로깅
  if (securityValidation.warnings.length > 0) {
    console.warn('[File Security] Warnings:', {
      userId: session.user.id,
      studyId,
      filename: sanitizedFilename,
      warnings: securityValidation.warnings,
    });
  }

  // 8. 저장 공간 확인 (스터디당 1GB 제한)
  const studyQuota = 1024 * 1024 * 1024; // 1GB
  const studyUsed = await prisma.file.aggregate({
    where: { studyId },
    _sum: { size: true },
  });

  const currentUsage = studyUsed._sum.size || 0;
  const quotaCheck = checkStudyStorageQuota(studyId, file.size, studyQuota, currentUsage);

  if (!quotaCheck.allowed) {
    throw StudyFileException.storageQuotaExceeded(file.size, studyQuota - currentUsage, {
      studyId,
      quota: `${quotaCheck.quotaInMB}MB`,
      used: `${quotaCheck.usedInMB}MB`,
      available: `${quotaCheck.availableInMB}MB`,
      requested: `${quotaCheck.requestedInMB}MB`,
    });
  }

  // 9. uploads 폴더 생성
  const uploadsDir = join(process.cwd(), 'public', 'uploads', studyId);
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // 10. 안전한 파일명 생성
  const safeFilename = generateSafeFilename(sanitizedFilename, session.user.id);
  const filepath = join(uploadsDir, safeFilename);

  // 11. 파일 저장
  try {
    await writeFile(filepath, buffer);
  } catch (error) {
    throw StudyFileException.fileUploadFailed(sanitizedFilename, error.message, { studyId });
  }

  // 12. DB에 파일 정보 저장
  const fileUrl = `/uploads/${studyId}/${safeFilename}`;

  const savedFile = await prisma.file.create({
    data: {
      studyId,
      uploaderId: session.user.id,
      name: sanitizedFilename, // 원본 파일명 (정제된)
      size: file.size,
      type: file.type,
      url: fileUrl,
      folderId: folderId  // 이미 null로 정제됨
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // 13. 파일 업로드 알림 (최대 10명)
  const members = await prisma.studyMember.findMany({
    where: {
      studyId,
      status: 'ACTIVE',
      userId: { not: session.user.id }
    },
    take: 10
  });

  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { name: true, emoji: true }
  });

  if (members.length > 0 && study) {
    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'FILE',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 파일: ${sanitizedFilename}`
      }))
    });
  }

  // 14. 로깅
  StudyLogger.logFileUpload(savedFile.id, studyId, session.user.id, {
    filename: sanitizedFilename,
    size: file.size,
    type: file.type
  });

  // 15. 응답
  return createSuccessResponse(
    {
      ...savedFile,
      storage: {
        usagePercentage: quotaCheck.usagePercentage,
        used: `${(quotaCheck.afterUpload / (1024 * 1024)).toFixed(2)}MB`,
        quota: `${(studyQuota / (1024 * 1024)).toFixed(2)}MB`,
      }
    },
    '파일이 업로드되었습니다',
    201
  );
});

