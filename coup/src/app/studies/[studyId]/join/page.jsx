// 스터디 가입 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy, useJoinStudy } from '@/lib/hooks/useApi';
import { handleStudyError } from '@/lib/error-handlers/study-error-handler';
import { showSuccessToast, showStudyErrorToast, showErrorToast, showWarningToast } from '@/lib/error-handlers/toast-helper';
import styles from './page.module.css';

export default function StudyJoinPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    agreeToRules: false,
    introduction: '',
    purpose: '',
    level: '',
  });

  // 실제 API 호출
  const { data: studyData, isLoading } = useStudy(studyId);
  const joinStudy = useJoinStudy();
  const study = studyData?.data;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>스터디 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 스터디 없음
  if (!study) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep === 1 && !formData.agreeToRules) {
      showWarningToast('스터디 규칙에 동의해주세요.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await joinStudy.mutateAsync({
        id: studyId,
        data: {
          introduction: formData.introduction,
          purpose: formData.purpose,
          level: formData.level,
        }
      });

      // 자동 승인 여부에 따라 다른 메시지
      if (study.autoApprove) {
        showSuccessToast('🎉 가입이 완료되었습니다!');
        router.push(`/my-studies/${studyId}`);
      } else {
        showSuccessToast('가입 신청이 완료되었습니다. 승인을 기다려주세요.');
        router.push('/studies');
      }
    } catch (error) {
      console.error('가입 신청 실패:', error);

      const { message, type } = handleStudyError(error);

      // 특정 에러 케이스 처리
      if (type === 'ALREADY_MEMBER') {
        showErrorToast(message);
        setTimeout(() => router.push(`/my-studies/${studyId}`), 2000);
      } else if (type === 'STUDY_FULL') {
        showErrorToast(message);
        setTimeout(() => router.push(`/studies/${studyId}`), 2000);
      } else if (type === 'APPLICATION_ALREADY_EXISTS') {
        showWarningToast(message);
        setTimeout(() => router.push('/studies'), 2000);
      } else {
        showStudyErrorToast(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button
          onClick={() => router.push(`/studies/${studyId}`)}
          className={styles.backButton}
        >
          ← 프리뷰로 돌아가기
        </button>
        <h1 className={styles.title}>
          {study.emoji} {study.name} 가입하기
        </h1>
      </div>

      {/* 진행 표시 */}
      <div className={styles.progress}>
        <div className={styles.progressSteps}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            1
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            2
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            3
          </div>
        </div>
        <span className={styles.progressLabel}>Step {currentStep}/3</span>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 폼 섹션 */}
        <div className={styles.formSection}>
          {/* Step 1: 규칙 확인 */}
          {currentStep === 1 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>📋 Step 1/3: 스터디 규칙 확인</h2>
              <p className={styles.stepDescription}>
                우리 스터디의 규칙을 확인해주세요
              </p>

              <div className={styles.rulesList}>
                <div className={styles.ruleItem}>
                  <span className={styles.ruleIcon}>✓</span>
                  <span className={styles.ruleText}>정기 모임에 성실히 참여합니다</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={styles.ruleIcon}>✓</span>
                  <span className={styles.ruleText}>과제 및 할일을 기한 내 완료합니다</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={styles.ruleIcon}>✓</span>
                  <span className={styles.ruleText}>멤버들과 존중하며 소통합니다</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={styles.ruleIcon}>✓</span>
                  <span className={styles.ruleText}>불참 시 최소 1일 전 공지합니다</span>
                </div>
              </div>

              <div className={styles.agreeBox}>
                <label className={styles.agreeLabel}>
                  <input
                    type="checkbox"
                    checked={formData.agreeToRules}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeToRules: e.target.checked })
                    }
                  />
                  <span>위 규칙을 모두 확인했으며 동의합니다</span>
                </label>
              </div>

              <div className={styles.warning}>
                <span>⚠️</span>
                <span>규칙을 지키지 않을 경우 강퇴될 수 있습니다</span>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => router.push(`/studies/${studyId}`)}
                  className={styles.backBtn}
                >
                  취소
                </button>
                <button
                  onClick={handleNext}
                  className={styles.nextBtn}
                  disabled={!formData.agreeToRules}
                >
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 자기소개 */}
          {currentStep === 2 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>
                👋 Step 2/3: 간단한 자기소개
              </h2>
              <p className={styles.stepDescription}>
                스터디원들에게 자신을 소개해주세요 <span className={styles.optional}>(선택)</span>
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>자기소개</label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) =>
                    setFormData({ ...formData, introduction: e.target.value })
                  }
                  className={styles.textarea}
                  rows={5}
                  maxLength={300}
                  placeholder="안녕하세요! 함께 성장하고 싶습니다!"
                />
                <span className={styles.charCount}>
                  {formData.introduction.length}/300자
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>가입 동기</label>
                <div className={styles.radioGroup}>
                  {['취업 준비', '실력 향상', '네트워킹', '자격증'].map(purpose => (
                    <label key={purpose} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="purpose"
                        value={purpose}
                        checked={formData.purpose === purpose}
                        onChange={(e) =>
                          setFormData({ ...formData, purpose: e.target.value })
                        }
                      />
                      <span className={styles.radioText}>{purpose}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>현재 실력 수준</label>
                <div className={styles.radioGroup}>
                  {['입문', '초급', '중급', '고급'].map(level => (
                    <label key={level} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={formData.level === level}
                        onChange={(e) =>
                          setFormData({ ...formData, level: e.target.value })
                        }
                      />
                      <span className={styles.radioText}>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.hint}>
                <span>💡</span>
                <span>이 정보는 그룹장이 승인 시 참고용으로 사용됩니다</span>
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={handleBack} className={styles.backBtn}>
                  ← 이전
                </button>
                <button onClick={handleNext} className={styles.nextBtn}>
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 최종 확인 */}
          {currentStep === 3 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>✅ Step 3/3: 최종 확인</h2>
              <p className={styles.stepDescription}>
                가입 신청 전 정보를 확인해주세요
              </p>

              <div className={styles.summaryBox}>
                <h3>가입 정보 요약</h3>
                <div className={styles.summaryItem}>
                  <strong>스터디:</strong> {study.name}
                </div>
                {formData.introduction && (
                  <div className={styles.summaryItem}>
                    <strong>자기소개:</strong> {formData.introduction}
                  </div>
                )}
                {formData.purpose && (
                  <div className={styles.summaryItem}>
                    <strong>가입 동기:</strong> {formData.purpose}
                  </div>
                )}
                {formData.level && (
                  <div className={styles.summaryItem}>
                    <strong>실력 수준:</strong> {formData.level}
                  </div>
                )}
              </div>

              <div className={styles.hint}>
                <span>💡</span>
                <span>
                  {study.autoApprove
                    ? '가입 후 바로 모든 기능을 이용할 수 있습니다!'
                    : '그룹장 승인 후 이용 가능합니다. (평균 1일 이내)'}
                </span>
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={handleBack} className={styles.backBtn}>
                  ← 이전
                </button>
                <button
                  onClick={handleSubmit}
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '가입 중...' : '🎉 가입하기'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 우측 사이드바 */}
        <aside className={styles.sidebar}>
          {/* 스터디 요약 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>스터디 요약</h3>
            <div className={styles.studyInfo}>
              <span className={styles.studyEmoji}>{study.emoji}</span>
              <p className={styles.studyName}>{study.name}</p>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>멤버</span>
              <span className={styles.infoValue}>
                {study.currentMembers}/{study.maxMembers}명
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>카테고리</span>
              <span className={styles.infoValue}>{study.category}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>승인 방식</span>
              <span className={`${styles.badge} ${styles.auto}`}>
                {study.autoApprove ? '자동 승인' : '수동 승인'}
              </span>
            </div>
            {study.rating && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>평점</span>
                <span className={styles.infoValue}>⭐ {study.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 가입 혜택 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>✨ 가입 혜택</h3>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>💬</span>
                <span>실시간 채팅</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📁</span>
                <span>파일 공유</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📅</span>
                <span>일정 관리</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✅</span>
                <span>할일 관리</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📹</span>
                <span>화상 스터디</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
