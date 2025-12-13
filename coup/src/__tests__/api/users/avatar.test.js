/**
 * @jest-environment node
 */

import { POST, DELETE } from '@/app/api/users/avatar/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('fs/promises');
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireAuth: jest.fn(async () => {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return session;
  }),
}));

describe('POST /api/users/avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockFile = (name = 'avatar.jpg', size = 1024 * 1024, type = 'image/jpeg') => {
    const buffer = Buffer.alloc(size);
    return {
      name,
      size,
      type,
      arrayBuffer: async () => buffer.buffer,
    };
  };

  const mockRequest = (file) => ({
    formData: async () => {
      const formData = new Map();
      formData.set('file', file);
      return {
        get: (key) => formData.get(key),
      };
    },
  });

  it('should upload avatar successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: '/uploads/avatars/1_12345_avatar.jpg',
      bio: null,
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: null,
    });

    prisma.user.update.mockResolvedValue(mockUser);
    writeFile.mockResolvedValue();

    const file = createMockFile('avatar.jpg', 1024 * 1024, 'image/jpeg');
    const request = mockRequest(file);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.avatar).toMatch(/\/uploads\/avatars\//);
    expect(writeFile).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { avatar: expect.stringMatching(/\/uploads\/avatars\//) },
      select: expect.any(Object),
    });
  });

  it('should return 400 if file is not provided', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest(null);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-021');
  });

  it('should return 400 if file is too large', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const file = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg');
    const request = mockRequest(file);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-022');
  });

  it('should return 400 if file type is invalid', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const file = createMockFile('avatar.txt', 1024, 'text/plain');
    const request = mockRequest(file);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-023');
  });

  it('should delete old avatar when uploading new one', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: '/uploads/avatars/1_67890_new.jpg',
      bio: null,
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: '/uploads/avatars/1_12345_old.jpg',
    });

    prisma.user.update.mockResolvedValue(mockUser);
    existsSync.mockReturnValue(true);
    unlink.mockResolvedValue();
    writeFile.mockResolvedValue();

    const file = createMockFile('new.jpg', 1024 * 1024, 'image/jpeg');
    const request = mockRequest(file);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(unlink).toHaveBeenCalled();
  });

  it('should handle write file error', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: null,
    });

    writeFile.mockRejectedValue(new Error('Write failed'));

    const file = createMockFile('avatar.jpg', 1024 * 1024, 'image/jpeg');
    const request = mockRequest(file);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-026');
  });
});

describe('DELETE /api/users/avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete avatar successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: null,
      bio: null,
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: '/uploads/avatars/1_12345_avatar.jpg',
    });

    prisma.user.update.mockResolvedValue(mockUser);
    existsSync.mockReturnValue(true);
    unlink.mockResolvedValue();

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.avatar).toBe(null);
    expect(unlink).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { avatar: null },
      select: expect.any(Object),
    });
  });

  it('should return 404 if user not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '999', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue(null);

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-015');
  });

  it('should return 404 if no custom avatar exists', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: null,
    });

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-032');
  });

  it('should return 404 if avatar is default image', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: 'https://example.com/default-avatar.png',
    });

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-032');
  });

  it('should handle file deletion error', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      avatar: '/uploads/avatars/1_12345_avatar.jpg',
    });

    existsSync.mockReturnValue(true);
    unlink.mockRejectedValue(new Error('Unlink failed'));

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-030');
  });
});

