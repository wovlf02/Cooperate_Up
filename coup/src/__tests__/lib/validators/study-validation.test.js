/**
 * @jest-environment node
 */

import {
  validateStudyCreate,
  validateStudyUpdate,
  validateRoleChange,
  validateMemberKick,
  validateJoinReject,
  validateNotice,
  validateFile,
  validateTask,
  validateMessage,
  ALLOWED_FILE_TYPES,
  ALL_ALLOWED_FILE_TYPES
} from '@/lib/validators/study-validation';

describe('Study Validators', () => {
  // ============================================
  // validateStudyCreate Tests
  // ============================================
  describe('validateStudyCreate', () => {
    it('should validate valid study creation data', () => {
      const validData = {
        name: '알고리즘 스터디',
        description: '코딩테스트 준비를 위한 스터디입니다.',
        category: 'IT',
        maxMembers: 10,
        isRecruiting: true,
        autoApprove: false,
      };

      const result = validateStudyCreate(validData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('알고리즘 스터디');
      expect(result.data.maxMembers).toBe(10);
    });

    it('should return error for missing required fields (name)', () => {
      const invalidData = {
        description: '설명만 있습니다.',
        category: 'IT',
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should return error for missing required fields (description)', () => {
      const invalidData = {
        name: '스터디 이름',
        category: 'IT',
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });

    it('should return error for missing required fields (category)', () => {
      const invalidData = {
        name: '스터디 이름',
        description: '설명입니다. 최소 10자 이상입니다.',
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.field === 'category')).toBe(true);
    });

    it('should validate maxMembers range (too small)', () => {
      const invalidData = {
        name: '스터디',
        description: '설명입니다. 최소 10자 이상입니다.',
        category: 'IT',
        maxMembers: 1, // too small
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'maxMembers')).toBe(true);
    });

    it('should validate maxMembers range (too large)', () => {
      const invalidData = {
        name: '스터디',
        description: '설명입니다. 최소 10자 이상입니다.',
        category: 'IT',
        maxMembers: 1000, // too large
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'maxMembers')).toBe(true);
    });

    it('should use default maxMembers when not provided', () => {
      const validData = {
        name: '스터디',
        description: '설명입니다. 최소 10자 이상입니다.',
        category: 'IT',
      };

      const result = validateStudyCreate(validData);

      expect(result.success).toBe(true);
      expect(result.data.maxMembers).toBe(10); // default value
    });

    it('should validate name length (too short)', () => {
      const invalidData = {
        name: '스', // too short
        description: '설명입니다. 최소 10자 이상입니다.',
        category: 'IT',
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should validate description length (too short)', () => {
      const invalidData = {
        name: '스터디',
        description: '짧음', // too short
        category: 'IT',
      };

      const result = validateStudyCreate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });
  });

  // ============================================
  // validateStudyUpdate Tests
  // ============================================
  describe('validateStudyUpdate', () => {
    it('should validate valid partial update', () => {
      const validData = {
        name: '수정된 스터디',
        isRecruiting: false,
      };

      const result = validateStudyUpdate(validData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('수정된 스터디');
      expect(result.data.isRecruiting).toBe(false);
    });

    it('should return error when no fields provided', () => {
      const result = validateStudyUpdate({});

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.field === '_general')).toBe(true);
    });

    it('should validate field types', () => {
      const validData = {
        maxMembers: 20,
        isRecruiting: true,
        autoApprove: false,
      };

      const result = validateStudyUpdate(validData);

      expect(result.success).toBe(true);
      expect(result.data.maxMembers).toBe(20);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
      };

      const result = validateStudyUpdate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should reject empty description', () => {
      const invalidData = {
        description: '',
      };

      const result = validateStudyUpdate(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });
  });

  // ============================================
  // validateRoleChange Tests
  // ============================================
  describe('validateRoleChange', () => {
    it('should validate valid role', () => {
      const validData = {
        role: 'ADMIN',
      };

      const result = validateRoleChange(validData);

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('ADMIN');
    });

    it('should return error for missing role', () => {
      const result = validateRoleChange({});

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    it('should validate MEMBER role', () => {
      const validData = {
        role: 'MEMBER',
      };

      const result = validateRoleChange(validData);

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('MEMBER');
    });
  });

  // ============================================
  // validateMemberKick Tests
  // ============================================
  describe('validateMemberKick', () => {
    it('should validate with reason', () => {
      const validData = {
        reason: '규칙 위반',
      };

      const result = validateMemberKick(validData);

      expect(result.success).toBe(true);
      expect(result.data.reason).toBe('규칙 위반');
    });

    it('should validate without reason', () => {
      const result = validateMemberKick({});

      expect(result.success).toBe(true);
      expect(result.data.reason).toBeUndefined();
    });

    it('should reject too long reason', () => {
      const invalidData = {
        reason: 'a'.repeat(201), // too long
      };

      const result = validateMemberKick(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'reason')).toBe(true);
    });
  });

  // ============================================
  // validateJoinReject Tests
  // ============================================
  describe('validateJoinReject', () => {
    it('should validate with reason', () => {
      const validData = {
        reason: '자격 요건 미충족',
      };

      const result = validateJoinReject(validData);

      expect(result.success).toBe(true);
      expect(result.data.reason).toBe('자격 요건 미충족');
    });

    it('should validate without reason', () => {
      const result = validateJoinReject({});

      expect(result.success).toBe(true);
      expect(result.data.reason).toBeUndefined();
    });
  });

  // ============================================
  // validateNotice Tests
  // ============================================
  describe('validateNotice', () => {
    it('should validate valid notice creation', () => {
      const validData = {
        title: '중요 공지사항',
        content: '이번 주 스터디는 온라인으로 진행됩니다.',
        isPinned: true,
      };

      const result = validateNotice(validData, false);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('중요 공지사항');
      expect(result.data.isPinned).toBe(true);
    });

    it('should return error for missing title in creation', () => {
      const invalidData = {
        content: '내용만 있습니다.',
      };

      const result = validateNotice(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should return error for missing content in creation', () => {
      const invalidData = {
        title: '제목만 있음',
      };

      const result = validateNotice(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });

    it('should validate partial update', () => {
      const validData = {
        title: '수정된 제목',
      };

      const result = validateNotice(validData, true);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('수정된 제목');
    });

    it('should validate title length', () => {
      const invalidData = {
        title: 'a'.repeat(101), // too long
        content: '내용입니다. 최소 10자 이상입니다.',
      };

      const result = validateNotice(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should validate content length (too short)', () => {
      const invalidData = {
        title: '제목',
        content: '짧음', // too short
      };

      const result = validateNotice(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });
  });

  // ============================================
  // validateFile Tests
  // ============================================
  describe('validateFile', () => {
    it('should validate valid file', () => {
      const validFile = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
      };

      const result = validateFile(validFile);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('document.pdf');
      expect(result.data.size).toBe(1024 * 1024);
    });

    it('should return error for missing file', () => {
      const result = validateFile(null);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'file')).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      const largeFile = {
        name: 'large.pdf',
        size: 51 * 1024 * 1024, // 51MB (exceeds 50MB limit)
        type: 'application/pdf',
      };

      const result = validateFile(largeFile);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'file')).toBe(true);
    });

    it('should reject file with too long name', () => {
      const fileWithLongName = {
        name: 'a'.repeat(256) + '.pdf', // exceeds 255 chars
        size: 1024,
        type: 'application/pdf',
      };

      const result = validateFile(fileWithLongName);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'file')).toBe(true);
    });
  });

  // ============================================
  // validateTask Tests
  // ============================================
  describe('validateTask', () => {
    it('should validate valid task creation', () => {
      const validData = {
        title: '과제 제출하기',
        description: '알고리즘 문제 풀이 제출',
        priority: 'HIGH',
        status: 'TODO',
      };

      const result = validateTask(validData, false);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('과제 제출하기');
      expect(result.data.priority).toBe('HIGH');
    });

    it('should return error for missing title in creation', () => {
      const invalidData = {
        description: '설명만 있음',
      };

      const result = validateTask(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should validate partial update', () => {
      const validData = {
        status: 'DONE',
      };

      const result = validateTask(validData, true);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('DONE');
    });

    it('should validate priority enum', () => {
      const invalidData = {
        title: '작업',
        priority: 'INVALID', // invalid priority
      };

      const result = validateTask(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'priority')).toBe(true);
    });

    it('should validate status enum', () => {
      const invalidData = {
        title: '작업',
        status: 'INVALID', // invalid status
      };

      const result = validateTask(invalidData, false);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });
  });

  // ============================================
  // validateMessage Tests
  // ============================================
  describe('validateMessage', () => {
    it('should validate message with content', () => {
      const validData = {
        content: '안녕하세요!',
      };

      const result = validateMessage(validData);

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('안녕하세요!');
    });

    it('should validate message with file', () => {
      const validData = {
        fileUrl: 'https://example.com/file.pdf',
      };

      const result = validateMessage(validData);

      expect(result.success).toBe(true);
      expect(result.data.fileUrl).toBe('https://example.com/file.pdf');
    });

    it('should validate message with both content and file', () => {
      const validData = {
        content: '파일 첨부합니다.',
        fileUrl: 'https://example.com/file.pdf',
      };

      const result = validateMessage(validData);

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('파일 첨부합니다.');
      expect(result.data.fileUrl).toBe('https://example.com/file.pdf');
    });

    it('should return error when both content and file are missing', () => {
      const result = validateMessage({});

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === '_general')).toBe(true);
    });

    it('should validate content length (too long)', () => {
      const invalidData = {
        content: 'a'.repeat(2001), // exceeds 2000 chars
      };

      const result = validateMessage(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });
  });

  // ============================================
  // Constants Tests
  // ============================================
  describe('File Type Constants', () => {
    it('should have valid ALLOWED_FILE_TYPES structure', () => {
      expect(ALLOWED_FILE_TYPES).toBeDefined();
      expect(ALLOWED_FILE_TYPES.documents).toBeInstanceOf(Array);
      expect(ALLOWED_FILE_TYPES.images).toBeInstanceOf(Array);
      expect(ALLOWED_FILE_TYPES.archives).toBeInstanceOf(Array);
      expect(ALLOWED_FILE_TYPES.code).toBeInstanceOf(Array);
    });

    it('should have valid ALL_ALLOWED_FILE_TYPES', () => {
      expect(ALL_ALLOWED_FILE_TYPES).toBeInstanceOf(Array);
      expect(ALL_ALLOWED_FILE_TYPES.length).toBeGreaterThan(0);
    });
  });
});

