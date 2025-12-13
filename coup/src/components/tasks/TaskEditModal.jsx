'use client'

import { useState, useEffect } from 'react'
import { useMyStudies, useUpdateTask } from '@/lib/hooks/useApi'
import { useSession } from 'next-auth/react'
import styles from './TaskCreateModal.module.css'

export default function TaskEditModal({ task, onClose, onSuccess }) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studyId: '',
    dueDate: '',
    priority: 'MEDIUM',
    assigneeIds: [],
  })
  const [studyMembers, setStudyMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const { data: studiesData } = useMyStudies({ limit: 50, filter: 'active' })
  const updateTask = useUpdateTask()

  // API 응답에서 study 객체만 추출
  const studies = studiesData?.data?.studies?.map(item => item.study).filter(study => study) || []

  // task 데이터로 초기화
  useEffect(() => {
    if (task) {
      // dueDate를 datetime-local 형식으로 변환
      let dueDateFormatted = ''
      if (task.dueDate) {
        const date = new Date(task.dueDate)
        dueDateFormatted = date.toISOString().slice(0, 16)
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        studyId: task.studyId || task.study?.id || '',
        dueDate: dueDateFormatted,
        priority: task.priority || 'MEDIUM',
        assigneeIds: task.assignees?.map(a => a.userId || a.id) || [],
      })
    }
  }, [task])

  // 스터디 선택 시 멤버 목록 가져오기
  useEffect(() => {
    const fetchMembers = async () => {
      if (!formData.studyId) {
        setStudyMembers([])
        return
      }

      setLoadingMembers(true)
      try {
        const response = await fetch(`/api/studies/${formData.studyId}/members`)
        const data = await response.json()

        if (data.success) {
          setStudyMembers(data.data || [])
        } else {
          setStudyMembers([])
        }
      } catch (error) {
        console.error('멤버 목록 로드 실패:', error)
        setStudyMembers([])
      } finally {
        setLoadingMembers(false)
      }
    }

    fetchMembers()
  }, [formData.studyId])

  // 담당자 선택 토글
  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요')
      return
    }

    if (!formData.studyId) {
      alert('스터디를 선택해주세요')
      return
    }

    if (!formData.dueDate) {
      alert('마감일을 선택해주세요')
      return
    }

    if (formData.assigneeIds.length === 0) {
      alert('담당자를 1명 이상 선택해주세요')
      return
    }

    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: {
          title: formData.title,
          description: formData.description || null,
          studyId: formData.studyId,
          dueDate: formData.dueDate,
          priority: formData.priority,
          assigneeIds: formData.assigneeIds,
        }
      })

      alert('할 일이 수정되었습니다!')
      onSuccess()
    } catch (error) {
      console.error('할일 수정 실패:', error)
      alert('할 일 수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 현재 사용자 ID
  const currentUserId = session?.user?.id

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>할 일 수정</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>제목 *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="할 일 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>스터디 *</label>
            <select
              className={styles.select}
              value={formData.studyId}
              onChange={(e) => {
                setFormData({ ...formData, studyId: e.target.value, assigneeIds: [] })
              }}
            >
              <option value="">스터디 선택</option>
              {studies.map(study => (
                <option key={study.id} value={study.id}>
                  {study.emoji} {study.name}
                </option>
              ))}
            </select>
          </div>

          {/* 담당자 선택 */}
          {formData.studyId && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                담당자 * ({formData.assigneeIds.length}명 선택됨)
              </label>
              {loadingMembers ? (
                <div className={styles.memberLoading}>멤버 목록을 불러오는 중...</div>
              ) : studyMembers.length === 0 ? (
                <div className={styles.memberEmpty}>멤버가 없습니다</div>
              ) : (
                <div className={styles.memberList}>
                  {studyMembers.map(member => {
                    const isCurrentUser = member.userId === currentUserId
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
                    )
                  })}
                </div>
              )}
              <p className={styles.helperText}>할일을 수행할 담당자를 1명 이상 선택해주세요</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>우선순위 *</label>
            <select
              className={styles.select}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">낮음</option>
              <option value="MEDIUM">보통</option>
              <option value="HIGH">높음</option>
              <option value="URGENT">긴급</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>마감일 *</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>설명 (선택)</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="할 일에 대한 상세 설명을 입력하세요"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={updateTask.isPending}
            >
              {updateTask.isPending ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
