/**
 * @jest-environment node
 */

import {
  handleStudyError,
  withStudyErrorHandler,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  withRetry,
  extractParams,
  extractQuery,
  extractBody,
} from '@/lib/utils/study-utils';
import { StudyException } from '@/lib/exceptions/study';
import { NextResponse } from 'next/server';

// Mock StudyLogger
jest.mock('@/lib/logging/studyLogger', () => ({
  StudyLogger: {
    logError: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  extractRequestContext: jest.fn(() => ({ url: 'test-url', method: 'GET' })),
  extractErrorContext: jest.fn((error) => ({ message: error.message })),
}));

describe('Study Utils Tests', () => {
  describe('handleStudyError', () => {
    it('should handle StudyException correctly', async () => {
      const error = new StudyException(
        'STUDY-001',
        'Test error',
        {
          statusCode: 400,
          userMessage: 'User friendly message',
        }
      );

      const response = handleStudyError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('STUDY-001');
    });

    it('should handle generic errors', async () => {
      const error = new Error('Generic error');

      const response = handleStudyError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.code).toBe('STUDY-999');
    });

    it('should include request context when provided', async () => {
      const error = new StudyException('STUDY-001', 'Test error', { statusCode: 400 });
      const request = new Request('http://localhost:3000/api/studies');

      const response = handleStudyError(error, request, { studyId: 'study1' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('withStudyErrorHandler', () => {
    it('should wrap handler and catch errors', async () => {
      const handler = jest.fn().mockRejectedValue(
        new StudyException('STUDY-001', 'Test error', { statusCode: 400 })
      );

      const wrappedHandler = withStudyErrorHandler(handler);
      const request = new Request('http://localhost:3000/api/studies');
      const context = { params: { id: 'study1' } };

      const response = await wrappedHandler(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return success response when no error', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const wrappedHandler = withStudyErrorHandler(handler);
      const request = new Request('http://localhost:3000/api/studies');
      const context = {};

      const response = await wrappedHandler(request, context);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', async () => {
      const data = { id: 'study1', name: 'Test Study' };
      const response = createSuccessResponse(data);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should include message when provided', async () => {
      const data = { id: 'study1' };
      const response = createSuccessResponse(data, 'Created successfully', 201);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Created successfully');
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', async () => {
      const response = createErrorResponse('STUDY-001', 'Error message', 400);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.code).toBe('STUDY-001');
      expect(result.message).toBe('Error message');
    });

    it('should include additional data', async () => {
      const response = createErrorResponse(
        'STUDY-001',
        'Error',
        400,
        { field: 'name' }
      );
      const result = await response.json();

      expect(result.field).toBe('name');
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create paginated response with separate parameters', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, 10, 1, 5);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should create paginated response with options object', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createPaginatedResponse(data, { page: 1, limit: 5, total: 10 });
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should handle last page correctly', async () => {
      const data = [{ id: 1 }];
      const response = createPaginatedResponse(data, 5, 2, 3);
      const result = await response.json();

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('withRetry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('Temporary error');
          error.retryable = true;
          throw error;
        }
        return 'success';
      });

      const result = await withRetry(operation, {
        maxRetries: 3,
        delay: 10,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockImplementation(() => {
        const error = new Error('Non-retryable error');
        error.retryable = false;
        throw error;
      });

      await expect(
        withRetry(operation, { maxRetries: 3, delay: 10 })
      ).rejects.toThrow('Non-retryable error');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn().mockImplementation(() => {
        const error = new Error('Persistent error');
        error.retryable = true;
        throw error;
      });

      await expect(
        withRetry(operation, { maxRetries: 2, delay: 10 })
      ).rejects.toThrow('Persistent error');

      expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('extractParams', () => {
    it('should extract params from context', () => {
      const request = new Request('http://localhost:3000/api/studies/study1');
      const context = { params: { id: 'study1' } };

      const params = extractParams(request, context);

      expect(params).toEqual({ id: 'study1' });
    });

    it('should return empty object when no params', () => {
      const request = new Request('http://localhost:3000/api/studies');
      const context = {};

      const params = extractParams(request, context);

      expect(params).toEqual({});
    });
  });

  describe('extractQuery', () => {
    it('should extract query parameters', () => {
      const request = new Request('http://localhost:3000/api/studies?page=2&limit=10');

      const query = extractQuery(request);

      expect(query.page).toBe('2');
      expect(query.limit).toBe('10');
    });

    it('should return empty object when no query params', () => {
      const request = new Request('http://localhost:3000/api/studies');

      const query = extractQuery(request);

      expect(query).toEqual({});
    });
  });

  describe('extractBody', () => {
    it('should extract and parse JSON body', async () => {
      const request = new Request('http://localhost:3000/api/studies', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Study' }),
      });

      const body = await extractBody(request);

      expect(body.name).toBe('Test Study');
    });

    it('should throw exception for invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/studies', {
        method: 'POST',
        body: 'invalid json',
      });

      await expect(extractBody(request)).rejects.toThrow(StudyException);
    });
  });
});

