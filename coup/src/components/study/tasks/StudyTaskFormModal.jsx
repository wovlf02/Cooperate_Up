// 스터디 할일 추가/수정 모달
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './StudyTaskFormModal.module.css';

const COLUMNS = [
  { id: 'TODO', title: '할 일' },
  { id: 'IN_PROGRESS', title: '진행 중' },
  { id: 'REVIEW', title: '검토' },
  { id: 'DONE', title: '완료' }
];

export default function StudyTaskFormModal({
  studyId,
  task,
  onClose,
  onSubmit,
  isLoading
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeIds: []
  });

  const [studyMembers, setStudyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isEditing = !!task;

  // task 데이터로 초기화
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeIds: task.assignees?.map(a => a.id) || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeIds: []
      });
    }
  }, [task]);

  // 스터디 멤버 목록 가져오기
  useEffect(() => {
    const fetchMembers = async () => {
      if (!studyId) return;

      setLoadingMembers(true);
      try {
        const response = await fetch(`/api/studies/${studyId}/members`);
        const data = await response.json();
        if (data.success) {
          setStudyMembers(data.data || []);
        }
      } catch (error) {
        console.error('멤버 목록 로드 실패:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [studyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('할일 제목을 입력해주세요.');
      return;
    }

    if (formData.assigneeIds.length === 0) {
      alert('담당자를 1명 이상 선택해주세요.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditing ? '✏️ 할일 수정' : '➕ 할일 추가'}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              할일 제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="예: 프로젝트 기획서 작성"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.formTextarea}
              placeholder="할일에 대한 자세한 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* 담당자 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              담당자 <span className={styles.required}>*</span> ({formData.assigneeIds.length}명 선택됨)
            </label>
            {loadingMembers ? (
              <div className={styles.memberLoading}>멤버 목록을 불러오는 중...</div>
            ) : studyMembers.length === 0 ? (
              <div className={styles.memberEmpty}>멤버가 없습니다</div>
            ) : (
              <div className={styles.memberList}>
                {studyMembers.map(member => {
                  const isCurrentUser = member.userId === currentUserId;
                  return (
                    <label
                      key={member.userId}
                      className={`${styles.memberItem} ${
                        formData.assigneeIds.includes(member.userId) ? styles.memberSelected : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(member.userId)}
                        onChange={() => toggleAssignee(member.userId)}
                        className={styles.memberCheckbox}
                      />
                      <div className={styles.memberInfo}>
                        {member.user?.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className={styles.memberAvatar}
                          />
                        ) : (
                          <div className={styles.memberAvatarPlaceholder}>
                            {member.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className={styles.memberDetails}>
                          <span className={styles.memberName}>
                            {member.user?.name || '이름 없음'}
                            {isCurrentUser && <span className={styles.meBadge}>(나)</span>}
                          </span>
                          <span className={styles.memberRole}>
                            {member.role === 'OWNER' && '👑 방장'}
                            {member.role === 'ADMIN' && '⭐ 관리자'}
                            {member.role === 'MEMBER' && '👤 멤버'}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            <p className={styles.helperText}>할일을 수행할 담당자를 1명 이상 선택해주세요</p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                {COLUMNS.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>우선순위</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>마감일</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : isEditing ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
