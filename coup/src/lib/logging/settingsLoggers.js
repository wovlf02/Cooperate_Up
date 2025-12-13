/**
 * Admin Logger - Settings Management Loggers
 * 설정 관리 관련 로깅 기능
 *
 * @module lib/logging/settingsLoggers
 */

import { CoreLogger } from './coreLogger';
import { sanitizeSensitiveData } from './constants';

/**
 * Settings Management Logger Mixin
 */
export const SettingsLoggers = {
  /**
   * 시스템 설정 변경 로깅
   */
  logSettingChange(adminId, settingKey, oldValue, newValue, context = {}) {
    CoreLogger.warn(`System setting changed: ${settingKey}`, {
      action: 'setting_change',
      adminId,
      settingKey,
      oldValue: sanitizeSensitiveData({ value: oldValue }).value,
      newValue: sanitizeSensitiveData({ value: newValue }).value,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 설정 조회 로깅
   */
  logSettingsView(adminId, context = {}) {
    CoreLogger.debug(`Settings viewed by admin: ${adminId}`, {
      action: 'settings_view',
      adminId,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 설정 업데이트 로깅
   */
  logSettingsUpdate(adminId, settings, context = {}) {
    CoreLogger.warn(`Settings updated by admin: ${adminId}`, {
      action: 'settings_update',
      adminId,
      settingsUpdated: Object.keys(settings || {}),
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 설정 변경 로깅 (캐시 클리어 등 특정 작업)
   */
  logSettingsChange(adminId, changeType, oldValue, newValue, context = {}) {
    CoreLogger.warn(`Settings changed: ${changeType} by admin: ${adminId}`, {
      action: 'settings_change',
      adminId,
      changeType,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

