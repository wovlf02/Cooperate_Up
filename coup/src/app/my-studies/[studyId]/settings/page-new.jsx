// 내 스터디 설정 페이지
'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy, useUpdateStudy, useDeleteStudy, useLeaveStudy } from '@/lib/hooks/useApi';
import { handleStudyError } from '@/lib/error-handlers/study-error-handler';
import { showSuccessToast, showStudyErrorToast, showErrorToast } from '@/lib/error-handlers/toast-helper';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';
import {
  BasicSettingsForm,
  DangerZoneSettings,
  SettingsSidebar
} from '@/components/study/settings';
import styles from './page.module.css';

export default function MyStudySettingsPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [activeTab, setActiveTab] = useState('basic');

  // API Hooks
  const { data: studyData, isLoading: studyLoading, refetch: refetchStudy } = useStudy(studyId);
  const updateStudyMutation = useUpdateStudy();
  const deleteStudyMutation = useDeleteStudy();
  const leaveStudyMutation = useLeaveStudy();

  const study = studyData?.data;

  // 권한 체크
  const userRole = study?.role || study?.myRole || 'MEMBER';
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  // 설정 저장 핸들러
  const handleSave = useCallback(async (formData) => {
    if (!confirm('변경사항을 저장하시겠습니까?')) return;

    try {
      await updateStudyMutation.mutateAsync({
        id: studyId,
        data: formData
      });
      showSuccessToast('설정이 저장되었습니다.');
      await refetchStudy();
    } catch (error) {
      console.error('설정 저장 실패:', error);
      const { type } = handleStudyError(error);

      if (type === 'ADMIN_PERMISSION_REQUIRED') {
        showErrorToast('이 작업은 관리자 권한이 필요합니다.');
      } else if (type === 'VALIDATION_ERROR') {
        showErrorToast('입력 내용을 확인해주세요.');
      } else {
        showStudyErrorToast(error);
      }
    }
  }, [studyId, updateStudyMutation, refetchStudy]);

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // 스터디 탈퇴 핸들러
  const handleLeaveStudy = useCallback(async () => {
    if (!confirm('정말 스터디를 탈퇴하시겠습니까?\n\n탈퇴 후에는 다시 가입 신청을 해야 합니다.')) {
      return;
    }

    try {
      await leaveStudyMutation.mutateAsync(studyId);
      showSuccessToast('스터디를 탈퇴했습니다.');
      router.push('/my-studies');
    } catch (error) {
      console.error('탈퇴 실패:', error);
      const { type } = handleStudyError(error);

      if (type === 'OWNER_CANNOT_LEAVE') {
        showErrorToast('스터디장은 탈퇴할 수 없습니다. 먼저 다른 멤버에게 스터디장을 양도하세요.');
      } else {
        showStudyErrorToast(error);
      }
    }
  }, [studyId, leaveStudyMutation, router]);

  // 스터디 삭제 핸들러
  const handleDeleteStudy = useCallback(async () => {
    const confirmation = prompt(
      '스터디를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n\n' +
      '삭제를 진행하려면 "삭제"를 입력하세요:'
    );

    if (confirmation !== '삭제') {
      if (confirmation !== null) {
        showErrorToast('"삭제"를 정확히 입력해주세요.');
      }
      return;
    }

    try {
      await deleteStudyMutation.mutateAsync(studyId);
      showSuccessToast('스터디가 삭제되었습니다.');
      router.push('/my-studies');
    } catch (error) {
      console.error('스터디 삭제 실패:', error);
      const { type } = handleStudyError(error);

      if (type === 'OWNER_PERMISSION_REQUIRED') {
        showErrorToast('스터디 삭제는 스터디장만 할 수 있습니다.');
      } else {
        showStudyErrorToast(error);
      }
    }
  }, [studyId, deleteStudyMutation, router]);

  // 로딩 상태
  if (studyLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>설정을 불러오는 중...</div>
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

  // 권한 없음
  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>설정 권한이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
              <p className={styles.studyMeta}>
                👥 {study.currentMembers}/{study.maxMembers}명
              </p>
            </div>
          </div>
          <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
            {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} {study.myRole || 'MEMBER'}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <StudyTabs studyId={studyId} activeTab="설정" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 설정 섹션 */}
        <div className={styles.settingsSection}>
          {/* 헤더 */}
          <div className={styles.settingsHeader}>
            <h2 className={styles.settingsTitle}>⚙️ 스터디 설정</h2>
          </div>

          {/* 설정 탭 */}
          <div className={styles.settingsTabs}>
            <button
              className={`${styles.settingsTab} ${activeTab === 'basic' ? styles.active : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              📝 기본 정보
            </button>
            <button
              className={`${styles.settingsTab} ${activeTab === 'danger' ? styles.active : ''}`}
              onClick={() => setActiveTab('danger')}
            >
              ⚠️ 위험 구역
            </button>
          </div>

          {/* 기본 정보 탭 */}
          {activeTab === 'basic' && (
            <BasicSettingsForm
              study={study}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={updateStudyMutation.isPending}
            />
          )}

          {/* 위험 구역 탭 */}
          {activeTab === 'danger' && (
            <DangerZoneSettings
              isOwner={isOwner}
              onLeave={handleLeaveStudy}
              onDelete={handleDeleteStudy}
              isProcessing={leaveStudyMutation.isPending || deleteStudyMutation.isPending}
            />
          )}
        </div>

        {/* 우측 사이드바 */}
        <SettingsSidebar
          study={study}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
