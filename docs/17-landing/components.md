# 🧩 랜딩 컴포넌트

## 개요

랜딩 페이지를 구성하는 컴포넌트들입니다.

**파일 위치**: `src/components/landing/`

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| LandingHeader | LandingHeader.jsx | 네비게이션 바 |
| Hero | Hero.jsx | 히어로 섹션 |
| Features | Features.jsx | 핵심 기능 |
| HowItWorks | HowItWorks.jsx | 사용 방법 |
| Testimonials | Testimonials.jsx | 사용자 후기 |
| CTASection | CTASection.jsx | 가입 유도 |
| LandingFooter | LandingFooter.jsx | 푸터 |

---

## Hero

메인 배너 섹션입니다.

```jsx
export default function Hero() {
  const router = useRouter()

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>함께, 더 높이.</h1>
        <p className={styles.subtitle}>당신의 성장을 위한 스터디 허브</p>
        <p className={styles.description}>
          스터디원을 찾고, 함께 목표를 달성하세요
        </p>

        <div className={styles.ctaButtons}>
          <button className={styles.primaryBtn} onClick={() => router.push('/sign-up')}>
            지금 시작하기
          </button>
          <button className={styles.secondaryBtn} onClick={() => router.push('/studies')}>
            스터디 둘러보기
          </button>
        </div>
      </div>
    </section>
  )
}
```

---

## Features

핵심 기능 소개 섹션입니다.

### 기능 목록

| 아이콘 | 기능 | 설명 |
|--------|------|------|
| 💬 | 실시간 채팅 | 스터디원과 즉시 소통 |
| 📹 | 화상 스터디 | 얼굴을 보며 함께 공부 |
| 📁 | 파일 공유 | 학습 자료 공유 |
| 📅 | 일정 관리 | 모임 일정 확인 |
| ✅ | 할 일 관리 | 목표 설정 및 달성 |
| 🔔 | 알림 시스템 | 실시간 알림 |

```jsx
export default function Features() {
  const features = [
    { icon: '💬', title: '실시간 채팅', description: '...' },
    { icon: '📹', title: '화상 스터디', description: '...' },
    // ...
  ]

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        <h2>CoUp의 핵심 기능</h2>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## HowItWorks

사용 방법 안내 섹션입니다.

### 단계

| 단계 | 제목 | 설명 |
|------|------|------|
| 1 | 가입하기 | 간단한 가입 절차 |
| 2 | 스터디 찾기 | 관심 분야 스터디 탐색 |
| 3 | 함께 성장 | 스터디원과 목표 달성 |

---

## Testimonials

사용자 후기 섹션입니다.

```jsx
const testimonials = [
  {
    name: '김철수',
    role: '대학생',
    content: '혼자 공부하던 때와 비교하면 학습 효율이 2배는 늘었어요!',
    avatar: '/avatars/user1.jpg'
  },
  // ...
]
```

---

## CTASection

가입 유도 섹션입니다.

```jsx
export default function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <h2>오늘부터 시작하세요</h2>
        <p>수천 명의 사용자가 이미 함께하고 있습니다</p>
        <button className={styles.ctaButton}>
          무료로 시작하기
        </button>
      </div>
    </section>
  )
}
```

---

## LandingHeader

네비게이션 바입니다.

### 메뉴

| 메뉴 | 링크 |
|------|------|
| 기능 | #features |
| 사용 방법 | #how-it-works |
| 후기 | #testimonials |
| 로그인 | /sign-in |
| 시작하기 | /sign-up |

---

## LandingFooter

푸터 섹션입니다.

### 링크 그룹

| 그룹 | 링크 |
|------|------|
| 서비스 | 기능, 가격, FAQ |
| 회사 | 소개, 블로그, 채용 |
| 법적 고지 | 이용약관, 개인정보처리방침 |
| 소셜 | 인스타그램, 트위터, 페이스북 |

---

## 스타일

### 파일 목록

| 파일 | 용도 |
|------|------|
| landing-header.module.css | 헤더 스타일 |
| hero.module.css | 히어로 섹션 |
| features.module.css | 기능 섹션 |
| how-it-works.module.css | 사용 방법 |
| testimonials.module.css | 후기 섹션 |
| cta-section.module.css | CTA 섹션 |
| landing-footer.module.css | 푸터 스타일 |

---

## 관련 문서

- [README](./README.md)
- [스타일](./styles.md)

