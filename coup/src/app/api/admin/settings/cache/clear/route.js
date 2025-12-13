import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import {
  AdminPermissionException,
  AdminSettingsException,
  AdminDatabaseException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

// POST /api/admin/settings/cache/clear - 캐시 초기화
async function clearCacheHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, 'SETTINGS_UPDATE')
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission('SETTINGS_UPDATE', 'unknown')
  }

  const adminId = auth.adminRole.userId

  AdminLogger.info('Admin settings cache clear request', { adminId })

  try {
    // 감사 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'SETTINGS_CACHE_CLEAR',
        targetType: 'Settings',
        targetId: 'cache',
        reason: '설정 캐시 초기화',
      }
    }).catch(error => {
      AdminLogger.warn('Failed to create admin log for cache clear', {
        adminId,
        error: error.message
      })
      throw AdminSettingsException.cacheClearFailed(error.message)
    })

    const duration = Date.now() - startTime
    AdminLogger.logSettingsChange(adminId, 'CACHE_CLEAR', {}, {
      action: 'clear_cache',
      duration
    })

    return NextResponse.json({
      success: true,
      message: '캐시가 초기화되었습니다.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in cache clear', {
      adminId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(clearCacheHandler)

