// 할일 상세 모달
'use client';

import { formatDateTimeKST } from '@/utils/time';
import styles from './TaskDetailModal.module.css';

export default function TaskDetailModal({ task, onClose, onToggleComplete, onDelete, onEdit }) {
  if (!task) return null;

  const getPriorityInfo = () => {
    switch (task.priority) {
      case 'URGENT':
        return { emoji: '🔥', text: '긴급', color: '#ef4444' };
      case 'HIGH':
        return { emoji: '⚠️', text: '높음', color: '#f59e0b' };
      case 'MEDIUM':
        return { emoji: '📌', text: '보통', color: '#3b82f6' };
      case 'LOW':
        return { emoji: '📎', text: '낮음', color: '#6b7280' };
      default:
        return { emoji: '📌', text: '보통', color: '#3b82f6' };
    }
  };

  const priority = getPriorityInfo();

  const handleToggleComplete = async () => {
    await onToggleComplete(task.id);
    // 완료 상태 변경 후 모달 닫기
    setTimeout(() => {
      onClose();
    }, 300); // 애니메이션을 위한 약간의 지연
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm('정말 이 할 일을 삭제하시겠습니까?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>{task.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.content}>
          {/* 상태 */}
          <div className={styles.section}>
            <div className={styles.statusRow}>
              <button
                className={`${styles.statusButton} ${task.completed ? styles.completed : ''}`}
                onClick={handleToggleComplete}
              >
                {task.completed ? '✓ 완료됨' : '○ 미완료'}
              </button>
              <div className={styles.priorityBadge} style={{ borderColor: priority.color }}>
                <span>{priority.emoji}</span>
                <span style={{ color: priority.color }}>{priority.text}</span>
              </div>
            </div>
          </div>

          {/* 스터디 정보 */}
          {task.study && (
            <div className={styles.section}>
              <div className={styles.label}>📚 스터디</div>
              <div className={styles.studyInfo}>
                <span className={styles.studyEmoji}>{task.study.emoji || '📚'}</span>
                <span className={styles.studyName}>{task.study.name}</span>
              </div>
            </div>
          )}

          {/* 마감일 */}
          {task.dueDate && (
            <div className={styles.section}>
              <div className={styles.label}>📅 마감일</div>
              <div className={styles.value}>{formatDateTimeKST(task.dueDate)}</div>
            </div>
          )}

          {/* 담당자 */}
          {task.assignee && (
            <div className={styles.section}>
              <div className={styles.label}>👤 담당자</div>
              <div className={styles.assigneeInfo}>
                {task.assignee.avatar && (
                  <img src={task.assignee.avatar} alt={task.assignee.name} className={styles.avatar} />
                )}
                <span>{task.assignee.name}</span>
              </div>
            </div>
          )}

          {/* 설명 */}
          {task.description && (
            <div className={styles.section}>
              <div className={styles.label}>📝 설명</div>
              <div className={styles.description}>{task.description}</div>
            </div>
          )}

          {/* 생성일 */}
          {task.createdAt && (
            <div className={styles.section}>
              <div className={styles.label}>🕐 생성일</div>
              <div className={styles.value}>{formatDateTimeKST(task.createdAt)}</div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <button onClick={handleDelete} className={styles.deleteButton}>
            삭제
          </button>
          <button 
            onClick={() => {
              onEdit && onEdit(task)
              onClose()
            }} 
            className={styles.editButton}
          >
            수정
          </button>
          <button onClick={onClose} className={styles.doneButton}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

