// 할 일 달력 뷰 컴포넌트
'use client';

import { useState, useMemo } from 'react';
import { getUrgencyLevel } from '@/utils/time';
import TaskDayModal from './TaskDayModal';
import styles from './TaskCalendarView.module.css';

export default function TaskCalendarView({ tasks, onToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // 현재 월의 날짜들 계산
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    const days = [];
    const current = new Date(startDay);
    
    while (current <= endDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // 날짜별 할 일 그룹화
  const tasksByDate = useMemo(() => {
    const grouped = {};
    
    tasks.forEach(task => {
      const dateKey = new Date(task.dueDate).toLocaleDateString('ko-KR');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    return grouped;
  }, [tasks]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayTasks = (date) => {
    const dateKey = date.toLocaleDateString('ko-KR');
    return tasksByDate[dateKey] || [];
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

  const handleMoreClick = (date, tasks, e) => {
    e.stopPropagation();
    setSelectedDate(date);
    setSelectedTasks(tasks);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    setSelectedTasks([]);
  };

  return (
    <>
      <div className={styles.calendarContainer}>
        {/* 달력 헤더 */}
        <div className={styles.calendarHeader}>
          <button onClick={goToPrevMonth} className={styles.navButton}>
            ←
          </button>
          <div className={styles.currentMonth}>
            <h2>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
            <button onClick={goToToday} className={styles.todayButton}>
              오늘
            </button>
          </div>
          <button onClick={goToNextMonth} className={styles.navButton}>
            →
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className={styles.weekdays}>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className={styles.calendarGrid}>
          {calendarDays.map((date, index) => {
            const dayTasks = getDayTasks(date);
            const isCurrentDay = isToday(date);
            const isOtherMonth = !isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`${styles.calendarDay} ${
                  isCurrentDay ? styles.today : ''
                } ${isOtherMonth ? styles.otherMonth : ''}`}
              >
                <div className={styles.dayNumber}>
                  {date.getDate()}
                  {dayTasks.length > 0 && (
                    <span className={styles.taskCount}>{dayTasks.length}</span>
                  )}
                </div>
                
                <div className={styles.dayTasks}>
                  {dayTasks.slice(0, 3).map(task => {
                    const color = getTaskColor(task);
                    return (
                      <div
                        key={task.id}
                        className={`${styles.taskItem} ${styles[color]} ${
                          task.completed ? styles.completed : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(task.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggle(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={styles.checkbox}
                        />
                        <span className={styles.taskTitle}>
                          {task.title}
                        </span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div 
                      className={styles.moreTask}
                      onClick={(e) => handleMoreClick(date, dayTasks, e)}
                    >
                      +{dayTasks.length - 3}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 날짜별 할 일 모달 */}
      {selectedDate && (
        <TaskDayModal
          date={selectedDate}
          tasks={selectedTasks}
          onToggle={onToggle}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
