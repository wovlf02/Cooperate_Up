// 내 스터디 멤버 관리 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy, useStudyMembers, useJoinRequests, useChangeMemberRole, useKickMember, useApproveJoinRequest, useRejectJoinRequest } from '@/lib/hooks/useApi';
import { handleStudyError } from '@/lib/error-handlers/study-error-handler';
import { showSuccessToast, showStudyErrorToast, showErrorToast, showWarningToast } from '@/lib/error-handlers/toast-helper';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';
import styles from './page.module.css';

export default function MyStudyMembersPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [kickReason, setKickReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [detailRequest, setDetailRequest] = useState(null); // 상세 정보 모달용

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useStudyMembers(studyId);
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useJoinRequests(studyId);
  const changeMemberRole = useChangeMemberRole();
  const kickMember = useKickMember();
  const approveJoinRequest = useApproveJoinRequest();
  const rejectJoinRequest = useRejectJoinRequest();

  const study = studyData?.data;
  // API 응답 구조에 맞게 수정: { data: [...], pagination: {...} } 또는 { members: [...] }
  const members = membersData?.data || membersData?.members || [];
  // API 응답 구조에 맞게 수정: { success: true, data: [...] } 또는 { requests: [...] }
  const joinRequests = requestsData?.data || requestsData?.requests || [];

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

  // 권한 체크
  const isOwner = study.myRole === 'OWNER';
  const isAdmin = study.myRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>멤버 관리 권한이 없습니다.</div>
      </div>
    );
  }


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
  const getFilteredMembers = () => {
    let filtered = members;

    // 역할 필터
    if (activeFilter !== '전체') {
      filtered = filtered.filter(m => m.role === activeFilter);
    }

    // 검색 필터
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(m =>
        m.user.name.toLowerCase().includes(keyword) ||
        m.user.email.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  };

  const filteredMembers = getFilteredMembers();

  // 역할 배지 렌더링
  const getRoleBadge = (role) => {
    const badges = {
      OWNER: { icon: '👑', text: 'OWNER', className: styles.owner },
      ADMIN: { icon: '⭐', text: 'ADMIN', className: styles.admin },
      MEMBER: { icon: '👤', text: 'MEMBER', className: styles.member },
    };
    const badge = badges[role] || badges.MEMBER;
    return (
      <span className={`${styles.roleBadge} ${badge.className}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  // 역할 변경 (OWNER만 가능)
  const handleChangeRole = async (member, newRole) => {
    if (!isOwner) {
      showErrorToast('오너만 역할을 변경할 수 있습니다.');
      return;
    }

    const confirmMessage = newRole === 'ADMIN'
      ? `${member.user.name}님을 관리자로 승격하시겠습니까?`
      : `${member.user.name}님을 일반 멤버로 강등하시겠습니까?`;

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
  };

  // 멤버 강퇴
  const handleKickMember = async (member) => {
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
    setShowConfirmModal(true);
  };

  const confirmKick = async () => {
    if (!selectedMember) return;

    try {
      await kickMember.mutateAsync({
        studyId,
        memberId: selectedMember.userId,
        reason: kickReason || undefined
      });
      showSuccessToast('멤버가 강퇴되었습니다.');
      setShowConfirmModal(false);
      setKickReason('');
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
  };

  // 가입 신청 승인
  const handleApproveRequest = async (request) => {
    if (!confirm(`${request.user.name}님의 가입 신청을 승인하시겠습니까?`)) return;

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
  };

  // 가입 신청 거절
  const handleRejectRequest = (request) => {
    setSelectedMember(request);
    setModalAction('reject');
    setShowConfirmModal(true);
  };

  const confirmReject = async () => {
    if (!selectedMember) return;

    try {
      await rejectJoinRequest.mutateAsync({
        studyId,
        requestId: selectedMember.id,
        reason: rejectReason || undefined
      });
      alert('가입 신청이 거절되었습니다.');
      setShowConfirmModal(false);
      setRejectReason('');
      setSelectedMember(null);
      await refetchRequests();
    } catch (error) {
      console.error('거절 실패:', error);
      alert('거절에 실패했습니다.');
    }
  };

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
            <button className={styles.inviteButton}>+ 초대</button>
          </div>

          {/* 필터 섹션 */}
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${activeFilter === '전체' ? styles.active : ''}`}
                onClick={() => setActiveFilter('전체')}
              >
                전체 {memberStats.total}
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'OWNER' ? styles.active : ''}`}
                onClick={() => setActiveFilter('OWNER')}
              >
                👑 OWNER {memberStats.owner}
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'ADMIN' ? styles.active : ''}`}
                onClick={() => setActiveFilter('ADMIN')}
              >
                ⭐ ADMIN {memberStats.admin}
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'MEMBER' ? styles.active : ''}`}
                onClick={() => setActiveFilter('MEMBER')}
              >
                👤 MEMBER {memberStats.member}
              </button>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="이름, 이메일 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>🔍</button>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className={styles.memberList}>
            {filteredMembers.length === 0 ? (
              <div className={styles.emptyState}>검색 결과가 없습니다.</div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.memberCardHeader}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>
                        {member.user.name?.charAt(0) || '?'}
                      </div>
                      <div className={styles.memberDetails}>
                        <div className={styles.memberNameRow}>
                          <h4 className={styles.memberName}>{member.user.name}</h4>
                          {getRoleBadge(member.role)}
                        </div>
                        <div className={styles.memberEmail}>{member.user.email}</div>
                        <div className={styles.memberMeta}>
                          가입: {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={styles.memberActions}>
                      {member.role !== 'OWNER' && isOwner && (
                        <>
                          {member.role === 'ADMIN' ? (
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleChangeRole(member, 'MEMBER')}
                            >
                              강등
                            </button>
                          ) : (
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleChangeRole(member, 'ADMIN')}
                            >
                              승격
                            </button>
                          )}
                        </>
                      )}
                      {member.role !== 'OWNER' && (member.role !== 'ADMIN' || isOwner) && (
                        <button
                          className={styles.kickBtn}
                          onClick={() => handleKickMember(member)}
                        >
                          강퇴
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 가입 신청 섹션 */}
          {pendingRequests.length > 0 && (
            <div className={styles.requestSection}>
              <h3 className={styles.requestTitle}>
                🔔 가입 신청 ({pendingRequests.length})
              </h3>
              <div className={styles.requestList}>
                {pendingRequests.map((request) => (
                  <div key={request.id} className={styles.requestCard}>
                    <div className={styles.requestInfo}>
                      <div className={styles.requestAvatar}>
                        {request.user.name?.charAt(0) || '?'}
                      </div>
                      <div className={styles.requestDetails}>
                        <h4 className={styles.requestName}>{request.user.name}</h4>
                        <div className={styles.requestEmail}>{request.user.email}</div>
                        <div className={styles.requestDate}>
                          신청일: {request.joinedAt ? new Date(request.joinedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </div>
                        {request.introduction && (
                          <div className={styles.requestMessage}>
                            💬 {request.introduction.length > 50
                              ? request.introduction.slice(0, 50) + '...'
                              : request.introduction}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.requestActions}>
                      <button
                        className={styles.detailBtn}
                        onClick={() => setDetailRequest(request)}
                      >
                        📋 상세
                      </button>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApproveRequest(request)}
                      >
                        ✅ 승인
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleRejectRequest(request)}
                      >
                        ❌ 거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 멤버 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 멤버 현황</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>총 멤버:</span>
                <span className={styles.statValue}>{memberStats.total}명</span>
              </div>
              <div className={styles.statRow}>
                <span>• 👑 OWNER:</span>
                <span>{memberStats.owner}명</span>
              </div>
              <div className={styles.statRow}>
                <span>• ⭐ ADMIN:</span>
                <span>{memberStats.admin}명</span>
              </div>
              <div className={styles.statRow}>
                <span>• 👤 MEMBER:</span>
                <span>{memberStats.member}명</span>
              </div>
            </div>
          </div>

          {/* 가입 신청 */}
          {pendingRequests.length > 0 && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>💬 가입 신청</h3>
              <div className={styles.widgetContent}>
                <div className={styles.statRow}>
                  <span>대기 중:</span>
                  <span className={styles.statValue}>{pendingRequests.length}건</span>
                </div>
                <button className={styles.widgetButton}>신청 관리 →</button>
              </div>
            </div>
          )}

          {/* 권한 안내 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>ℹ️ 권한 안내</h3>
            <div className={styles.widgetContent}>
              <div className={styles.permissionInfo}>
                <div className={styles.permissionItem}>
                  <strong>👑 OWNER</strong>
                  <ul>
                    <li>모든 권한</li>
                    <li>역할 변경</li>
                    <li>멤버 강퇴</li>
                  </ul>
                </div>
                <div className={styles.permissionItem}>
                  <strong>⭐ ADMIN</strong>
                  <ul>
                    <li>MEMBER 강퇴</li>
                    <li>가입 승인</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {modalAction === 'kick' ? '멤버 강퇴' : '가입 신청 거절'}
            </h3>
            <p className={styles.modalMessage}>
              {modalAction === 'kick'
                ? `${selectedMember?.user?.name}님을 정말 강퇴하시겠습니까?`
                : `${selectedMember?.user?.name}님의 가입 신청을 거절하시겠습니까?`}
            </p>
            <div className={styles.modalInput}>
              <label>사유 (선택사항)</label>
              <textarea
                value={modalAction === 'kick' ? kickReason : rejectReason}
                onChange={(e) => modalAction === 'kick'
                  ? setKickReason(e.target.value)
                  : setRejectReason(e.target.value)}
                placeholder="사유를 입력하세요..."
                rows={3}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowConfirmModal(false);
                  setKickReason('');
                  setRejectReason('');
                  setSelectedMember(null);
                }}
              >
                취소
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={modalAction === 'kick' ? confirmKick : confirmReject}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가입 신청 상세 정보 모달 */}
      {detailRequest && (
        <div className={styles.detailModalOverlay} onClick={() => setDetailRequest(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailModalHeader}>
              <h3 className={styles.detailModalTitle}>📋 가입 신청 상세 정보</h3>
              <button
                className={styles.detailModalClose}
                onClick={() => setDetailRequest(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.detailModalContent}>
              {/* 신청자 프로필 */}
              <div className={styles.detailProfile}>
                <div className={styles.detailAvatar}>
                  {detailRequest.user.avatar ? (
                    <img src={detailRequest.user.avatar} alt="avatar" />
                  ) : (
                    <span>{detailRequest.user.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className={styles.detailProfileInfo}>
                  <h4 className={styles.detailName}>{detailRequest.user.name}</h4>
                  <p className={styles.detailEmail}>{detailRequest.user.email}</p>
                </div>
              </div>

              {/* 신청 정보 */}
              <div className={styles.detailSection}>
                <h5 className={styles.detailSectionTitle}>📅 신청 정보</h5>
                <div className={styles.detailInfoGrid}>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>신청일</span>
                    <span className={styles.detailInfoValue}>
                      {detailRequest.joinedAt ? (
                        <>
                          <span className={styles.dateRow}>
                            {new Date(detailRequest.joinedAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long'
                            })}
                          </span>
                          <span className={styles.timeRow}>
                            {new Date(detailRequest.joinedAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </>
                      ) : '-'}
                    </span>
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>상태</span>
                    <span className={`${styles.detailInfoValue} ${styles.pendingStatus}`}>
                      ⏳ 승인 대기중
                    </span>
                  </div>
                </div>
              </div>

              {/* 자기소개 (유저 bio) */}
              {detailRequest.user.bio && (
                <div className={styles.detailSection}>
                  <h5 className={styles.detailSectionTitle}>👤 자기소개</h5>
                  <div className={styles.detailIntroduction}>
                    {detailRequest.user.bio}
                  </div>
                </div>
              )}

              {/* 가입 시 작성한 소개 */}
              {detailRequest.introduction && (
                <div className={styles.detailSection}>
                  <h5 className={styles.detailSectionTitle}>💬 가입 신청 메시지</h5>
                  <div className={styles.detailIntroduction}>
                    {detailRequest.introduction}
                  </div>
                </div>
              )}

              {/* 가입 동기 */}
              {detailRequest.motivation && (
                <div className={styles.detailSection}>
                  <h5 className={styles.detailSectionTitle}>🎯 가입 동기</h5>
                  <div className={styles.detailMotivation}>
                    {detailRequest.motivation}
                  </div>
                </div>
              )}

              {/* 실력/수준 */}
              {detailRequest.level && (
                <div className={styles.detailSection}>
                  <h5 className={styles.detailSectionTitle}>📊 실력/수준</h5>
                  <div className={styles.detailLevel}>
                    <span className={styles.levelBadge}>{detailRequest.level}</span>
                  </div>
                </div>
              )}

              {/* 참여 중인 스터디 */}
              <div className={styles.detailSection}>
                <h5 className={styles.detailSectionTitle}>📚 참여 중인 스터디</h5>
                {detailRequest.user.studyMembers && detailRequest.user.studyMembers.length > 0 ? (
                  <div className={styles.participatingStudies}>
                    {detailRequest.user.studyMembers.map((membership) => (
                      <div key={membership.study.id} className={styles.studyItem}>
                        <div className={styles.studyItemHeader}>
                          <span className={styles.studyEmoji}>{membership.study.emoji}</span>
                          <div className={styles.studyItemInfo}>
                            <span className={styles.studyItemName}>{membership.study.name}</span>
                            <span className={styles.studyItemCategory}>{membership.study.category}</span>
                          </div>
                          <span className={`${styles.studyRoleBadge} ${styles[membership.role.toLowerCase()]}`}>
                            {membership.role === 'OWNER' ? '👑' : membership.role === 'ADMIN' ? '⭐' : '👤'} {membership.role}
                          </span>
                        </div>
                        <div className={styles.studyItemMeta}>
                          가입: {new Date(membership.joinedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noStudies}>
                    <span className={styles.noStudiesIcon}>📭</span>
                    <p>아직 참여 중인 스터디가 없습니다.</p>
                    <p className={styles.noStudiesHint}>첫 스터디 가입을 시도하고 있어요!</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.detailModalFooter}>
              <button
                className={styles.detailRejectBtn}
                onClick={() => {
                  setDetailRequest(null);
                  handleRejectRequest(detailRequest);
                }}
              >
                ❌ 거절
              </button>
              <button
                className={styles.detailApproveBtn}
                onClick={() => {
                  setDetailRequest(null);
                  handleApproveRequest(detailRequest);
                }}
              >
                ✅ 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

