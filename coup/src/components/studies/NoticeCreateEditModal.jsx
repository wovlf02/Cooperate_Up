'use client'

import { useState, useEffect } from 'react'
import { useCreateNotice, useUpdateNotice } from '@/lib/hooks/useApi'
import styles from './NoticeCreateEditModal.module.css'

export default function NoticeCreateEditModal({ studyId, notice, onClose, onSuccess }) {
  const isEditMode = !!notice
  const createNotice = useCreateNotice()
  const updateNotice = useUpdateNotice()

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    isPinned: notice?.isPinned || false,
    isImportant: notice?.isImportant || false
  })
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 유효성 검사
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요'
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // 공지사항 생성/수정
      if (isEditMode) {
        await updateNotice.mutateAsync({
          studyId,
          noticeId: notice.id,
          data: formData
        })
        alert('공지사항이 수정되었습니다!')
      } else {
        await createNotice.mutateAsync({
          studyId,
          data: formData
        })
        alert('공지사항이 작성되었습니다!')
      }

      onSuccess()
    } catch (error) {
      console.error('공지 저장 실패:', error)
      alert('공지사항 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? '공지사항 수정' : '공지사항 작성'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 제목 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
              placeholder="공지사항 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={100}
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title}</span>
            )}
            <span className={styles.charCount}>{formData.title.length}/100</span>
          </div>

          {/* 내용 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              내용 <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
              placeholder="공지사항 내용을 입력하세요"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={10}
            />
            {errors.content && (
              <span className={styles.errorMessage}>{errors.content}</span>
            )}
          </div>

          {/* 옵션 */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleChange('isPinned', e.target.checked)}
              />
              <span>📌 상단 고정</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => handleChange('isImportant', e.target.checked)}
              />
              <span>⭐ 중요 공지</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={createNotice.isPending || updateNotice.isPending}
            >
              {createNotice.isPending || updateNotice.isPending
                ? '저장 중...'
                : isEditMode
                ? '수정하기'
                : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
