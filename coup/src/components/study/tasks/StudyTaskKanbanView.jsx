// 스터디 할일 칸반보드 뷰
'use client';

import styles from './StudyTaskKanbanView.module.css';

const COLUMNS = [
  { id: 'TODO', title: '할 일', icon: '📋', color: '#f59e0b' },
  { id: 'IN_PROGRESS', title: '진행 중', icon: '🔄', color: '#3b82f6' },
  { id: 'REVIEW', title: '검토', icon: '👀', color: '#8b5cf6' },
  { id: 'DONE', title: '완료', icon: '✅', color: '#10b981' }
];

const PRIORITY_COLORS = {
  LOW: '#0ea5e9',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444'
};

const PRIORITY_LABELS = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음'
};

// 다음 상태 정의
const NEXT_STATUS = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'REVIEW',
  REVIEW: 'DONE',
  DONE: 'TODO'
};

const NEXT_STATUS_ICONS = {
  TODO: '▶',
  IN_PROGRESS: '🔍',
  REVIEW: '✓',
  DONE: '↩'
};

export default function StudyTaskKanbanView({
  tasks,
  onTaskClick,
  onAddTask,
  onToggle,
  isToggling,
  canManage = false
}) {
  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.status === columnId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'DONE') return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className={styles.kanbanBoard}>
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByColumn(column.id);
        return (
          <div key={column.id} className={styles.column}>
            <div className={styles.columnHeader} style={{ borderTopColor: column.color }}>
              <span className={styles.columnIcon}>{column.icon}</span>
              <span className={styles.columnTitle}>{column.title}</span>
              <span className={styles.columnCount}>{columnTasks.length}</span>
            </div>

            <div className={styles.columnBody}>
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${isOverdue(task.dueDate, task.status) ? styles.overdue : ''}`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className={styles.taskHeader}>
                    <span
                      className={styles.priorityDot}
                      style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                      title={PRIORITY_LABELS[task.priority]}
                    />
                    <span className={styles.taskTitle}>{task.title}</span>
                  </div>

                  {task.description && (
                    <p className={styles.taskDescription}>
                      {task.description.length > 60
                        ? task.description.substring(0, 60) + '...'
                        : task.description}
                    </p>
                  )}

                  <div className={styles.taskFooter}>
                    {/* 담당자 */}
                    {task.assignees && task.assignees.length > 0 && (
                      <div className={styles.assignees}>
                        {task.assignees.slice(0, 2).map((assignee, index) => (
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
                            <span className={styles.assigneeName}>{assignee?.name}</span>
                          </div>
                        ))}
                        {task.assignees.length > 2 && (
                          <span className={styles.moreAssignees}>
                            +{task.assignees.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 마감일 */}
                    {task.dueDate && (
                      <span className={`${styles.dueDate} ${isOverdue(task.dueDate, task.status) ? styles.overdueBadge : ''}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* 빠른 상태 변경 (관리자만) */}
                  {canManage && (
                    <button
                      className={styles.quickComplete}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id, NEXT_STATUS[task.status]);
                      }}
                      disabled={isToggling}
                      title={task.status === 'DONE' ? '다시 열기' : '다음 단계로'}
                    >
                      {NEXT_STATUS_ICONS[task.status]}
                    </button>
                  )}
                </div>
              ))}

              {/* 빈 상태 */}
              {columnTasks.length === 0 && (
                <div className={styles.emptyColumn}>
                  <p>할일이 없습니다</p>
                </div>
              )}
            </div>

            {/* 할일 추가 버튼 (TODO 컬럼, 관리자만) */}
            {canManage && column.id === 'TODO' && (
              <button className={styles.addTaskButton} onClick={onAddTask}>
                + 할일 추가
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
