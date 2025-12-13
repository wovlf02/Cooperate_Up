// src/mocks/settings.js
// 관리자 시스템 설정 Mock 데이터

export const mockSettings = {
  service: {
    status: 'OPERATIONAL', // OPERATIONAL | MAINTENANCE
    signupEnabled: true,
    studyCreationEnabled: true,
    socialLoginEnabled: true,
    publicBrowsingEnabled: true,
    maintenanceMessage: ''
  },
  limits: {
    maxStudiesPerUser: 10,
    maxMembersPerStudy: 50,
    maxFileSize: 50, // MB
    maxStoragePerStudy: 1024, // MB (1GB)
    maxMessageLength: 2000,
    messageRateLimit: {
      count: 10,
      window: 60 // seconds
    }
  },
  features: {
    videoCallEnabled: true,
    fileUploadEnabled: true,
    notificationsEnabled: true,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: false
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: true,
    sessionTimeout: 86400, // seconds (24 hours)
    maxLoginAttempts: 5,
    lockoutDuration: 900 // seconds (15 minutes)
  },
  email: {
    provider: 'SMTP',
    fromName: 'CoUp',
    fromEmail: 'noreply@coup.com',
    replyTo: 'support@coup.com'
  },
  backup: {
    enabled: true,
    frequency: 'WEEKLY', // DAILY | WEEKLY | MONTHLY
    retentionDays: 30,
    lastBackup: new Date(Date.now() - 86400000).toISOString()
  }
}

export function getMockSettings() {
  return mockSettings
}

export function getMockSettingByKey(key) {
  const keys = key.split('.')
  let value = mockSettings

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return undefined
    }
  }

  return value
}

