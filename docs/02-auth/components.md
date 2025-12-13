# 🧩 인증 컴포넌트

## 개요

인증 관련 화면에서 사용되는 공통 컴포넌트를 설명합니다.

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| 인증 레이아웃 | `(auth)/layout.jsx` | 인증 페이지 공통 레이아웃 |
| Providers | `Providers.js` | 전역 Provider 래퍼 |
| SessionProvider | `session-provider.jsx` | NextAuth 세션 제공 |

---

## 인증 레이아웃

### 경로

`src/app/(auth)/layout.jsx`

### 설명

로그인/회원가입 페이지에 적용되는 공통 레이아웃입니다. 일반 앱 레이아웃과 달리 사이드바/헤더 없이 중앙 정렬된 폼 형태입니다.

### 구조

```jsx
export default function AuthLayout({ children }) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authContainer}>
        {children}
      </div>
    </div>
  )
}
```

### 특징

- 전체 화면 중앙 정렬
- 반응형 카드 레이아웃
- 배경 그라데이션 효과

---

## Providers

### 경로

`src/components/Providers.js`

### 설명

애플리케이션 전체에 필요한 Provider들을 래핑합니다.

### 포함된 Provider

| Provider | 용도 |
|----------|------|
| `SessionProvider` | NextAuth 세션 관리 |
| `QueryClientProvider` | TanStack Query 캐시 |
| `SocketProvider` | Socket.IO 연결 |
| `SettingsProvider` | 사용자 설정 |

### 구조

```jsx
export function Providers({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </SocketProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

---

## SessionProvider

### 경로

`src/lib/session-provider.jsx`

### 설명

NextAuth의 `SessionProvider`를 클라이언트 컴포넌트로 래핑합니다.

### 사용 예시

```jsx
'use client'

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}
```

---

## 폼 입력 컴포넌트

### 이메일 입력

```jsx
<div className={styles.inputGroup}>
  <label htmlFor="email">이메일</label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="example@email.com"
    className={formErrors.email ? styles.error : ''}
  />
  {formErrors.email && (
    <span className={styles.errorMessage}>{formErrors.email}</span>
  )}
</div>
```

### 비밀번호 입력 (토글 포함)

```jsx
<div className={styles.inputGroup}>
  <label htmlFor="password">비밀번호</label>
  <div className={styles.passwordWrapper}>
    <input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="8자 이상"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className={styles.togglePassword}
    >
      {showPassword ? '숨기기' : '보기'}
    </button>
  </div>
</div>
```

### 비밀번호 강도 표시

```jsx
{passwordStrength && (
  <div className={styles.strengthIndicator}>
    <div 
      className={`${styles.strengthBar} ${styles[passwordStrength]}`}
    />
    <span>{
      passwordStrength === 'weak' ? '약함' :
      passwordStrength === 'medium' ? '보통' : '강함'
    }</span>
  </div>
)}
```

---

## 버튼 컴포넌트

### 제출 버튼

```jsx
<button
  type="submit"
  disabled={loading}
  className={styles.submitButton}
>
  {loading ? '처리 중...' : '로그인'}
</button>
```

### 소셜 로그인 버튼

```jsx
<div className={styles.socialButtons}>
  <button
    type="button"
    onClick={() => handleSocialLogin('google')}
    disabled={loading}
    className={styles.socialButton}
  >
    <GoogleIcon />
    Google로 계속하기
  </button>
  
  <button
    type="button"
    onClick={() => handleSocialLogin('github')}
    disabled={loading}
    className={styles.socialButton}
  >
    <GitHubIcon />
    GitHub로 계속하기
  </button>
</div>
```

---

## 에러 표시 컴포넌트

### 폼 에러 (전체)

```jsx
{error && (
  <div className={styles.errorAlert}>
    <span className={styles.errorIcon}>⚠️</span>
    <span>{error}</span>
  </div>
)}
```

### 필드 에러

```jsx
{formErrors.email && (
  <span className={styles.fieldError}>
    {formErrors.email}
  </span>
)}
```

---

## 스타일 구조

### CSS 모듈

| 파일 | 용도 |
|------|------|
| `sign-in.module.css` | 로그인 페이지 스타일 |
| `sign-up.module.css` | 회원가입 페이지 스타일 |

### 공통 클래스

```css
.authLayout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(...);
}

.authContainer {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.inputGroup {
  margin-bottom: 1rem;
}

.submitButton {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.submitButton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
```

---

## 관련 문서

- [로그인 화면](./screens-sign-in.md) - 로그인 페이지
- [회원가입 화면](./screens-sign-up.md) - 회원가입 페이지
- [스타일링 가이드](../18-common/styling.md) - 스타일 컨벤션

