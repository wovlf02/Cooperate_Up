'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import styles from '@/styles/auth/sign-in.module.css'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // 중복 실행 방지
  const isValidatingRef = useRef(false)
  const hasValidatedRef = useRef(false)

  // 이미 로그인된 사용자는 세션 검증 후 리다이렉션
  useEffect(() => {
    // 이미 검증했거나 검증 중이면 스킵
    if (hasValidatedRef.current || isValidatingRef.current) {
      return
    }

    if (status === 'authenticated' && session?.user?.id) {
      isValidatingRef.current = true

      console.log('🔍 이미 로그인된 사용자, 세션 검증 중:', session.user.id)

      api.get('/api/auth/validate-session')
        .then(async data => {
          hasValidatedRef.current = true

          if (data.valid) {
            // 세션 유효 - 관리자 권한 확인 후 리다이렉트
            console.log('✅ Valid session, 관리자 권한 확인 중...')

            try {
              const userData = await api.get('/api/auth/me')
              console.log('👤 사용자 정보:', userData)

              if (userData.adminRole && !userData.adminRole.isExpired) {
                console.log('🔐 관리자 확인, /admin으로 이동')
                router.push('/admin')
              } else {
                console.log('👤 일반 사용자, /dashboard로 이동')
                router.push('/dashboard')
              }
            } catch (err) {
              console.error('❌ 관리자 권한 확인 오류:', err)
              router.push('/dashboard')
            }
          } else if (data.shouldLogout) {
            // 세션 무효 - NextAuth로 완전히 로그아웃
            console.warn('⚠️ Invalid session detected:', data.error)
            console.log('🔄 Signing out completely...')

            // React Query 캐시 전체 초기화
            queryClient.clear()

            // NextAuth signOut으로 세션 완전 제거
            await signOut({
              redirect: false // 리다이렉트 방지
            })

            // 로컬 스토리지도 정리
            localStorage.clear()
            sessionStorage.clear()

            console.log('✅ Session cleared. Page will remain on sign-in.')
          }
        })
        .catch(err => {
          console.error('❌ Session validation error:', err)
          hasValidatedRef.current = true
        })
        .finally(() => {
          isValidatingRef.current = false
        })
    }
  }, [status, session?.user?.id, router, queryClient])

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(null) // 'credentials' | 'google' | 'github' | null
  const errorParam = searchParams.get('error')
  const [error, setError] = useState(
    errorParam === 'account-deleted' ? '삭제된 계정입니다.' :
    errorParam === 'account-suspended' ? '정지된 계정입니다.' :
    errorParam === 'CredentialsSignin' ? '이메일 또는 비밀번호가 일치하지 않습니다.' :
    null
  )
  const [formErrors, setFormErrors] = useState({})

  // Validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!email) {
      errors.email = '이메일을 입력해주세요'
    } else if (!validateEmail(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다'
    }
    
    if (!password) {
      errors.password = '비밀번호를 입력해주세요'
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handlers
  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading('credentials')
      setError(null)

      console.log('🔐 로그인 시도:', email)

      // NextAuth signIn 사용 - redirect: false로 설정하여 수동 리다이렉션
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,  // 수동 리다이렉션
      })

      if (result?.error) {
        console.error('❌ 로그인 실패:', result.error)
        setError(result.error)
        setLoading(null)
        return
      }

      if (result?.ok) {
        console.log('✅ 로그인 성공, 세션 정보 확인 중...')

        // 세션 정보 가져오기
        const sessionData = await api.get('/api/auth/session')

        console.log('📋 세션 데이터:', sessionData)

        if (sessionData?.user) {
          // 관리자 권한 확인을 위한 API 호출
          try {
            const userData = await api.get('/api/auth/me')
            console.log('👤 사용자 정보:', userData)

            // AdminRole이 있으면 관리자
            if (userData.adminRole) {
              console.log('🔐 관리자 확인, /admin으로 이동')
              router.push('/admin')
            } else {
              console.log('👤 일반 사용자, /dashboard로 이동')
              router.push('/dashboard')
            }
          } catch (err) {
            console.error('❌ 사용자 정보 조회 오류:', err)
            router.push('/dashboard')
          }
        } else {
          console.log('⚠️ 세션 정보 없음, /dashboard로 이동')
          router.push('/dashboard')
        }

        router.refresh()
      }

    } catch (err) {
      console.error('로그인 실패:', err)
      setError('로그인 중 오류가 발생했습니다.')
      setLoading(null)
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(provider)
      setError(null)

      // TODO: OAuth 로그인 (나중에 설정)
      // await signIn(provider, { callbackUrl })

      setError(`${provider} 로그인은 아직 지원하지 않습니다.`)
      setLoading(null)

    } catch (err) {
      console.error('로그인 실패:', err)
      setError('로그인에 실패했습니다. 다시 시도해 주세요.')
      setLoading(null)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = email && password && validateEmail(email) && password.length >= 8

  // 세션 초기화 함수
  const handleClearSession = () => {
    console.log('🧹 Manually clearing session...')

    // 쿠키 삭제
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim()
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })

    // 스토리지 삭제
    localStorage.clear()
    sessionStorage.clear()

    console.log('✅ Session cleared! Reloading...')

    // 페이지 새로고침
    window.location.reload()
  }

  // 로딩 중이면 표시하지 않음
  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton} 
        onClick={handleBack}
        aria-label="뒤로가기"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <Image
            src="/mainlogo.png"
            alt="CoUp"
            width={140}
            height={46}
            className={styles.logoImage}
            priority
          />
        </div>

        <h1 className={styles.title}>로그인하고 시작하기</h1>

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 이메일/비밀번호 로그인 폼 */}
        <form className={styles.form} onSubmit={handleCredentialsLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${formErrors.email ? styles.error : ''}`}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading !== null}
            />
            {formErrors.email && (
              <div className={styles.formError}>{formErrors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              비밀번호
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.formInput} ${formErrors.password ? styles.error : ''}`}
                placeholder="8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading !== null}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && (
              <div className={styles.formError}>{formErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading !== null || !isFormValid}
          >
            {loading === 'credentials' ? (
              <div className={styles.loadingButton}>
                <div className={styles.spinner}></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* 구분선 */}
        <div className={styles.divider}>또는</div>

        {/* 소셜 로그인 버튼 */}
        <div className={styles.socialButtons}>
          <button
            className={`${styles.socialButton} ${styles.googleButton}`}
            onClick={() => handleSocialLogin('google')}
            disabled={loading !== null}
          >
            {loading === 'google' ? (
              <div className={styles.loadingButton}>
                <div className={styles.spinner}></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google로 계속하기</span>
              </>
            )}
          </button>

          <button
            className={`${styles.socialButton} ${styles.githubButton}`}
            onClick={() => handleSocialLogin('github')}
            disabled={loading !== null}
          >
            {loading === 'github' ? (
              <div className={styles.loadingButton}>
                <div className={styles.spinner}></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span>GitHub로 계속하기</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.signupLink}>
          아직 계정이 없으신가요? <Link href="/sign-up">회원가입</Link>
        </div>

        {/* 문제 해결 버튼 (에러 발생 시에만 표시) */}
        {(error || errorParam) && (
          <div className={styles.troubleshootSection}>
            <button
              type="button"
              onClick={handleClearSession}
              className={styles.clearSessionButton}
            >
              🧹 세션 초기화 (문제 해결)
            </button>
            <p className={styles.troubleshootHint}>
              로그인에 계속 문제가 있다면 위 버튼을 클릭하세요
            </p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/terms">이용약관</Link>
            <span>|</span>
            <Link href="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
