import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import {
  AdminPermissionException,
  AdminSettingsException,
  AdminDatabaseException,
  AdminValidationException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

// 메모리 캐시
let settingsCache = null
let cacheTimestamp = null
const CACHE_TTL = 5 * 60 * 1000 // 5분

// 설정 값 파싱 함수
function parseSettingValue(value, type) {
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

// 설정 카테고리별 그룹화
function groupSettingsByCategory(settings) {
  const grouped = {}

  settings.forEach(setting => {
    if (!grouped[setting.category]) {
      grouped[setting.category] = {}
    }

    grouped[setting.category][setting.key] = {
      value: parseSettingValue(setting.value, setting.type),
      type: setting.type,
      description: setting.description,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy
    }
  })

  return grouped
}

// GET /api/admin/settings - 설정 조회
async function getSettingsHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, 'SETTINGS_VIEW')
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission('SETTINGS_VIEW', 'unknown')
  }

  const adminId = auth.adminRole.userId

  AdminLogger.info('Admin settings view request', { adminId })

  try {
    const { searchParams } = new URL(request.url)
    const useCache = searchParams.get('cache') !== 'false'

    // 캐시 확인
    if (useCache && settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      AdminLogger.debug('Settings loaded from cache', { adminId })
      return NextResponse.json({
        success: true,
        data: settingsCache,
        cached: true
      })
    }

    // 데이터베이스에서 설정 조회
    const settings = await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    }).catch(error => {
      AdminLogger.error('Database query failed for settings', {
        adminId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('systemSetting.findMany', error.message)
    })

    // 카테고리별 그룹화
    const grouped = groupSettingsByCategory(settings)

    // 캐시 업데이트
    settingsCache = grouped
    cacheTimestamp = Date.now()

    const duration = Date.now() - startTime
    AdminLogger.logSettingsView(adminId, {
      settingsCount: settings.length,
      cached: false,
      duration
    })

    return NextResponse.json({
      success: true,
      data: grouped
    })

  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in settings view', {
      adminId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/admin/settings - 설정 업데이트
async function updateSettingsHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, 'SETTINGS_UPDATE')
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission('SETTINGS_UPDATE', 'unknown')
  }

  const adminId = auth.adminRole.userId

  AdminLogger.warn('Admin settings update request', { adminId }, 'high')

  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      throw AdminValidationException.invalidFieldFormat('settings', typeof settings, 'array')
    }

    if (settings.length === 0) {
      throw AdminValidationException.missingField('settings (empty array)')
    }

    // 트랜잭션으로 일괄 업데이트
    const updates = await prisma.$transaction(
      settings.map(setting =>
        prisma.systemSetting.update({
          where: { key: setting.key },
          data: {
            value: String(setting.value),
            updatedBy: adminId
          }
        }).catch(error => {
          if (error.code === 'P2025') {
            throw AdminSettingsException.settingNotFound(setting.key)
          }
          throw AdminSettingsException.settingUpdateFailed(setting.key, error.message)
        })
      )
    ).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('settings update', error.message)
    })

    // 캐시 무효화
    settingsCache = null
    cacheTimestamp = null

    // 감사 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'SETTINGS_UPDATE',
        targetType: 'Settings',
        targetId: 'bulk',
        metadata: { settings },
        reason: `${settings.length}개의 설정 업데이트`,
      }
    })

    const duration = Date.now() - startTime
    AdminLogger.logSettingsUpdate(adminId, settings, {
      updatedCount: updates.length,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      updated: updates.length
    })

  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in settings update', {
      adminId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getSettingsHandler)
export const PUT = withAdminErrorHandler(updateSettingsHandler)

