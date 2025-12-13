// src/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AUTH_ERRORS, logAuthError } from "@/lib/exceptions/auth-errors"
import { validateEmail, validatePassword, sanitizeEmail } from "@/lib/exceptions/validation-helpers"

/**
 * @typedef {Object} SessionUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} image
 * @property {"USER"} role
 * @property {"ACTIVE" | "SUSPENDED" | "DELETED"} status
 * @property {"CREDENTIALS" | "GOOGLE" | "GITHUB"} provider
 */

/**
 * @typedef {Object} Session
 * @property {SessionUser} user
 */

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] authorize 시작')
        console.log('🔐 [AUTH] credentials:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        try {
          // 1. 입력값 검증
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ [AUTH] 이메일 또는 비밀번호 누락')
            throw new Error(AUTH_ERRORS.MISSING_CREDENTIALS.message)
          }

          // 이메일 정제 및 검증
          const email = sanitizeEmail(credentials.email)
          const emailValidation = validateEmail(email)
          if (!emailValidation.valid) {
            console.log('❌ [AUTH] 이메일 형식 오류:', emailValidation.error)
            throw new Error(AUTH_ERRORS.INVALID_EMAIL_FORMAT.message)
          }

          // 비밀번호 기본 검증
          const passwordValidation = validatePassword(credentials.password)
          if (!passwordValidation.valid) {
            console.log('❌ [AUTH] 비밀번호 형식 오류:', passwordValidation.error)
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS.message)
          }

          // 2. 사용자 조회
          console.log('🔍 [AUTH] 사용자 조회 중:', email)
          let user
          try {
            user = await prisma.user.findUnique({
              where: { email }
            })
          } catch (dbError) {
            logAuthError('authorize - DB 조회', dbError, { email })
            throw new Error(AUTH_ERRORS.DB_QUERY_ERROR.message)
          }

          if (!user) {
            console.log('❌ [AUTH] 사용자를 찾을 수 없음')
            // 보안: 사용자 존재 여부를 숨기기 위해 동일한 메시지 사용
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS.message)
          }

          console.log('✅ [AUTH] 사용자 발견:', { id: user.id, email: user.email, status: user.status })

          // 3. 소셜 로그인 계정 체크
          if (!user.password) {
            console.log('❌ [AUTH] 비밀번호가 설정되지 않음 (소셜 로그인 계정)')
            throw new Error(AUTH_ERRORS.SOCIAL_ACCOUNT.message)
          }

          // 4. 비밀번호 검증
          console.log('🔑 [AUTH] 비밀번호 검증 중...')
          let isValid = false
          try {
            isValid = await bcrypt.compare(credentials.password, user.password)
          } catch (bcryptError) {
            logAuthError('authorize - bcrypt 비교', bcryptError, { email })
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS.message)
          }

          console.log('🔑 [AUTH] 비밀번호 검증 결과:', isValid)

          if (!isValid) {
            console.log('❌ [AUTH] 비밀번호 불일치')
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS.message)
          }

          // 5. 계정 상태 확인
          if (user.status === "DELETED") {
            console.log('❌ [AUTH] 삭제된 계정')
            throw new Error(AUTH_ERRORS.ACCOUNT_DELETED.message)
          }

          // 정지 상태 확인 및 기간 만료 체크
          if (user.status === "SUSPENDED") {
            // 정지 기간이 만료됐는지 확인
            if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
              // 정지 기간 만료 - 자동 해제
              console.log('🔓 [AUTH] 정지 기간 만료, 자동 해제 중...')
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    status: 'ACTIVE',
                    suspendedUntil: null,
                    suspendReason: null,
                  }
                })
                // 관련 제재 비활성화
                await prisma.sanction.updateMany({
                  where: {
                    userId: user.id,
                    type: 'SUSPENSION',
                    isActive: true,
                  },
                  data: { isActive: false }
                })
                user.status = 'ACTIVE'
                console.log('✅ [AUTH] 정지 자동 해제 완료')
              } catch (updateError) {
                logAuthError('authorize - 정지 자동 해제', updateError, { userId: user.id })
              }
            } else {
              // 아직 정지 중
              console.log('❌ [AUTH] 정지된 계정')
              const suspendedUntilStr = user.suspendedUntil
                ? new Date(user.suspendedUntil).toLocaleDateString('ko-KR')
                : '영구 정지'
              const message = user.suspendReason
                ? `계정이 정지되었습니다. (${suspendedUntilStr}까지)\n사유: ${user.suspendReason}`
                : `계정이 정지되었습니다. (${suspendedUntilStr}까지)`
              throw new Error(message)
            }
          }

          // 활동 제한 상태 확인 및 기간 만료 체크
          let restrictedActions = user.restrictedActions || []
          if (user.restrictedUntil) {
            if (new Date(user.restrictedUntil) < new Date()) {
              // 제한 기간 만료 - 자동 해제
              console.log('🔓 [AUTH] 활동 제한 기간 만료, 자동 해제 중...')
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    restrictedUntil: null,
                    restrictedActions: [],
                  }
                })
                await prisma.sanction.updateMany({
                  where: {
                    userId: user.id,
                    type: 'RESTRICTION',
                    isActive: true,
                  },
                  data: { isActive: false }
                })
                restrictedActions = []
                console.log('✅ [AUTH] 활동 제한 자동 해제 완료')
              } catch (updateError) {
                logAuthError('authorize - 활동 제한 자동 해제', updateError, { userId: user.id })
              }
            }
          }

          // 6. 관리자 권한 확인
          console.log('🔍 [AUTH] 관리자 권한 확인 중...')
          let adminRole = null
          try {
            adminRole = await prisma.adminRole.findUnique({
              where: { userId: user.id },
              select: {
                role: true,
                expiresAt: true,
              }
            })
          } catch (dbError) {
            logAuthError('authorize - 관리자 권한 조회', dbError, { userId: user.id })
            // 관리자 권한 조회 실패는 무시하고 진행
          }

          const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())
          console.log(`👤 [AUTH] 관리자 여부: ${isAdmin ? '✅ 관리자' : '❌ 일반 사용자'}`, adminRole?.role)

          // 7. lastLoginAt 업데이트
          console.log('✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...')
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            })
          } catch (dbError) {
            // lastLoginAt 업데이트 실패는 로그만 남기고 진행
            logAuthError('authorize - lastLoginAt 업데이트', dbError, { userId: user.id })
          }

          // avatar가 base64 데이터인 경우 null로 설정 (URL만 허용)
          let avatarUrl = null
          if (user.avatar && !user.avatar.startsWith('data:')) {
            avatarUrl = user.avatar
          }

          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: avatarUrl,
            role: user.role,
            status: user.status,
            provider: user.provider,
            isAdmin: isAdmin,
            adminRole: adminRole?.role || null,
            restrictedActions: restrictedActions,
            restrictedUntil: user.restrictedUntil,
          }

          console.log('✅ [AUTH] authorize 완료, 반환값:', { ...result, image: result.image ? 'URL' : null })
          return result

        } catch (error) {
          // 에러 로깅
          logAuthError('authorize', error, {
            email: credentials?.email,
            hasPassword: !!credentials?.password
          })

          // NextAuth는 Error의 message를 사용
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1일 (브라우저를 닫으면 로그아웃)
    updateAge: 0, // 세션 갱신 비활성화
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: undefined, // 브라우저 세션 쿠키 (브라우저 닫으면 삭제)
      },
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/sign-in", // 에러 페이지도 로그인으로
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        // 초기 로그인 시
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          // image는 JWT에 저장하지 않음 (세션에서 DB 조회)
          token.role = user.role
          token.status = user.status
          token.provider = user.provider
          token.isAdmin = user.isAdmin
          token.adminRole = user.adminRole
          token.restrictedActions = user.restrictedActions || []
          token.restrictedUntil = user.restrictedUntil

          console.log('🔑 [AUTH] JWT 생성:', {
            email: token.email,
            isAdmin: token.isAdmin,
            adminRole: token.adminRole
          })
        }

        // 세션 업데이트 시 (update 호출 시)
        if (trigger === "update" && session) {
          token.name = session.name || token.name
          // image는 JWT에 저장하지 않음
        }

        return token
      } catch (error) {
        logAuthError('jwt callback', error, {
          userId: user?.id || token?.id,
          trigger
        })

        // JWT 생성 실패 시에도 기존 token 반환 (세션 유지)
        return token
      }
    },
    async session({ session, token }) {
      try {
        // JWT 토큰 검증
        if (!token || !token.id) {
          console.log('❌ [AUTH] 유효하지 않은 토큰')
          throw new Error(AUTH_ERRORS.INVALID_SESSION.message)
        }

        // 기본 사용자 정보 (토큰에서 최소한만)
        session.user = {
          id: token.id || '',
          email: token.email || '',
          name: token.name || '',
          image: null, // DB에서 조회
          isAdmin: false,
          adminRole: null,
        }

        // DB에서 사용자 정보 및 관리자 권한 조회
        try {
          const [adminRole, user] = await Promise.all([
            prisma.adminRole.findUnique({
              where: { userId: token.id },
              select: { role: true, expiresAt: true }
            }),
            prisma.user.findUnique({
              where: { id: token.id },
              select: {
                status: true,
                avatar: true,
                role: true,
                provider: true,
                restrictedActions: true,
                restrictedUntil: true,
              }
            })
          ])

          // 관리자 권한 설정
          const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())
          if (isAdmin) {
            session.user.isAdmin = true
            session.user.adminRole = adminRole.role
          }

          // 사용자 정보 설정
          if (user) {
            // avatar가 base64 데이터인 경우 null로 설정 (URL만 허용)
            const avatar = user.avatar
            if (avatar && !avatar.startsWith('data:')) {
              session.user.image = avatar
            }

            session.user.status = user.status
            session.user.role = user.role
            session.user.provider = user.provider
            session.user.restrictedActions = user.restrictedActions || []
            session.user.restrictedUntil = user.restrictedUntil

            // 계정 상태 확인
            if (user.status === 'DELETED') {
              throw new Error(AUTH_ERRORS.ACCOUNT_DELETED.message)
            }
            if (user.status === 'SUSPENDED') {
              throw new Error(AUTH_ERRORS.ACCOUNT_SUSPENDED.message)
            }
          }

          console.log('📝 [AUTH] Session created:', {
            email: session.user.email,
            isAdmin: session.user.isAdmin,
          })
        } catch (dbError) {
          if (dbError.message === AUTH_ERRORS.ACCOUNT_DELETED.message ||
              dbError.message === AUTH_ERRORS.ACCOUNT_SUSPENDED.message) {
            throw dbError
          }
          logAuthError('session - DB 조회', dbError, { userId: token.id })
        }

        return session
      } catch (error) {
        logAuthError('session callback', error, {
          userId: token?.id,
          email: token?.email
        })

        // 세션 생성 실패 시 null 반환 (로그아웃 처리)
        throw error
      }
    },
    async signIn({ user: _user, account, profile: _profile }) {
      // OAuth 로그인 시 처리
      if (account?.provider === "google" || account?.provider === "github") {
        // OAuth 사용자 처리 로직 (추후 구현)
        return true
      }

      // Credentials 로그인은 authorize에서 처리
      return true
    },
    async redirect({ url, baseUrl, token }) {
      console.log('🔄 [AUTH] redirect 콜백:', { url, baseUrl, hasToken: !!token })

      // 로그인 성공 시 - 관리자 권한 확인 (최우선)
      if (token?.id) {
        console.log('👤 [AUTH] 사용자 ID:', token.id)

        try {
          // AdminRole 테이블에서 관리자 권한 확인
          const adminRole = await prisma.adminRole.findUnique({
            where: { userId: token.id },
            select: {
              role: true,
              expiresAt: true,
            }
          })

          // 관리자 역할 확인 및 만료 체크
          const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())

          if (isAdmin) {
            console.log('🔐 [AUTH] 관리자 확인됨, /admin으로 리다이렉트')
            return baseUrl + "/admin"
          } else {
            console.log('👤 [AUTH] 일반 사용자, /dashboard로 리다이렉트')
            return baseUrl + "/dashboard"
          }
        } catch (error) {
          console.error('❌ [AUTH] 관리자 권한 확인 오류:', error)
          // 에러 시 기본 대시보드로
          return baseUrl + "/dashboard"
        }
      }

      // token이 없는 경우 (로그아웃 등)
      // 상대 경로면 baseUrl과 합침
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 같은 origin이면 그대로 사용
      else if (new URL(url).origin === baseUrl) return url

      // 기본 리다이렉트는 대시보드로
      return baseUrl + "/dashboard"
    }
  },
  events: {
    async signOut({ token }) {
      // 로그아웃 시 처리 (필요시)
      console.log(`User ${token?.email} signed out`)
    }
  },
  debug: process.env.NODE_ENV === "development",
}

// NextAuth v4 export
export { authConfig as authOptions }

// NextAuth v4에서는 auth, signIn, signOut을 직접 export하지 않음
// 대신 getServerSession, signIn (from next-auth/react) 사용

