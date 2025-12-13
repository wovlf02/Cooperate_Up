'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn, useSession } from 'next-auth/react'
import styles from '@/styles/auth/sign-up.module.css'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // 이미 로그인된 사용자는 대시보드로 리다이렉션
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(null) // 'weak' | 'medium' | 'strong'
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const calculatePasswordStrength = (pwd) => {
    if (pwd.length < 8) return 'weak'
    
    let strength = 0
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    
    if (strength >= 3 && pwd.length >= 12) return 'strong'
    if (strength >= 2 && pwd.length >= 8) return 'medium'
    return 'weak'
  }

  const handlePasswordChange = (pwd) => {
    setPassword(pwd)
    if (pwd) {
      setPasswordStrength(calculatePasswordStrength(pwd))
    } else {
      setPasswordStrength(null)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setFormErrors({ ...formErrors, avatar: '이미지 파일만 업로드 가능합니다' })
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ ...formErrors, avatar: '파일 크기는 5MB 이하여야 합니다' })
      return
    }

    setAvatar(file)
    setFormErrors({ ...formErrors, avatar: null })

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!name || name.trim().length < 2) {
      errors.name = '이름은 2자 이상이어야 합니다'
    }

    if (!email) {
      errors.email = '이메일을 입력해주세요'
    } else if (!validateEmail(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다'
    }
    
    if (!password) {
      errors.password = '비밀번호를 입력해주세요'
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다'
    } else {
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[^a-zA-Z0-9]/.test(password)
      const validTypes = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
      
      if (validTypes < 2) {
        errors.password = '영문, 숫자, 특수문자 중 2가지 이상 포함해야 합니다'
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handlers
  const handleCredentialsSignup = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)

      let avatarUrl = null

      // 프로필 사진 업로드 (선택사항)
      if (avatar) {
        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', avatar)
        formData.append('type', 'avatar')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.url
        }
        setUploadingAvatar(false)
      }

      // 회원가입 API 호출
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          avatar: avatarUrl
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      // 회원가입 성공 후 자동 로그인 (NextAuth signIn 사용)
      if (data.success) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('회원가입은 성공했으나 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.')
          setLoading(false)
          return
        }

        if (result?.ok) {
          // 대시보드로 이동
          router.push(callbackUrl)
          router.refresh()
        }
      }

    } catch (err) {
      console.error('회원가입 실패:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = 
    name &&
    email &&
    password && 
    confirmPassword &&
    name.trim().length >= 2 &&
    validateEmail(email) &&
    password.length >= 8 && 
    password === confirmPassword

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

        <h1 className={styles.title}>새로운 여정을 시작하세요</h1>

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 이메일/비밀번호 회원가입 폼 */}
        <form className={styles.form} onSubmit={handleCredentialsSignup}>
          {/* 프로필 사진 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              프로필 사진 (선택)
            </label>
            <div className={styles.avatarUploadContainer}>
              <div className={styles.avatarPreview}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="프로필 미리보기" className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span>📷</span>
                  </div>
                )}
              </div>
              <div className={styles.avatarUploadInfo}>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  className={styles.fileInput}
                />
                <label htmlFor="avatar" className={styles.fileInputLabel}>
                  사진 선택
                </label>
                <p className={styles.fileInputHint}>JPG, PNG (최대 5MB)</p>
              </div>
            </div>
            {formErrors.avatar && (
              <div className={styles.formError}>{formErrors.avatar}</div>
            )}
          </div>

          {/* 이름 */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              이름 *
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.formInput} ${formErrors.name ? styles.error : ''}`}
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            {formErrors.name && (
              <div className={styles.formError}>{formErrors.name}</div>
            )}
          </div>

          {/* 이메일 */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              이메일 *
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${formErrors.email ? styles.error : ''}`}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={loading}
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
            {passwordStrength && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div className={`${styles.strengthFill} ${styles[passwordStrength]}`}></div>
                </div>
                <div className={`${styles.strengthLabel} ${styles[passwordStrength]}`}>
                  비밀번호 강도: {
                    passwordStrength === 'weak' ? '약함' :
                    passwordStrength === 'medium' ? '보통' : '강함'
                  }
                </div>
              </div>
            )}
            {formErrors.password && (
              <div className={styles.formError}>{formErrors.password}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              비밀번호 확인
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`${styles.formInput} ${formErrors.confirmPassword ? styles.error : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirmPassword ? (
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
            {formErrors.confirmPassword && (
              <div className={styles.formError}>{formErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <div className={styles.loadingButton}>
                <div className={styles.spinner}></div>
                <span>회원가입 중...</span>
              </div>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className={styles.termsText}>
          회원가입 시 <Link href="/terms">이용약관</Link> 및{' '}
          <Link href="/privacy">개인정보처리방침</Link>에
          동의하는 것으로 간주됩니다.
        </div>

        <div className={styles.signinLink}>
          이미 계정이 있으신가요? <Link href="/sign-in">로그인</Link>
        </div>
      </div>
    </div>
  )
}
