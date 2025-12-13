'use client'

import { useState, useMemo } from 'react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskGroup from '@/components/tasks/TaskGroup'
import TaskCalendarView from '@/components/tasks/TaskCalendarView'
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'
import TaskProgressWidget from '@/components/tasks/TaskProgressWidget'
import TaskByStudyWidget from '@/components/tasks/TaskByStudyWidget'
import TaskEmpty from '@/components/tasks/TaskEmpty'
import TaskCreateModal from '@/components/tasks/TaskCreateModal'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import TaskDetailModal from '@/components/tasks/TaskDetailModal'
import { useTasks, useToggleTask, useDeleteTask, useTaskStats } from '@/lib/hooks/useApi'
import { getUrgencyLevel } from '@/utils/time'
import styles from './page.module.css'

export default function TasksPage() {
  const [filter, setFilter] = useState({
    studyId: null,
    status: 'all',
    sortBy: 'deadline',
  })
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  // 실제 API 호출 - 필터 파라미터 변환
  const apiParams = useMemo(() => {
    const params = {}
    if (filter.studyId) {
      params.studyId = filter.studyId
    }
    if (filter.status && filter.status !== 'all') {
      params.status = filter.status
    }
    if (filter.sortBy) {
      params.sortBy = filter.sortBy
    }
    return params
  }, [filter])

  const { data: tasksData, isLoading } = useTasks(apiParams)
  const { data: statsData } = useTaskStats()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

  const tasks = useMemo(() => tasksData?.data || [], [tasksData])
  const taskStats = statsData?.data || null

  // 클라이언트 측 추가 필터링 (이미 서버에서 필터링됨, 정렬만 추가)
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    result.sort((a, b) => {
      if (filter.sortBy === 'deadline') {
        return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31')
      } else if (filter.sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (filter.sortBy === 'study') {
        return (a.study?.name || '').localeCompare(b.study?.name || '')
      }
      return 0
    })

    return result
  }, [tasks, filter.sortBy])

  const groupedTasks = useMemo(() => {
    const urgent = []
    const thisWeek = []
    const later = []

    filteredTasks.forEach(task => {
      const urgency = getUrgencyLevel(task.dueDate)
      if (urgency === 'urgent') {
        urgent.push(task)
      } else if (urgency === 'thisWeek') {
        thisWeek.push(task)
      } else {
        later.push(task)
      }
    })

    return { urgent, thisWeek, later }
  }, [filteredTasks])

  const handleToggleComplete = async (taskId) => {
    try {
      await toggleTask.mutateAsync(taskId)
    } catch (error) {
      console.error('할일 토글 실패:', error)
      alert('할 일 상태 변경에 실패했습니다.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('정말 이 할 일을 삭제하시겠습니까?')) {
      try {
        await deleteTask.mutateAsync(taskId)
      } catch (error) {
        console.error('할일 삭제 실패:', error)
        alert('할 일 삭제에 실패했습니다.')
      }
    }
  }

  const incompleteCount = tasks.filter(t => !t.completed).length

  // 수정 모달 열기
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>할 일을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>✅ 내 할 일</h1>
            <p className={styles.subtitle}>
              스터디별 할 일을 관리하고 완료하세요
            </p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowCreateModal(true)}
          >
            + 할 일 추가
          </button>
        </header>

        <TaskFilters
          filter={filter}
          setFilter={setFilter}
          taskCount={incompleteCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {tasks.length === 0 ? (
          <TaskEmpty onCreateClick={() => setShowCreateModal(true)} />
        ) : viewMode === 'calendar' ? (
          <TaskCalendarView
            tasks={filteredTasks}
            onToggle={handleToggleComplete}
            onDelete={handleDeleteTask}
          />
        ) : (
          <div className={styles.taskGroups}>
            {groupedTasks.urgent.length > 0 && (
              <TaskGroup
                title="🔥 긴급"
                tasks={groupedTasks.urgent}
                color="urgent"
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onCardClick={setSelectedTask}
                onEdit={handleEditTask}
              />
            )}

            {groupedTasks.thisWeek.length > 0 && (
              <TaskGroup
                title="📅 이번 주"
                tasks={groupedTasks.thisWeek}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onCardClick={setSelectedTask}
                onEdit={handleEditTask}
              />
            )}

            {groupedTasks.later.length > 0 && (
              <TaskGroup
                title="📋 나중에"
                tasks={groupedTasks.later}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onCardClick={setSelectedTask}
                onEdit={handleEditTask}
              />
            )}
          </div>
        )}
      </div>

      <aside className={styles.sidebar}>
        <TodayTasksWidget tasks={tasks} />
        {taskStats && <TaskProgressWidget stats={taskStats} />}
        <TaskByStudyWidget tasks={tasks} />
      </aside>

      {showCreateModal && (
        <TaskCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      )}

      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false)
            setEditingTask(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
