// 스터디 할일 사이드바 위젯
'use client';

import styles from './StudyTaskSidebar.module.css';

export default function StudyTaskSidebar({ tasks }) {
  // 통계 계산
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewTasks = tasks.filter(t => t.status === 'REVIEW').length;
  const todoTasks = tasks.filter(t => t.status === 'TODO').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 다가오는 마감일 (오늘부터 7일 이내)
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingDeadlines = tasks
    .filter(task => {
      if (!task.dueDate || task.status === 'DONE') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= weekLater;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // 지난 마감일 (기한 초과)
  const overdueTasks = tasks
    .filter(task => {
      if (!task.dueDate || task.status === 'DONE') return false;
      return new Date(task.dueDate) < now;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diff === 0) return '오늘';
    if (diff === 1) return '내일';
    if (diff < 0) return `${Math.abs(diff)}일 지남`;
    return `${diff}일 후`;
  };

  return (
    <div className={styles.sidebar}>
      {/* 진행률 카드 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>📊 진행률</h3>
        <div className={styles.progressCircle}>
          <svg viewBox="0 0 100 100" className={styles.progressSvg}>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={`${completionRate * 2.51} 251`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className={styles.progressText}>
            <span className={styles.progressPercent}>{completionRate}%</span>
            <span className={styles.progressLabel}>완료</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalTasks}</span>
            <span className={styles.statLabel}>전체</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{completedTasks}</span>
            <span className={styles.statLabel}>완료</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{inProgressTasks}</span>
            <span className={styles.statLabel}>진행중</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{todoTasks}</span>
            <span className={styles.statLabel}>대기</span>
          </div>
        </div>
      </div>

      {/* 기한 초과 태스크 */}
      {overdueTasks.length > 0 && (
        <div className={`${styles.widget} ${styles.overdueWidget}`}>
          <h3 className={styles.widgetTitle}>⚠️ 기한 초과</h3>
          <div className={styles.deadlineList}>
            {overdueTasks.map((task) => (
              <div key={task.id} className={styles.deadlineItem}>
                <span className={styles.deadlineTitle}>{task.title}</span>
                <span className={`${styles.deadlineDate} ${styles.overdue}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 다가오는 마감일 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>📅 다가오는 마감일</h3>
        {upcomingDeadlines.length > 0 ? (
          <div className={styles.deadlineList}>
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className={styles.deadlineItem}>
                <span className={styles.deadlineTitle}>{task.title}</span>
                <span className={styles.deadlineDate}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>예정된 마감일이 없습니다</p>
        )}
      </div>

      {/* 상태별 현황 바 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>📈 상태별 현황</h3>
        <div className={styles.statusBars}>
          <div className={styles.statusBar}>
            <div className={styles.statusBarLabel}>
              <span>할 일</span>
              <span>{todoTasks}</span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%`,
                  backgroundColor: '#f59e0b'
                }}
              />
            </div>
          </div>
          <div className={styles.statusBar}>
            <div className={styles.statusBarLabel}>
              <span>진행 중</span>
              <span>{inProgressTasks}</span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`,
                  backgroundColor: '#3b82f6'
                }}
              />
            </div>
          </div>
          <div className={styles.statusBar}>
            <div className={styles.statusBarLabel}>
              <span>검토</span>
              <span>{reviewTasks}</span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0}%`,
                  backgroundColor: '#8b5cf6'
                }}
              />
            </div>
          </div>
          <div className={styles.statusBar}>
            <div className={styles.statusBarLabel}>
              <span>완료</span>
              <span>{completedTasks}</span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                  backgroundColor: '#10b981'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
