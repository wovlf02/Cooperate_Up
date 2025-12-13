// 특정 날짜의 할 일 목록 모달
'use client';

import { getUrgencyLevel } from '@/utils/time';
import styles from './TaskDayModal.module.css';

export default function TaskDayModal({ date, tasks, onToggle, onClose }) {
  if (!date || !tasks) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getTaskColor = (task) => {
    const urgency = getUrgencyLevel(task.dueDate);
    const colorMap = {
      urgent: 'urgent',
      thisWeek: 'thisWeek',
      later: 'later'
    };
    return colorMap[urgency] || 'later';
  };

  const getDday = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return `D+${Math.abs(diff)}`;
    if (diff === 0) return 'D-Day';
    return `D-${diff}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>📅 {formatDate(date)}</h2>
            <p className={styles.modalSubtitle}>총 {tasks.length}개의 할 일</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.taskList}>
          {tasks.map(task => {
            const color = getTaskColor(task);
            return (
              <div
                key={task.id}
                className={`${styles.taskItem} ${styles[color]} ${
                  task.completed ? styles.completed : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                  className={styles.checkbox}
                />
                <div className={styles.taskContent}>
                  <div className={styles.taskHeader}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.dday}>{getDday(task.dueDate)}</span>
                  </div>
                  {task.description && (
                    <p className={styles.taskDescription}>{task.description}</p>
                  )}
                  {task.study && (
                    <div className={styles.taskMeta}>
                      <span className={styles.studyBadge}>
                        {task.study.emoji} {task.study.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

