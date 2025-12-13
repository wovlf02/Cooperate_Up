/**
 * @jest-environment node
 */

import {
  validateStudyCreate,
  validateStudyUpdate,
  validateMemberAction,
  validateApplicationData,
  validatePagination,
  validateSortOptions,
  validateNoticeData,
  validateFileUpload,
} from '@/lib/validators/study-validators';

import {
  StudyValidationException,
  StudyApplicationException,
  StudyNoticeException,
  StudyFileException,
} from '@/lib/exceptions/study';

describe('Study Validators Tests', () => {
  describe('validateStudyCreate', () => {
    const validData = {
      name: '테스트 스터디',
      description: '테스트 스터디입니다. 최소 10자 이상의 설명이 필요합니다.',
      category: 'programming',
      maxMembers: 10,
    };

    it('should validate correct study data', () => {
      const result = validateStudyCreate(validData, 'user1');
      expect(result.name).toBe('테스트 스터디');
      expect(result.category).toBe('programming');
      expect(result.maxMembers).toBe(10);
    });

    it('should throw exception when name is missing', () => {
      const invalidData = { ...validData, name: '' };
      expect(() => validateStudyCreate(invalidData, 'user1')).toThrow(
        StudyValidationException
      );
    });

    it('should throw exception when description is too short', () => {
      const invalidData = { ...validData, description: '짧음' };
      expect(() => validateStudyCreate(invalidData, 'user1')).toThrow(
        StudyValidationException
      );
    });
  });

  describe('validateStudyUpdate', () => {
    it('should validate update data', () => {
      const updateData = {
        name: '수정된 스터디',
        maxMembers: 15,
      };
      const result = validateStudyUpdate(updateData, 'study1', 'user1');
      expect(result.name).toBe('수정된 스터디');
      expect(result.maxMembers).toBe(15);
    });

    it('should throw exception when no fields to update', () => {
      expect(() => validateStudyUpdate({}, 'study1', 'user1')).toThrow(
        StudyValidationException
      );
    });

    it('should throw exception when invalid maxMembers', () => {
      const invalidData = { maxMembers: 1 };
      expect(() => validateStudyUpdate(invalidData, 'study1', 'user1')).toThrow(
        StudyValidationException
      );
    });
  });

  describe('validateMemberAction', () => {
    it('should validate member action', () => {
      const data = {
        studyId: 'study1',
        actorId: 'user1',
        targetId: 'user2',
        action: 'kick',
      };
      expect(() => validateMemberAction(data)).not.toThrow();
    });

    it('should throw exception when actorId is missing', () => {
      const invalidData = {
        studyId: 'study1',
        targetId: 'user2',
        action: 'add'
      };
      expect(() => validateMemberAction(invalidData)).toThrow();
    });

    it('should throw exception when targetId is invalid', () => {
      const invalidData = {
        studyId: 'study1',
        actorId: 'user1',
        action: 'kick'
      };
      expect(() => validateMemberAction(invalidData)).toThrow();
    });
  });

  describe('validateApplicationData', () => {
    it('should validate application data', () => {
      const data = {
        message: '가입하고 싶습니다. 열심히 하겠습니다.',
      };
      const result = validateApplicationData(data);
      expect(result.message).toBe('가입하고 싶습니다. 열심히 하겠습니다.');
    });

    it('should throw exception when message is missing', () => {
      const invalidData = {};
      expect(() => validateApplicationData(invalidData)).toThrow(
        StudyApplicationException
      );
    });

    it('should throw exception when message is too short', () => {
      const invalidData = { message: '짧음' };
      expect(() => validateApplicationData(invalidData)).toThrow(
        StudyApplicationException
      );
    });
  });

  describe('validatePagination', () => {
    it('should validate and return pagination params', () => {
      const query = { page: '2', limit: '20' };
      const result = validatePagination(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(20);
    });

    it('should use default values when not provided', () => {
      const result = validatePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });
  });

  describe('validateSortOptions', () => {
    it('should validate sort options', () => {
      const result = validateSortOptions({ sortBy: 'createdAt' });
      expect(result.sortBy).toBe('createdAt');
    });

    it('should use default sort when not provided', () => {
      const result = validateSortOptions({});
      expect(result.sortBy).toBeDefined();
    });
  });

  describe('validateNoticeData', () => {
    it('should validate notice data', () => {
      const data = {
        title: '공지사항 제목',
        content: '공지사항 내용입니다',
      };
      const result = validateNoticeData(data);
      expect(result.title).toBe('공지사항 제목');
      expect(result.content).toBe('공지사항 내용입니다');
      expect(result.isPinned).toBe(false);
    });

    it('should throw exception when title is missing', () => {
      const invalidData = { content: '내용' };
      expect(() => validateNoticeData(invalidData)).toThrow();
    });
  });

  describe('validateFileUpload', () => {
    it('should validate file upload', () => {
      const file = {
        name: 'test.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
      };
      const result = validateFileUpload(file);
      expect(result.name).toBe('test.pdf');
      expect(result.size).toBe(1024 * 1024);
      expect(result.type).toBe('application/pdf');
    });

    it('should throw exception when file is too large', () => {
      const largeFile = {
        name: 'large.pdf',
        size: 11 * 1024 * 1024, // 11MB
        type: 'application/pdf',
      };
      expect(() => validateFileUpload(largeFile)).toThrow();
    });
  });
});

