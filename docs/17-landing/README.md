# 🏠 랜딩 페이지

## 개요

서비스 소개를 위한 랜딩 페이지입니다.

**URL**: `/` (루트 경로)

---

## 페이지 구성

| 섹션 | 컴포넌트 | 설명 |
|------|----------|------|
| 헤더 | LandingHeader | 네비게이션 바 |
| 히어로 | Hero | 메인 배너 |
| 기능 | Features | 핵심 기능 소개 |
| 사용법 | HowItWorks | 사용 방법 안내 |
| 후기 | Testimonials | 사용자 후기 |
| CTA | CTASection | 가입 유도 |
| 푸터 | LandingFooter | 하단 정보 |

---

## 파일 구조

```
coup/src/
├── app/
│   └── page.js                      # 랜딩 페이지
├── components/landing/
│   ├── LandingHeader.jsx            # 헤더
│   ├── Hero.jsx                     # 히어로 섹션
│   ├── Features.jsx                 # 기능 소개
│   ├── HowItWorks.jsx               # 사용 방법
│   ├── Testimonials.jsx             # 후기
│   ├── CTASection.jsx               # CTA
│   └── LandingFooter.jsx            # 푸터
└── styles/landing/
    ├── landing-header.module.css
    ├── hero.module.css
    ├── features.module.css
    ├── how-it-works.module.css
    ├── testimonials.module.css
    ├── cta-section.module.css
    └── landing-footer.module.css
```

---

## 메타데이터

```javascript
export const metadata = {
  title: 'CoUp - 함께, 더 높이',
  description: '당신의 성장을 위한 스터디 허브. 스터디원을 찾고, 함께 목표를 달성하세요.',
  keywords: '스터디, 스터디 그룹, 온라인 스터디, 학습, 성장, 목표 달성',
}
```

---

## 페이지 레이아웃

```jsx
export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  )
}
```

---

## 관련 문서

- [컴포넌트](./components.md)
- [스타일](./styles.md)

