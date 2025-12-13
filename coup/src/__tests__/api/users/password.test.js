/**
 * @jest-environment node
 */

import { PATCH } from '@/app/api/users/me/password/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
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

describe('PATCH /api/users/me/password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body) => ({
    json: async () => body,
    headers: new Map([['x-forwarded-for', '127.0.0.1']]),
  });

  it('should change password successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedOldPassword',
    });

    bcrypt.compare
      .mockResolvedValueOnce(true) // currentPassword check
      .mockResolvedValueOnce(false); // newPassword != oldPassword

    bcrypt.hash.mockResolvedValue('hashedNewPassword');

    prisma.user.update.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!@#',
      confirmPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('비밀번호가 변경되었습니다');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { password: 'hashedNewPassword' },
    });
  });

  it('should return 400 if currentPassword is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      newPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-036');
  });

  it('should return 400 if newPassword is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-036');
  });

  it('should return 400 if password is too weak', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'weak',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-039');
  });

  it('should return 400 if passwords do not match', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!@#',
      confirmPassword: 'DifferentPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-050');
  });

  it('should return 401 if current password is incorrect', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedOldPassword',
    });

    bcrypt.compare.mockResolvedValue(false);

    const request = mockRequest({
      currentPassword: 'WrongPassword',
      newPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-046');
  });

  it('should return 400 if new password is same as old', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword',
    });

    bcrypt.compare
      .mockResolvedValueOnce(true) // currentPassword check
      .mockResolvedValueOnce(true); // newPassword == oldPassword

    const request = mockRequest({
      currentPassword: 'SamePass123!@#',
      newPassword: 'SamePass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-049');
  });

  it('should return 404 if user not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '999', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue(null);

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-015');
  });

  it('should return 500 if user has no password (OAuth account)', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: null,
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-048');
  });

  it('should work without confirmPassword', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashedOldPassword',
    });

    bcrypt.compare
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    bcrypt.hash.mockResolvedValue('hashedNewPassword');

    prisma.user.update.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const request = mockRequest({
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!@#',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

