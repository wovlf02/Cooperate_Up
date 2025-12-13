// 기본 시스템 설정 시드
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const defaultSettings = [
  // 일반 설정
  {
    category: 'general',
    key: 'site_name',
    value: 'CoUp',
    type: 'string',
    description: '사이트 이름'
  },
  {
    category: 'general',
    key: 'site_description',
    value: '함께 성장하는 스터디 플랫폼',
    type: 'string',
    description: '사이트 설명'
  },
  {
    category: 'general',
    key: 'contact_email',
    value: 'contact@coup.com',
    type: 'string',
    description: '연락처 이메일'
  },

  // 보안 설정
  {
    category: 'security',
    key: 'min_password_length',
    value: '8',
    type: 'number',
    description: '최소 비밀번호 길이'
  },
  {
    category: 'security',
    key: 'max_login_attempts',
    value: '5',
    type: 'number',
    description: '최대 로그인 시도 횟수'
  },
  {
    category: 'security',
    key: 'session_timeout',
    value: '30',
    type: 'number',
    description: '세션 타임아웃 (분)'
  },
  {
    category: 'security',
    key: 'enable_ip_blocking',
    value: 'true',
    type: 'boolean',
    description: 'IP 차단 기능 사용'
  },

  // 알림 설정
  {
    category: 'notification',
    key: 'enable_email_notification',
    value: 'true',
    type: 'boolean',
    description: '이메일 알림 사용'
  },
  {
    category: 'notification',
    key: 'enable_report_alert',
    value: 'true',
    type: 'boolean',
    description: '신고 접수 알림'
  },
  {
    category: 'notification',
    key: 'enable_system_alert',
    value: 'true',
    type: 'boolean',
    description: '시스템 경고 알림'
  },

  // 기능 설정
  {
    category: 'feature',
    key: 'allow_signup',
    value: 'true',
    type: 'boolean',
    description: '회원 가입 허용'
  },
  {
    category: 'feature',
    key: 'allow_study_creation',
    value: 'true',
    type: 'boolean',
    description: '스터디 생성 허용'
  },
  {
    category: 'feature',
    key: 'allow_file_upload',
    value: 'true',
    type: 'boolean',
    description: '파일 업로드 허용'
  },
  {
    category: 'feature',
    key: 'max_file_size',
    value: '10',
    type: 'number',
    description: '최대 파일 크기 (MB)'
  },
  {
    category: 'feature',
    key: 'max_study_members',
    value: '20',
    type: 'number',
    description: '스터디 최대 멤버 수'
  }
]

async function seedSettings() {
  console.log('🌱 Seeding system settings...')

  try {
    // 기존 설정 삭제
    await prisma.systemSetting.deleteMany()

    // 기본 설정 생성
    for (const setting of defaultSettings) {
      await prisma.systemSetting.create({
        data: {
          ...setting,
          updatedBy: 'system' // 초기 시드는 시스템이 생성
        }
      })
    }

    console.log(`✅ ${defaultSettings.length}개의 기본 설정이 생성되었습니다.`)
  } catch (error) {
    console.error('❌ 설정 시드 중 오류:', error)
    throw error
  }
}

async function main() {
  await seedSettings()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

