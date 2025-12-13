// 내 스터디 멤버 관리 페이지
'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useStudy, 
  useStudyMembers, 
  useJoinRequests, 
  useChangeMemberRole, 
  useKickMember, 
  useApproveJoinRequest, 
  useRejectJoinRequest 
} from '@/lib/hooks/useApi';
import { handleStudyError } from '@/lib/error-handlers/study-error-handler';
import { showSuccessToast, showStudyErrorToast, showErrorToast, showWarningToast } from '@/lib/error-handlers/toast-helper';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';
import {
  MemberList,
  MemberFilter,
  MemberStatsSidebar,
  JoinRequestList,
  ConfirmModal
} from '@/components/study/members';
import styles from './page.module.css';

export default function MyStudyMembersPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  
  // 상태 관리
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'kick' | 'reject'
  const [actionReason, setActionReason] = useState('');

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useStudyMembers(studyId);
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useJoinRequests(studyId);
  
  const changeMemberRole = useChangeMemberRole();
  const kickMember = useKickMember();
  const approveJoinRequest = useApproveJoinRequest();
  const rejectJoinRequest = useRejectJoinRequest();

  // 데이터 추출
  const study = studyData?.data;
  const members = membersData?.members || [];
  const joinRequests = requestsData?.requests || [];

  // 권한 체크
  const isOwner = study?.myRole === 'OWNER';
  const isAdmin = study?.myRole === 'ADMIN';

  // 멤버 통계
  const memberStats = {
    total: members.length,
    owner: members.filter(m => m.role === 'OWNER').length,
    admin: members.filter(m => m.role === 'ADMIN').length,
    member: members.filter(m => m.role === 'MEMBER').length,
  };

  // 대기 중인 가입 신청
  const pendingRequests = joinRequests.filter(r => r.status === 'PENDING');

  // 멤버 필터링
  const getFilteredMembers = useCallback(() => {
    let filtered = members;

    // 역할 필터
    if (activeFilter !== '전체') {
      filtered = filtered.filter(m => m.role === activeFilter);
    }

    // 검색 필터
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(m =>
        m.user?.name?.toLowerCase().includes(keyword) ||
        m.user?.email?.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [members, activeFilter, searchKeyword]);

  const filteredMembers = getFilteredMembers();

  // 역할 변경 (OWNER만 가능)
  const handleChangeRole = useCallback(async (member, newRole) => {
    if (!isOwner) {
      showErrorToast('오너만 역할을 변경할 수 있습니다.');
      return;
    }

    const confirmMessage = newRole === 'ADMIN'
      ? `${member.user?.name}님을 관리자로 승격하시겠습니까?`
      : `${member.user?.name}님을 일반 멤버로 강등하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    try {
      await changeMemberRole.mutateAsync({
        studyId,
        memberId: member.userId,
        role: newRole
      });
      showSuccessToast('역할이 변경되었습니다.');
      await refetchMembers();
    } catch (error) {
      console.error('역할 변경 실패:', error);
      const { type } = handleStudyError(error);

      if (type === 'OWNER_PERMISSION_REQUIRED') {
        showErrorToast('이 작업은 스터디장만 수행할 수 있습니다.');
      } else if (type === 'CANNOT_MODIFY_SELF_ROLE') {
        showErrorToast('본인의 역할은 변경할 수 없습니다.');
      } else if (type === 'ONLY_ONE_OWNER_ALLOWED') {
        showErrorToast('스터디장은 1명만 지정할 수 있습니다.');
      } else {
        showStudyErrorToast(error);
      }
    }
  }, [isOwner, studyId, changeMemberRole, refetchMembers]);

  // 멤버 강퇴 모달 열기
  const handleKickMember = useCallback((member) => {
    if (member.role === 'OWNER') {
      showErrorToast('오너는 강퇴할 수 없습니다.');
      return;
    }

    if (member.role === 'ADMIN' && !isOwner) {
      showErrorToast('관리자는 오너만 강퇴할 수 있습니다.');
      return;
    }

    setSelectedMember(member);
    setModalAction('kick');
    setActionReason('');
    setShowConfirmModal(true);
  }, [isOwner]);

  // 가입 신청 승인
  const handleApproveRequest = useCallback(async (request) => {
    if (!confirm(`${request.user?.name}님의 가입 신청을 승인하시겠습니까?`)) return;

    try {
      await approveJoinRequest.mutateAsync({
        studyId,
        requestId: request.id
      });
      showSuccessToast('가입 신청이 승인되었습니다.');
      await Promise.all([refetchRequests(), refetchMembers()]);
    } catch (error) {
      console.error('가입 신청 승인 실패:', error);
      const { type } = handleStudyError(error);

      if (type === 'STUDY_FULL') {
        showErrorToast('스터디 정원이 가득 찼습니다.');
      } else if (type === 'APPLICATION_NOT_FOUND') {
        showErrorToast('가입 신청을 찾을 수 없습니다.');
      } else if (type === 'APPLICATION_ALREADY_PROCESSED') {
        showWarningToast('이미 처리된 가입 신청입니다.');
        await Promise.all([refetchRequests(), refetchMembers()]);
      } else {
        showStudyErrorToast(error);
      }
    }
  }, [studyId, approveJoinRequest, refetchRequests, refetchMembers]);

  // 가입 신청 거절 모달 열기
  const handleRejectRequest = useCallback((request) => {
    setSelectedMember(request);
    setModalAction('reject');
    setActionReason('');
    setShowConfirmModal(true);
  }, []);

  // 모달 확인 핸들러
  const handleConfirmAction = useCallback(async () => {
    if (!selectedMember) return;

    if (modalAction === 'kick') {
      try {
        await kickMember.mutateAsync({
          studyId,
          memberId: selectedMember.userId,
          reason: actionReason || undefined
        });
        showSuccessToast('멤버가 강퇴되었습니다.');
        setShowConfirmModal(false);
        setActionReason('');
        setSelectedMember(null);
        await refetchMembers();
      } catch (error) {
        console.error('멤버 강퇴 실패:', error);
        const { type } = handleStudyError(error);

        if (type === 'CANNOT_REMOVE_OWNER') {
          showErrorToast('스터디장은 제거할 수 없습니다.');
        } else if (type === 'ADMIN_PERMISSION_REQUIRED') {
          showErrorToast('이 작업은 관리자 권한이 필요합니다.');
        } else if (type === 'MEMBER_NOT_FOUND') {
          showErrorToast('멤버를 찾을 수 없습니다.');
        } else {
          showStudyErrorToast(error);
        }
      }
    } else if (modalAction === 'reject') {
      try {
        await rejectJoinRequest.mutateAsync({
          studyId,
          requestId: selectedMember.id,
          reason: actionReason || undefined
        });
        showSuccessToast('가입 신청이 거절되었습니다.');
        setShowConfirmModal(false);
        setActionReason('');
        setSelectedMember(null);
        await refetchRequests();
      } catch (error) {
        console.error('거절 실패:', error);
        showStudyErrorToast(error);
      }
    }
  }, [selectedMember, modalAction, actionReason, studyId, kickMember, rejectJoinRequest, refetchMembers, refetchRequests]);

  // 모달 취소 핸들러
  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false);
    setActionReason('');
    setSelectedMember(null);
    setModalAction(null);
  }, []);

  // 로딩 상태
  if (studyLoading || membersLoading || requestsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>멤버 정보를 불러오는 중...</div>
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
  if (!isOwner && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>멤버 관리 권한이 없습니다.</div>
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
      <StudyTabs studyId={studyId} activeTab="멤버" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 멤버 목록 섹션 */}
        <div className={styles.memberSection}>
          {/* 멤버 헤더 */}
          <div className={styles.memberHeader}>
            <h2 className={styles.memberTitle}>👥 멤버 관리</h2>
          </div>

          {/* 필터 */}
          <MemberFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchKeyword={searchKeyword}
            onSearchChange={setSearchKeyword}
            memberStats={memberStats}
          />

          {/* 멤버 목록 */}
          <MemberList
            members={filteredMembers}
            isOwner={isOwner}
            isAdmin={isAdmin}
            onChangeRole={handleChangeRole}
            onKick={handleKickMember}
          />

          {/* 가입 신청 목록 */}
          <JoinRequestList
            requests={joinRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            isProcessing={approveJoinRequest.isPending || rejectJoinRequest.isPending}
          />
        </div>

        {/* 우측 사이드바 */}
        <MemberStatsSidebar
          memberStats={memberStats}
          pendingRequestCount={pendingRequests.length}
        />
      </div>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={modalAction === 'kick' ? '멤버 강퇴' : '가입 신청 거절'}
        message={
          modalAction === 'kick'
            ? `${selectedMember?.user?.name}님을 정말 강퇴하시겠습니까?`
            : `${selectedMember?.user?.name}님의 가입 신청을 거절하시겠습니까?`
        }
        reasonLabel="사유 (선택사항)"
        reason={actionReason}
        onReasonChange={setActionReason}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelModal}
        confirmText={modalAction === 'kick' ? '강퇴' : '거절'}
        confirmVariant="danger"
        isProcessing={kickMember.isPending || rejectJoinRequest.isPending}
      />
    </div>
  );
}
