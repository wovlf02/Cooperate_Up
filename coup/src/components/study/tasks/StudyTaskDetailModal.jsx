// 스터디 할일 상세 모달
'use client';

import styles from './StudyTaskDetailModal.module.css';

const COLUMN_LABELS = {
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  REVIEW: '검토',
  DONE: '완료'
};

const PRIORITY_LABELS = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음'
};

// 다음 상태 및 버튼 레이블 정의
const NEXT_STATUS = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'REVIEW',
  REVIEW: 'DONE',
  DONE: 'TODO'
};

const NEXT_STATUS_LABELS = {
  TODO: '▶️ 진행 시작',
  IN_PROGRESS: '🔍 검토 요청',
  REVIEW: '✅ 완료 처리',
  DONE: '↩️ 다시 열기'
};

export default function StudyTaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onToggle,
  isDeleting,
  isToggling,
  canManage = false
}) {
  if (!task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '미정';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>📋 할일 상세</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* 제목 */}
          <div className={styles.taskTitle}>{task.title}</div>

          {/* 상태 & 우선순위 배지 */}
          <div className={styles.badges}>
            <span className={`${styles.statusBadge} ${styles[task.status.toLowerCase()]}`}>
              {COLUMN_LABELS[task.status]}
            </span>
            <span className={`${styles.priorityBadge} ${styles[`priority${task.priority}`]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {/* 설명 */}
          {task.description && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📝 설명</h3>
              <p className={styles.description}>{task.description}</p>
            </div>
          )}

          {/* 담당자 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>👥 담당자</h3>
            {task.assignees && task.assignees.length > 0 ? (
              <div className={styles.assigneeList}>
                {task.assignees.map((assignee, index) => (
                  <div key={index} className={styles.assigneeItem}>
                    {assignee?.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee?.name}
                        className={styles.assigneeAvatar}
                      />
                    ) : (
                      <div className={styles.assigneeAvatarPlaceholder}>
                        {assignee?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className={styles.assigneeName}>
                      {assignee?.name || '알 수 없음'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noAssignee}>담당자 미지정</p>
            )}
          </div>

          {/* 마감일 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📅 마감일</h3>
            <p className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
              {formatDate(task.dueDate)}
              {isOverdue && <span className={styles.overdueLabel}>기한 초과</span>}
            </p>
          </div>

          {/* 생성/수정일 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🕐 일시</h3>
            <div className={styles.dateInfo}>
              <p>생성: {formatDate(task.createdAt)}</p>
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <p>수정: {formatDate(task.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className={styles.modalActions}>
          {canManage ? (
            <>
              <button
                className={styles.toggleButton}
                onClick={() => onToggle(task.id, NEXT_STATUS[task.status])}
                disabled={isToggling}
              >
                {NEXT_STATUS_LABELS[task.status]}
              </button>

              <button
                className={styles.editButton}
                onClick={() => onEdit(task)}
              >
                ✏️ 수정
              </button>

              <button
                className={styles.deleteButton}
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '🗑️ 삭제'}
              </button>
            </>
          ) : (
            <p className={styles.noPermission}>할일 관리 권한이 없습니다</p>
          )}

          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
