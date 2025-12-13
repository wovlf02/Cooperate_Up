// 내 스터디 설정 페이지
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useStudy, useUpdateStudy, useDeleteStudy, useLeaveStudy, useTransferOwnership, useStudyMembers } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

const STUDY_CATEGORIES = [
  { main: '개발', sub: ['알고리즘/코테', '웹개발', '앱개발', 'AI/ML', '데이터과학'] },
  { main: '언어', sub: ['영어', '중국어', '일본어', '기타'] },
  { main: '취업/자격증', sub: ['공무원', '자격증', '취업준비'] },
  { main: '교양/취미', sub: ['독서', '운동', '음악', '미술'] },
  { main: '학업', sub: ['수능', '편입', '대학공부'] }
];

export default function MyStudySettingsPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [activeTab, setActiveTab] = useState(null); // 역할 확인 후 설정

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // 권한 위임 모달 상태
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState('');

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading, refetch: refetchStudy } = useStudy(studyId);
  const updateStudyMutation = useUpdateStudy();
  const deleteStudyMutation = useDeleteStudy();
  const leaveStudyMutation = useLeaveStudy();
  const transferOwnershipMutation = useTransferOwnership();

  const study = studyData?.data;
  const userRole = study?.role || study?.myRole || 'MEMBER';
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  // OWNER일 때만 멤버 목록 조회 (권한 위임을 위해)
  const { data: membersData } = useStudyMembers(studyId, {}, {
    enabled: !!studyId && !!study && isOwner
  });
  const members = membersData?.data || [];

  // ADMIN 역할의 멤버들만 필터링 (권한 위임 대상)
  const adminMembers = members.filter(m => m.role === 'ADMIN');

  // 역할에 따라 기본 탭 설정
  useEffect(() => {
    if (study && activeTab === null) {
      // requestAnimationFrame으로 비동기 처리
      requestAnimationFrame(() => {
        setActiveTab(isAdmin ? 'basic' : 'mySettings');
      });
    }
  }, [study, isAdmin, activeTab]);

  // 수정 모달 열기
  const openEditModal = () => {
    setEditFormData({
      name: study?.name || '',
      category: study?.category || '',
      subCategory: study?.subCategory || '',
      description: study?.description || '',
      tags: study?.tags || [],
      isPublic: study?.isPublic !== undefined ? study.isPublic : true,
      autoApprove: study?.autoApprove || false,
      maxMembers: study?.maxMembers || 50,
      isRecruiting: study?.isRecruiting !== undefined ? study.isRecruiting : true
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData(null);
    setEditErrors({});
  };

  // 유효성 검사
  const validateForm = () => {
    if (!editFormData) return false;
    
    const newErrors = {};

    if (!editFormData.name?.trim()) {
      newErrors.name = '스터디 이름은 필수입니다.';
    } else if (editFormData.name.length < 2 || editFormData.name.length > 50) {
      newErrors.name = '스터디 이름은 2-50자 사이여야 합니다.';
    }

    if ((editFormData.description?.length || 0) < 10 || (editFormData.description?.length || 0) > 500) {
      newErrors.description = '스터디 소개는 10-500자 사이여야 합니다.';
    }

    if (editFormData.maxMembers < 2 || editFormData.maxMembers > 100) {
      newErrors.maxMembers = '최대 인원은 2-100명 사이여야 합니다.';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 변경사항 적용
  const handleApplyChanges = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateStudyMutation.mutateAsync({
        id: studyId,
        data: editFormData
      });
      
      // 성공 시 데이터 새로고침 후 모달 닫기
      await refetchStudy();
      closeEditModal();
      alert('변경사항이 적용되었습니다!');
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  // 태그 추가 (모달용)
  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!editFormData.tags.includes(newTag)) {
        setEditFormData({
          ...editFormData,
          tags: [...editFormData.tags, newTag],
        });
      }
      e.target.value = '';
    }
  };

  // 스터디 삭제
  const handleDeleteStudy = async () => {
    const confirmation = prompt('스터디를 삭제하려면 "삭제"를 입력하세요:');
    if (confirmation === '삭제') {
      try {
        await deleteStudyMutation.mutateAsync(studyId);
        alert('스터디가 삭제되었습니다.');
        router.push('/my-studies');
      } catch (error) {
        alert('스터디 삭제 실패: ' + error.message);
      }
    }
  };

  // 스터디 탈퇴
  const handleLeaveStudy = async () => {
    if (!confirm('정말 스터디를 탈퇴하시겠습니까?')) return;

    try {
      await leaveStudyMutation.mutateAsync(studyId);
      alert('스터디를 탈퇴했습니다.');
      router.push('/my-studies');
    } catch (error) {
      alert('탈퇴 실패: ' + error.message);
    }
  };

  // 권한 위임
  const handleTransferOwnership = async () => {
    if (!selectedAdminId) {
      alert('권한을 위임할 관리자를 선택해주세요.');
      return;
    }

    const selectedAdmin = adminMembers.find(m => m.userId === selectedAdminId);
    const adminName = selectedAdmin?.user?.name || selectedAdmin?.user?.email || '선택한 관리자';

    if (!confirm(`정말 ${adminName}님에게 스터디장 권한을 위임하시겠습니까?\n\n위임 후에는 관리자로 강등됩니다.`)) {
      return;
    }

    try {
      await transferOwnershipMutation.mutateAsync({ studyId, targetUserId: selectedAdminId });
      alert(`${adminName}님에게 스터디장 권한이 위임되었습니다.\n당신은 관리자로 변경되었습니다.`);
      setIsTransferModalOpen(false);
      setSelectedAdminId('');
      refetchStudy();
    } catch (error) {
      alert('권한 위임 실패: ' + (error.response?.data?.error || error.message));
    }
  };

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
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

          {/* 설정 탭 - OWNER/ADMIN은 기본 정보 탭 표시, MEMBER는 내 설정만 */}
          <div className={styles.settingsTabs}>
            {isAdmin && (
              <button
                className={`${styles.settingsTab} ${activeTab === 'basic' ? styles.active : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                기본 정보
              </button>
            )}
            <button
              className={`${styles.settingsTab} ${activeTab === 'mySettings' ? styles.active : ''}`}
              onClick={() => setActiveTab('mySettings')}
            >
              내 설정
            </button>
          </div>

          {/* 기본 정보 - OWNER/ADMIN만 표시 */}
          {activeTab === 'basic' && isAdmin && (
            <div className={styles.settingsContent}>
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>📝 기본 정보</h3>

                {/* 읽기 전용 정보 표시 */}
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>스터디 이름</label>
                  <p className={styles.infoValue}>{study.name}</p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>카테고리</label>
                  <p className={styles.infoValue}>{study.category || '미설정'}</p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>스터디 소개</label>
                  <p className={styles.infoValue}>{study.description || '소개가 없습니다.'}</p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>태그</label>
                  <div className={styles.tagContainer}>
                    {study.tags && study.tags.length > 0 ? (
                      study.tags.map((tag) => (
                        <span key={tag} className={styles.tagReadonly}>#{tag}</span>
                      ))
                    ) : (
                      <span className={styles.infoEmpty}>태그 없음</span>
                    )}
                  </div>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>공개 여부</label>
                  <p className={styles.infoValue}>
                    {study.isPublic ? '🌐 전체 공개' : '🔒 비공개'}
                  </p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>가입 승인</label>
                  <p className={styles.infoValue}>
                    {study.autoApprove ? '✅ 자동 승인' : '✋ 수동 승인'}
                  </p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>모집 상태</label>
                  <p className={`${styles.infoValue} ${study.isRecruiting ? styles.recruitingStatus : styles.closedStatus}`}>
                    {study.isRecruiting ? '🟢 모집중' : '🔴 모집마감'}
                  </p>
                </div>

                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>최대 인원</label>
                  <p className={styles.infoValue}>{study.maxMembers}명</p>
                </div>

                {/* 수정 버튼 - OWNER만 표시 */}
                {isOwner && (
                  <div className={styles.formActions}>
                    <button
                      className={styles.editButton}
                      onClick={openEditModal}
                    >
                      ✏️ 수정
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 수정 모달 */}
          {isEditModalOpen && (
            <div className={styles.modalOverlay} onClick={closeEditModal}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>📝 기본 정보 수정</h2>
                  <button className={styles.modalClose} onClick={closeEditModal}>×</button>
                </div>
                
                <div className={styles.modalContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>스터디 이름 *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={styles.input}
                      placeholder="스터디 이름을 입력하세요"
                    />
                    {editErrors.name && (
                      <span className={styles.errorText}>{editErrors.name}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>카테고리</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className={styles.select}
                    >
                      <option value="">선택하세요</option>
                      {STUDY_CATEGORIES.map((cat) => (
                        <option key={cat.main} value={cat.main}>
                          {cat.main}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>스터디 소개</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className={styles.textarea}
                      rows={4}
                      placeholder="스터디에 대해 소개해주세요"
                    />
                    <span className={styles.hint}>{editFormData.description.length}/500자</span>
                    {editErrors.description && (
                      <span className={styles.errorText}>{editErrors.description}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>태그</label>
                    <div className={styles.tagContainer}>
                      {editFormData.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          #{tag}
                          <button
                            className={styles.tagRemove}
                            onClick={() =>
                              setEditFormData({
                                ...editFormData,
                                tags: editFormData.tags.filter((t) => t !== tag),
                              })
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="+ 추가 (Enter)"
                        className={styles.tagInput}
                        onKeyDown={handleTagAdd}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>공개 여부</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          checked={editFormData.isPublic}
                          onChange={() => setEditFormData({ ...editFormData, isPublic: true })}
                        />
                        <span>전체 공개</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          checked={!editFormData.isPublic}
                          onChange={() => setEditFormData({ ...editFormData, isPublic: false })}
                        />
                        <span>비공개</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>가입 승인</label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={editFormData.autoApprove}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, autoApprove: e.target.checked })
                        }
                      />
                      <span>자동 승인</span>
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>모집 상태</label>
                    <div className={styles.recruitingToggle}>
                      <label className={`${styles.toggleLabel} ${editFormData.isRecruiting ? styles.toggleActive : ''}`}>
                        <input
                          type="radio"
                          name="isRecruiting"
                          checked={editFormData.isRecruiting}
                          onChange={() => setEditFormData({ ...editFormData, isRecruiting: true })}
                        />
                        <span>🟢 모집중</span>
                      </label>
                      <label className={`${styles.toggleLabel} ${!editFormData.isRecruiting ? styles.toggleInactive : ''}`}>
                        <input
                          type="radio"
                          name="isRecruiting"
                          checked={!editFormData.isRecruiting}
                          onChange={() => setEditFormData({ ...editFormData, isRecruiting: false })}
                        />
                        <span>🔴 모집마감</span>
                      </label>
                    </div>
                    <p className={styles.recruitingHint}>
                      모집마감으로 설정하면 새로운 멤버가 가입 신청을 할 수 없습니다.
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>최대 인원</label>
                    <input
                      type="number"
                      value={editFormData.maxMembers}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, maxMembers: parseInt(e.target.value) || 2 })
                      }
                      className={styles.input}
                      min="2"
                      max="100"
                    />
                    {editErrors.maxMembers && (
                      <span className={styles.errorText}>{editErrors.maxMembers}</span>
                    )}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.cancelButton} onClick={closeEditModal}>
                    취소
                  </button>
                  <button
                    className={styles.applyButton}
                    onClick={handleApplyChanges}
                    disabled={updateStudyMutation.isPending}
                  >
                    {updateStudyMutation.isPending ? '적용 중...' : '적용'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 내 설정 탭 - 모든 멤버 접근 가능 */}
          {activeTab === 'mySettings' && (
            <div className={styles.settingsContent}>
              {/* 내 정보 카드 */}
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>👤 내 정보</h3>
                <div className={styles.myInfoCard}>
                  <div className={styles.myInfoRow}>
                    <span className={styles.myInfoLabel}>내 역할</span>
                    <span className={`${styles.myRoleBadge} ${styles[userRole?.toLowerCase()]}`}>
                      {userRole === 'OWNER' ? '👑 스터디장' : userRole === 'ADMIN' ? '⭐ 관리자' : '👤 멤버'}
                    </span>
                  </div>
                  <div className={styles.myInfoRow}>
                    <span className={styles.myInfoLabel}>가입일</span>
                    <span className={styles.myInfoValue}>
                      {study.myJoinedAt ? new Date(study.myJoinedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* OWNER 전용: 권한 위임 카드 */}
              {isOwner && (
                <div className={styles.settingsCard}>
                  <h3 className={styles.cardTitle}>👥 권한 위임</h3>
                  <p className={styles.transferDesc}>
                    스터디장 권한을 관리자에게 위임할 수 있습니다. 위임 후에는 관리자로 강등됩니다.
                  </p>

                  {adminMembers.length === 0 ? (
                    <div className={styles.noAdminWarning}>
                      <span className={styles.noAdminIcon}>⚠️</span>
                      <p>권한을 위임할 관리자가 없습니다.</p>
                      <p className={styles.noAdminHint}>먼저 멤버 관리에서 관리자를 지정해주세요.</p>
                    </div>
                  ) : (
                    <div className={styles.transferSection}>
                      <div className={styles.adminSelectWrapper}>
                        <label className={styles.adminSelectLabel}>권한을 위임할 관리자 선택</label>
                        <select
                          value={selectedAdminId}
                          onChange={(e) => setSelectedAdminId(e.target.value)}
                          className={styles.adminSelect}
                        >
                          <option value="">관리자를 선택하세요</option>
                          {adminMembers.map((member) => (
                            <option key={member.userId} value={member.userId}>
                              {member.user?.name || member.user?.email} (⭐ 관리자)
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className={styles.transferButton}
                        onClick={handleTransferOwnership}
                        disabled={!selectedAdminId || transferOwnershipMutation.isPending}
                      >
                        {transferOwnershipMutation.isPending ? '위임 중...' : '👑 스터디장 권한 위임'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 스터디 탈퇴 카드 */}
              <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
                <h3 className={styles.cardTitle}>🚪 스터디 탈퇴</h3>

                {isOwner ? (
                  // OWNER인 경우
                  <div className={styles.ownerLeaveInfo}>
                    <div className={styles.ownerWarningBox}>
                      <span className={styles.ownerWarningIcon}>👑</span>
                      <div>
                        <p className={styles.ownerWarningTitle}>스터디장은 탈퇴할 수 없습니다</p>
                        <p className={styles.ownerWarningDesc}>
                          탈퇴를 원하시면 위에서 스터디장 권한을 위임하거나, 아래에서 스터디를 삭제해주세요.
                        </p>
                      </div>
                    </div>

                    <div className={styles.ownerOptions}>
                      <div className={styles.ownerOption}>
                        <span className={styles.optionIcon}>🗑️</span>
                        <div className={styles.optionContent}>
                          <h4>스터디 삭제</h4>
                          <p>스터디와 모든 데이터를 영구적으로 삭제합니다.</p>
                        </div>
                        <button
                          className={styles.deleteButton}
                          onClick={handleDeleteStudy}
                          disabled={deleteStudyMutation.isPending}
                        >
                          {deleteStudyMutation.isPending ? '삭제 중...' : '스터디 삭제'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // MEMBER/ADMIN인 경우
                  <div className={styles.leaveSection}>
                    <div className={styles.leaveWarning}>
                      <h4>⚠️ 탈퇴 시 주의사항</h4>
                      <ul className={styles.warningList}>
                        <li>스터디의 모든 활동 기록에 접근할 수 없게 됩니다.</li>
                        <li>채팅, 파일, 일정 등 스터디 데이터를 볼 수 없습니다.</li>
                        <li>재가입을 원하시면 다시 가입 신청이 필요합니다.</li>
                      </ul>
                    </div>
                    <button
                      className={styles.leaveButton}
                      onClick={handleLeaveStudy}
                      disabled={leaveStudyMutation.isPending}
                    >
                      {leaveStudyMutation.isPending ? '탈퇴 중...' : '🚪 스터디 탈퇴하기'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚠️ 주의사항</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>변경사항은 즉시 반영됩니다.</p>
              <p className={styles.widgetText}>중요한 변경 사항은 신중하게 진행하세요.</p>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 권한 안내</h3>
            <div className={styles.widgetContent}>
              <div className={styles.roleInfo}>
                <strong>OWNER:</strong>
                <ul>
                  <li>모든 설정</li>
                  <li>멤버 관리</li>
                  <li>스터디 삭제</li>
                </ul>
              </div>
              <div className={styles.roleInfo}>
                <strong>ADMIN:</strong>
                <ul>
                  <li>기본 정보</li>
                  <li>멤버 관리</li>
                  <li>공개 설정</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 정보</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>총 멤버:</span>
                <span className={styles.statValue}>{study.currentMembers}명</span>
              </div>
              <div className={styles.statRow}>
                <span>최대 인원:</span>
                <span>{study.maxMembers}명</span>
              </div>
              <div className={styles.statRow}>
                <span>공개 여부:</span>
                <span>{study.isPublic ? '공개' : '비공개'}</span>
              </div>
              <div className={styles.statRow}>
                <span>모집 상태:</span>
                <span>{study.isRecruiting ? '모집 중' : '모집 마감'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
