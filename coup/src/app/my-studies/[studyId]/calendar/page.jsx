// 내 스터디 일정 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { useStudy, useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

export default function MyStudyCalendarPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [viewType, setViewType] = useState('calendar'); // 'calendar' or 'list'
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    color: '#6366F1'
  });

  // 현재 사용자 세션
  const { data: session } = useSession();
  const currentUser = session?.user;

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { data: eventsData, isLoading: eventsLoading } = useEvents(studyId, { month });
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const study = studyData?.data;
  const events = eventsData?.data || [];

  // 일정 삭제 권한 확인 (작성자 본인 또는 ADMIN/OWNER)
  const canDeleteEvent = (event) => {
    if (!currentUser || !study) return false;
    return event.createdById === currentUser.id || ['OWNER', 'ADMIN'].includes(study.myRole);
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      color: '#6366F1'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenDetailModal = (event) => {
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      color: event.color || '#6366F1'
    });
    setIsEditingDetail(false);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvent(null);
    setIsEditingDetail(false);
    setEditFormData(null);
  };

  const handleStartEditing = () => {
    setIsEditingDetail(true);
  };

  const handleCancelEditing = () => {
    if (selectedEvent) {
      setEditFormData({
        title: selectedEvent.title,
        date: new Date(selectedEvent.date).toISOString().split('T')[0],
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        location: selectedEvent.location || '',
        color: selectedEvent.color || '#6366F1'
      });
    }
    setIsEditingDetail(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    try {
      await updateEventMutation.mutateAsync({
        studyId,
        eventId: selectedEvent.id,
        data: editFormData
      });
      setIsEditingDetail(false);
      handleCloseDetailModal();
      alert('일정이 수정되었습니다.');
    } catch (error) {
      alert('일정 수정 실패: ' + error.message);
    }
  };

  // 기존 생성 모달로 넘어가는 함수 (필요시 사용)
  const handleEditFromDetail = () => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        date: new Date(selectedEvent.date).toISOString().split('T')[0],
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        location: selectedEvent.location || '',
        color: selectedEvent.color || '#6366F1'
      });
      setShowDetailModal(false);
      setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    try {
      await createEventMutation.mutateAsync({
        studyId,
        data: formData
      });
      setShowModal(false);
      alert('일정이 추가되었습니다.');
    } catch (error) {
      alert('일정 추가 실패: ' + error.message);
    }
  };



  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatMonth = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };

  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return;

    try {
      await deleteEventMutation.mutateAsync({ studyId, eventId });
    } catch (error) {
      alert('일정 삭제 실패: ' + error.message);
    }
  };

  // 주간 뷰 관련 함수
  const getWeekDays = (date) => {
    const current = new Date(date);
    const first = current.getDate() - current.getDay(); // 일요일

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(current.setDate(first + i));
      return new Date(day);
    });
  };

  const getWeekRange = (date) => {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];

    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth}월 ${startDay}일 - ${endDay}일`;
    }
    return `${startMonth}월 ${startDay}일 - ${endMonth}월 ${endDay}일`;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };

  const formatDayHeader = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return { month, day, weekday };
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getEventPosition = (event) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const duration = endMinutes - startMinutes;

    return {
      top: `${(startMinutes / 60) * 60}px`, // 60px per hour
      height: `${(duration / 60) * 60}px`
    };
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 (${weekday})`;
  };

  const groupEventsByDate = () => {
    const grouped = {};
    events.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
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
      <StudyTabs studyId={studyId} activeTab="일정" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 일정 섹션 */}
        <div className={styles.calendarSection}>
          {/* 헤더 */}
          <div className={styles.calendarHeader}>
            <h2 className={styles.calendarTitle}>📅 일정</h2>
            <div className={styles.headerActions}>
              <div className={styles.viewTypeToggle}>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'calendar' ? styles.active : ''}`}
                  onClick={() => setViewType('calendar')}
                >
                  📅 캘린더
                </button>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'list' ? styles.active : ''}`}
                  onClick={() => setViewType('list')}
                >
                  📋 리스트
                </button>
              </div>
              {['OWNER', 'ADMIN'].includes(study?.myRole) && (
                <button className={styles.addButton} onClick={handleOpenModal}>
                  + 일정 추가
                </button>
              )}
            </div>
          </div>

          {/* 뷰 모드 & 네비게이션 (캘린더 뷰에만 표시) */}
          {viewType === 'calendar' && (
            <div className={styles.controlSection}>
              <div className={styles.viewModes}>
                <button
                  className={`${styles.viewMode} ${viewMode === 'month' ? styles.active : ''}`}
                  onClick={() => setViewMode('month')}
                >
                  월
                </button>
                <button
                  className={`${styles.viewMode} ${viewMode === 'week' ? styles.active : ''}`}
                  onClick={() => setViewMode('week')}
                >
                  주
                </button>
                <button
                  className={`${styles.viewMode} ${viewMode === 'day' ? styles.active : ''}`}
                  onClick={() => setViewMode('day')}
                >
                  일
                </button>
              </div>

              <div className={styles.monthNavigation}>
                <button
                  className={styles.navButton}
                  onClick={() => {
                    if (viewMode === 'month') goToPreviousMonth();
                    else if (viewMode === 'week') goToPreviousWeek();
                    else goToPreviousDay();
                  }}
                >
                  ◀
                </button>
                <div className={styles.dateDisplay}>
                  <span className={styles.currentMonth}>
                    {viewMode === 'month' && formatMonth(currentDate)}
                    {viewMode === 'week' && getWeekRange(currentDate)}
                    {viewMode === 'day' && `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`}
                  </span>
                  <button className={styles.todayButton} onClick={goToToday}>
                    오늘
                  </button>
                </div>
                <button
                  className={styles.navButton}
                  onClick={() => {
                    if (viewMode === 'month') goToNextMonth();
                    else if (viewMode === 'week') goToNextWeek();
                    else goToNextDay();
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
          )}

          {/* 캘린더 뷰 */}
          {viewType === 'calendar' && (
            <>
              {/* 월간 뷰 */}
              {viewMode === 'month' && (
                <div className={styles.monthView}>
                  <div className={styles.weekdayHeader}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                      <div key={day} className={styles.weekday}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {eventsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>일정 로딩 중...</div>
                  ) : (
                    <div className={styles.daysGrid}>
                      {getDaysInMonth(currentDate).map((day, index) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        return (
                          <div
                            key={index}
                            className={`${styles.dayCell} ${!day ? styles.emptyDay : ''} ${
                              isToday(day) ? styles.today : ''
                            }`}
                          >
                            {day && (
                              <>
                                <div className={styles.dayNumber}>{day}</div>
                                <div className={styles.dayEvents}>
                                  {dayEvents.slice(0, 2).map((event) => (
                                    <div
                                      key={event.id}
                                      className={styles.eventBadge}
                                      style={{ backgroundColor: event.color || '#6366F1' }}
                                      title={`${event.startTime} ${event.title}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDetailModal(event);
                                      }}
                                    >
                                      {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                                    </div>
                                  ))}
                                  {dayEvents.length > 2 && (
                                    <div className={styles.eventMore}>+{dayEvents.length - 2}개</div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 주간 뷰 */}
              {viewMode === 'week' && (
                <div className={styles.weekView}>
                  <div className={styles.weekViewHeader}>
                    {/* 좌측 상단 코너 셀 (시간/날짜) */}
                    <div className={styles.cornerCell}>
                      <span className={styles.cornerTime}>시간</span>
                      <span className={styles.cornerDate}>날짜</span>
                    </div>
                    {/* 요일 헤더 */}
                    {getWeekDays(currentDate).map((date, index) => {
                      const { month, day, weekday } = formatDayHeader(date);
                      const isCurrentDay = isSameDay(date, new Date());
                      return (
                        <div
                          key={index}
                          className={`${styles.weekDayHeader} ${isCurrentDay ? styles.currentDay : ''} ${index === 0 ? styles.sunday : ''}`}
                        >
                          <div className={styles.weekDayName}>{weekday}</div>
                          <div className={styles.weekDayDate}>
                            {month}/{day}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {eventsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>일정 로딩 중...</div>
                  ) : (
                    <div className={styles.weekViewBody}>
                      <div className={styles.timeColumn}>
                        {getTimeSlots().map((time) => (
                          <div key={time} className={styles.timeSlot}>
                            {time}
                          </div>
                        ))}
                      </div>
                      <div className={styles.weekDaysColumn}>
                        {getWeekDays(currentDate).map((date, index) => {
                          const dayEvents = getEventsForDate(date);
                          return (
                            <div key={index} className={styles.weekDayColumn}>
                              <div className={styles.timeGrid}>
                                {getTimeSlots().map((time) => (
                                  <div key={time} className={styles.timeGridSlot}></div>
                                ))}
                              </div>
                              <div className={styles.eventsContainer}>
                                {dayEvents.map((event) => {
                                  const position = getEventPosition(event);
                                  return (
                                    <div
                                      key={event.id}
                                      className={styles.weekEvent}
                                      style={{
                                        top: position.top,
                                        height: position.height,
                                        backgroundColor: event.color || '#6366F1'
                                      }}
                                      onClick={() => handleOpenDetailModal(event)}
                                      title={`${event.startTime} - ${event.endTime}\n${event.title}`}
                                    >
                                      <div className={styles.weekEventTime}>
                                        {event.startTime}
                                      </div>
                                      <div className={styles.weekEventTitle}>
                                        {event.title}
                                      </div>
                                      {event.location && (
                                        <div className={styles.weekEventLocation}>
                                          📍 {event.location}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 일간 뷰 */}
              {viewMode === 'day' && (
                <div className={styles.dayView}>
                  <div className={styles.dayViewHeader}>
                    <div className={styles.dayViewTitle}>
                      {currentDate.getMonth() + 1}월 {currentDate.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]})
                    </div>
                  </div>

                  {eventsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>일정 로딩 중...</div>
                  ) : (
                    <div className={styles.dayViewBody}>
                      <div className={styles.timeColumn}>
                        {getTimeSlots().map((time) => (
                          <div key={time} className={styles.timeSlot}>
                            {time}
                          </div>
                        ))}
                      </div>
                      <div className={styles.dayEventsColumn}>
                        <div className={styles.timeGrid}>
                          {getTimeSlots().map((time) => (
                            <div key={time} className={styles.timeGridSlot}></div>
                          ))}
                        </div>
                        <div className={styles.eventsContainer}>
                          {getEventsForDate(currentDate).map((event) => {
                            const position = getEventPosition(event);
                            return (
                              <div
                                key={event.id}
                                className={styles.dayEvent}
                                style={{
                                  top: position.top,
                                  height: position.height,
                                  backgroundColor: event.color || '#6366F1'
                                }}
                                onClick={() => handleOpenDetailModal(event)}
                              >
                                <div className={styles.dayEventTime}>
                                  {event.startTime} - {event.endTime}
                                </div>
                                <div className={styles.dayEventTitle}>
                                  {event.title}
                                </div>
                                {event.location && (
                                  <div className={styles.dayEventLocation}>
                                    📍 {event.location}
                                  </div>
                                )}
                                <div className={styles.dayEventCreator}>
                                  작성자: {event.createdBy?.name || '알 수 없음'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* 리스트 뷰 */}
          {viewType === 'list' && (
            <div className={styles.listView}>
              {eventsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>일정 로딩 중...</div>
              ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  등록된 일정이 없습니다. 일정을 추가해보세요! 📅
                </div>
              ) : (
                <div className={styles.eventsList}>
                  {groupEventsByDate().map(([date, dateEvents]) => (
                    <div key={date} className={styles.dateGroup}>
                      <h3 className={styles.dateGroupTitle}>
                        {formatDateForDisplay(date)}
                      </h3>
                      {dateEvents.map((event) => (
                        <div
                          key={event.id}
                          className={styles.eventItem}
                          style={{ borderLeftColor: event.color || '#6366F1' }}
                          onClick={() => handleOpenDetailModal(event)}
                        >
                          <div className={styles.eventItemHeader}>
                            <div className={styles.eventItemTime}>
                              {event.startTime} - {event.endTime}
                            </div>
                            {canDeleteEvent(event) && (
                              <button
                                className={styles.eventDeleteBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                          <h4 className={styles.eventItemTitle}>{event.title}</h4>
                          {event.location && (
                            <div className={styles.eventItemLocation}>
                              📍 {event.location}
                            </div>
                          )}
                          <div className={styles.eventItemCreator}>
                            작성자: {event.createdBy?.name || '알 수 없음'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 오늘 일정 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📆 오늘 일정</h3>
            <div className={styles.widgetContent}>
              <div className={styles.todayDate}>
                {new Date().toLocaleDateString('ko-KR')}
              </div>
              {todayEvents.length === 0 ? (
                <p className={styles.widgetText}>오늘은 일정이 없습니다.</p>
              ) : (
                todayEvents.map((event) => (
                  <div key={event.id} className={styles.todayEvent}>
                    <div className={styles.todayEventTime}>
                      {event.startTime}-{event.endTime}
                    </div>
                    <div className={styles.todayEventTitle}>{event.title}</div>
                    {event.location && (
                      <div className={styles.todayEventLocation}>📍 {event.location}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 이번 달 통계 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 이번 달 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>총 일정:</span>
                <span className={styles.statValue}>{events.length}개</span>
              </div>
            </div>
          </div>

          {/* 내보내기 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📥 내보내기</h3>
            <div className={styles.widgetActions}>
              <button className={styles.widgetButton}>iCal</button>
              <button className={styles.widgetButton}>CSV</button>
            </div>
          </div>
        </aside>
      </div>

      {/* 일정 추가 모달 */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>📅 일정 추가</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  일정 제목 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="예: 팀 미팅"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  날짜 <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    시작 시간 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    종료 시간 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>장소</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="예: 회의실 A"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>색상</label>
                <div className={styles.colorPicker}>
                  {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.colorOption} ${
                          formData.color === color ? styles.selected : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    )
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? '추가 중...' : '일정 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 일정 상세보기 모달 */}
      {showDetailModal && selectedEvent && editFormData && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditingDetail ? '✏️ 일정 수정' : '📅 일정 상세'}
              </h2>
              <button className={styles.modalClose} onClick={handleCloseDetailModal}>
                ✕
              </button>
            </div>

            <div className={styles.detailContent}>
              {/* 일정 제목 */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>일정 제목</div>
                {isEditingDetail ? (
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <div className={styles.detailValue}>{selectedEvent.title}</div>
                )}
              </div>

              {/* 날짜 */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>날짜</div>
                {isEditingDetail ? (
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <div className={styles.detailValue}>
                    {formatDateForDisplay(selectedEvent.date)}
                  </div>
                )}
              </div>

              {/* 시간 */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>시간</div>
                {isEditingDetail ? (
                  <div className={styles.timeInputRow}>
                    <input
                      type="time"
                      name="startTime"
                      value={editFormData.startTime}
                      onChange={handleEditInputChange}
                      className={styles.editInput}
                    />
                    <span className={styles.timeSeparator}>~</span>
                    <input
                      type="time"
                      name="endTime"
                      value={editFormData.endTime}
                      onChange={handleEditInputChange}
                      className={styles.editInput}
                    />
                  </div>
                ) : (
                  <div className={styles.detailValue}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                )}
              </div>

              {/* 장소 */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>장소</div>
                {isEditingDetail ? (
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                    placeholder="장소를 입력하세요 (선택)"
                    className={styles.editInput}
                  />
                ) : (
                  <div className={styles.detailValue}>
                    {selectedEvent.location ? `📍 ${selectedEvent.location}` : '-'}
                  </div>
                )}
              </div>

              {/* 작성자 (읽기 전용) */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>작성자</div>
                <div className={styles.detailValue}>
                  {selectedEvent.createdBy?.name || '알 수 없음'}
                </div>
              </div>

              {/* 색상 */}
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>색상</div>
                {isEditingDetail ? (
                  <div className={styles.colorPickerRow}>
                    <input
                      type="color"
                      name="color"
                      value={editFormData.color}
                      onChange={handleEditInputChange}
                      className={styles.colorInput}
                    />
                    <div className={styles.colorPresets}>
                      {['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`${styles.colorPreset} ${editFormData.color === color ? styles.activeColor : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.detailColorBox} style={{ backgroundColor: selectedEvent.color || '#6366F1' }}>
                    {selectedEvent.color || '#6366F1'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.detailActions}>
              {canDeleteEvent(selectedEvent) && (
                <>
                  {isEditingDetail ? (
                    <>
                      <button
                        className={styles.detailSaveButton}
                        onClick={handleSaveEdit}
                        disabled={updateEventMutation.isPending}
                      >
                        {updateEventMutation.isPending ? '저장 중...' : '💾 저장'}
                      </button>
                      <button
                        className={styles.detailCancelButton}
                        onClick={handleCancelEditing}
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.detailEditButton}
                        onClick={handleStartEditing}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        className={styles.detailDeleteButton}
                        onClick={() => {
                          handleCloseDetailModal();
                          handleDeleteEvent(selectedEvent.id);
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                className={styles.detailCloseButton}
                onClick={handleCloseDetailModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
