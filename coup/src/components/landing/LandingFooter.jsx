import Image from 'next/image'
import styles from '@/styles/landing/landing-footer.module.css'

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <Image
                src="/mainlogo.png"
                alt="CoUp"
                width={120}
                height={40}
                className={styles.logoImage}
              />
            </div>
            <p className={styles.tagline}>
              함께 성장하는 스터디 플랫폼<br />
              당신의 학습 목표를 달성하세요
            </p>
          </div>

          <div className={styles.linksSection}>
            <h3>회사</h3>
            <div className={styles.linksList}>
              <a href="#about">회사 소개</a>
              <a href="#team">팀 소개</a>
              <a href="#careers">채용</a>
              <a href="#blog">블로그</a>
            </div>
          </div>

          <div className={styles.linksSection}>
            <h3>지원</h3>
            <div className={styles.linksList}>
              <a href="#help">도움말</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">문의하기</a>
              <a href="#community">커뮤니티</a>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            © 2025 CoUp. All rights reserved.
          </div>

          <div className={styles.legalLinks}>
            <a href="#terms">이용약관</a>
            <a href="#privacy">개인정보처리방침</a>
            <a href="#contact">문의하기</a>
          </div>

          <div className={styles.socialLinks}>
            <a href="#github" className={styles.socialLink} aria-label="GitHub">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <a href="#twitter" className={styles.socialLink} aria-label="Twitter">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#email" className={styles.socialLink} aria-label="Email">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
