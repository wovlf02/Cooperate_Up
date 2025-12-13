import LandingHeader from '@/components/landing/LandingHeader'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'CoUp - 함께, 더 높이',
  description: '당신의 성장을 위한 스터디 허브. 스터디원을 찾고, 함께 목표를 달성하세요.',
  keywords: '스터디, 스터디 그룹, 온라인 스터디, 학습, 성장, 목표 달성',
}

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
