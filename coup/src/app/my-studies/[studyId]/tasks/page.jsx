// 내 스터디 할일 관리 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { useStudy, useStudyTasks, useCreateStudyTask, useUpdateStudyTask, useDeleteStudyTask } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

// 분리된 컴포넌트들
import {
  StudyTaskFormModal,
  StudyTaskDetailModal,
  StudyTaskKanbanView,
  StudyTaskListView,
  StudyTaskSidebar
} from '@/components/study/tasks';

export default function MyStudyTasksPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const { data: session } = useSession();
  const currentUser = session?.user;

  // 뷰 상태
  const [viewType, setViewType] = useState('kanban'); // 'kanban' or 'list'

  // 모달 상태
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: tasksData, isLoading: tasksLoading } = useStudyTasks(studyId);
  const createTaskMutation = useCreateStudyTask();
  const updateTaskMutation = useUpdateStudyTask();
  const deleteTaskMutation = useDeleteStudyTask();

  const study = studyData?.data;
  const tasks = tasksData?.data || [];

  // 권한 체크: OWNER 또는 ADMIN만 할일 관리 가능
  const canManageTasks = study && ['OWNER', 'ADMIN'].includes(study.myRole);

  // 할일 추가/수정 모달 열기
  const handleOpenFormModal = (task = null) => {
    if (!canManageTasks) {
      alert('할일 관리 권한이 없습니다. 방장 또는 관리자만 할일을 추가/수정할 수 있습니다.');
      return;
    }
    setEditingTask(task);
    setShowFormModal(true);
  };

  // 할일 추가/수정 모달 닫기
  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingTask(null);
  };

  // 할일 상세 모달 열기
  const handleOpenDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // 할일 상세 모달 닫기
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  // 상세에서 수정하기 클릭
  const handleEditFromDetail = (task) => {
    setShowDetailModal(false);
    handleOpenFormModal(task);
  };

  // 할일 제출 (추가/수정)
  const handleSubmitTask = async (formData) => {
    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({
          studyId,
          taskId: editingTask.id,
          data: formData
        });
        alert('할일이 수정되었습니다.');
      } else {
        await createTaskMutation.mutateAsync({
          studyId,
          data: formData
        });
        alert('할일이 추가되었습니다.');
      }
      handleCloseFormModal();
    } catch (error) {
      alert(`할일 ${editingTask ? '수정' : '추가'} 실패: ` + error.message);
    }
  };

  // 할일 상태 변경 (다음 단계로)
  const handleToggleTask = async (taskId, newStatus) => {
    if (!canManageTasks) {
      alert('할일 관리 권한이 없습니다. 방장 또는 관리자만 할일 상태를 변경할 수 있습니다.');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // newStatus가 전달되지 않으면 다음 상태로 자동 설정
    const nextStatusMap = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'REVIEW',
      REVIEW: 'DONE',
      DONE: 'TODO'
    };
    const targetStatus = newStatus || nextStatusMap[task.status];

    try {
      await updateTaskMutation.mutateAsync({
        studyId,
        taskId,
        data: { status: targetStatus }
      });
    } catch (error) {
      alert('할일 상태 변경 실패: ' + error.message);
    }
  };

  // 할일 삭제
  const handleDeleteTask = async (taskId) => {
    if (!canManageTasks) {
      alert('할일 관리 권한이 없습니다. 방장 또는 관리자만 할일을 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('할일을 삭제하시겠습니까?')) return;

    try {
      await deleteTaskMutation.mutateAsync({ studyId, taskId });
      setShowDetailModal(false);
      setSelectedTask(null);
    } catch (error) {
      alert('할일 삭제 실패: ' + error.message);
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
      <StudyTabs studyId={studyId} activeTab="할일" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 할일 섹션 */}
        <div className={styles.taskSection}>
          {/* 헤더 */}
          <div className={styles.taskHeader}>
            <h2 className={styles.taskTitle}>✅ 할일</h2>
            <div className={styles.headerActions}>
              <div className={styles.viewTypeToggle}>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'kanban' ? styles.active : ''}`}
                  onClick={() => setViewType('kanban')}
                >
                  📊 칸반보드
                </button>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'list' ? styles.active : ''}`}
                  onClick={() => setViewType('list')}
                >
                  📋 리스트
                </button>
              </div>
              {canManageTasks && (
                <button className={styles.addButton} onClick={() => handleOpenFormModal()}>
                  + 할일 추가
                </button>
              )}
            </div>
          </div>

          {/* 로딩 상태 */}
          {tasksLoading ? (
            <div className={styles.loading}>할일 로딩 중...</div>
          ) : (
            <>
              {/* 칸반보드 뷰 */}
              {viewType === 'kanban' && (
                <StudyTaskKanbanView
                  tasks={tasks}
                  onTaskClick={handleOpenDetailModal}
                  onAddTask={() => handleOpenFormModal()}
                  onToggle={handleToggleTask}
                  isToggling={updateTaskMutation.isPending}
                  canManage={canManageTasks}
                />
              )}

              {/* 리스트 뷰 */}
              {viewType === 'list' && (
                <StudyTaskListView
                  tasks={tasks}
                  onTaskClick={handleOpenDetailModal}
                  onToggle={handleToggleTask}
                  isToggling={updateTaskMutation.isPending}
                  canManage={canManageTasks}
                />
              )}
            </>
          )}
        </div>

        {/* 우측 사이드바 */}
        <aside className={styles.sidebar}>
          <StudyTaskSidebar tasks={tasks} />
        </aside>
      </div>

      {/* 할일 추가/수정 모달 */}
      {showFormModal && (
        <StudyTaskFormModal
          studyId={studyId}
          task={editingTask}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmitTask}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}

      {/* 할일 상세 모달 */}
      {showDetailModal && selectedTask && (
        <StudyTaskDetailModal
          task={selectedTask}
          onClose={handleCloseDetailModal}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteTask}
          onToggle={handleToggleTask}
          isDeleting={deleteTaskMutation.isPending}
          isToggling={updateTaskMutation.isPending}
          canManage={canManageTasks}
        />
      )}
    </div>
  );
}
