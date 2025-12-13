/**
 * 스터디 액션 컴포넌트
 * Client Component - 스터디 관리 액션 (숨김, 종료, 삭제)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import Modal from '@/components/admin/ui/Modal'
import api from '@/lib/api'
import styles from './StudyActions.module.css'

export default function StudyActions({ studyId, study }) {
  const router = useRouter()

  const [showHideModal, setShowHideModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [reason, setReason] = useState('')
  const [notifyOwner, setNotifyOwner] = useState(true)
  const [notifyMembers, setNotifyMembers] = useState(false)
  const [loading, setLoading] = useState(false)

  // 스터디 숨김
  const handleHide = async () => {
    if (reason.trim().length < 10) {
      alert('숨김 사유는 최소 10자 이상 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const data = await api.post(`/api/admin/studies/${studyId}/hide`, {
        reason: reason.trim(),
        notifyOwner,
        notifyMembers,
      })

      if (data.success) {
        alert('스터디가 숨김 처리되었습니다')
        setShowHideModal(false)
        setReason('')
        router.refresh()
      } else {
        alert(data.error || '숨김 처리에 실패했습니다')
      }
    } catch (error) {
      console.error('숨김 처리 오류:', error)
      alert('숨김 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 스터디 숨김 해제
  const handleUnhide = async () => {
    if (!confirm('스터디 숨김을 해제하시겠습니까?')) return

    setLoading(true)
    try {
      const data = await api.delete(`/api/admin/studies/${studyId}/hide`)

      if (data.success) {
        alert('스터디 숨김이 해제되었습니다')
        router.refresh()
      } else {
        alert(data.error || '숨김 해제에 실패했습니다')
      }
    } catch (error) {
      console.error('숨김 해제 오류:', error)
      alert('숨김 해제 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 스터디 종료
  const handleClose = async () => {
    if (reason.trim().length < 10) {
      alert('종료 사유는 최소 10자 이상 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const data = await api.post(`/api/admin/studies/${studyId}/close`, {
        reason: reason.trim(),
        notifyOwner,
        notifyMembers,
      })

      if (data.success) {
        alert('스터디가 종료되었습니다')
        setShowCloseModal(false)
        setReason('')
        router.refresh()
      } else {
        alert(data.error || '종료 처리에 실패했습니다')
      }
    } catch (error) {
      console.error('종료 처리 오류:', error)
      alert('종료 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 스터디 재개
  const handleReopen = async () => {
    if (!confirm('스터디를 재개하시겠습니까?')) return

    setLoading(true)
    try {
      const data = await api.delete(`/api/admin/studies/${studyId}/close`)

      if (data.success) {
        alert('스터디가 재개되었습니다')
        router.refresh()
      } else {
        alert(data.error || '재개에 실패했습니다')
      }
    } catch (error) {
      console.error('재개 오류:', error)
      alert('재개 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 스터디 삭제
  const handleDelete = async () => {
    if (reason.trim().length < 10) {
      alert('삭제 사유는 최소 10자 이상 입력해주세요')
      return
    }

    const confirmText = prompt(
      '정말로 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.\n계속하려면 "DELETE"를 입력하세요:'
    )

    if (confirmText !== 'DELETE') {
      alert('삭제가 취소되었습니다')
      return
    }

    setLoading(true)
    try {
      const data = await api.delete(`/api/admin/studies/${studyId}/delete`, {
        reason: reason.trim()
      })

      if (data.success) {
        alert('스터디가 삭제되었습니다')
        router.push('/admin/studies')
      } else {
        alert(data.error || '삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 모달 닫기 핸들러
  const closeHideModal = () => {
    setShowHideModal(false)
    setReason('')
    setNotifyOwner(true)
    setNotifyMembers(false)
  }

  const closeCloseModal = () => {
    setShowCloseModal(false)
    setReason('')
    setNotifyOwner(true)
    setNotifyMembers(false)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setReason('')
  }

  const isHidden = !study.settings.isPublic && !study.settings.isRecruiting

  return (
    <div className={styles.actions}>
      {/* 숨김/숨김 해제 */}
      {isHidden ? (
        <Button
          variant="success"
          onClick={handleUnhide}
          loading={loading}
          disabled={loading}
        >
          숨김 해제
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setShowHideModal(true)}
          disabled={loading}
        >
          숨김 처리
        </Button>
      )}

      {/* 종료/재개 */}
      {isHidden ? (
        <Button
          variant="primary"
          onClick={handleReopen}
          loading={loading}
          disabled={loading}
        >
          재개
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setShowCloseModal(true)}
          disabled={loading}
        >
          종료
        </Button>
      )}

      {/* 삭제 */}
      <Button
        variant="danger"
        onClick={() => setShowDeleteModal(true)}
        disabled={loading}
      >
        삭제
      </Button>

      {/* 숨김 모달 */}
      <Modal
        isOpen={showHideModal}
        onClose={closeHideModal}
        title="스터디 숨김 처리"
        size="medium"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            이 스터디를 검색 결과에서 숨깁니다.
            <br />
            스터디장과 멤버는 계속 이용할 수 있습니다.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              숨김 사유 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="숨김 사유를 10자 이상 입력해주세요"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notifyOwner}
                onChange={(e) => setNotifyOwner(e.target.checked)}
              />
              <span>스터디장에게 알림 보내기</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notifyMembers}
                onChange={(e) => setNotifyMembers(e.target.checked)}
              />
              <span>모든 멤버에게 알림 보내기</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={closeHideModal}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleHide}
              loading={loading}
              disabled={loading || reason.trim().length < 10}
            >
              숨김 처리
            </Button>
          </div>
        </div>
      </Modal>

      {/* 종료 모달 */}
      <Modal
        isOpen={showCloseModal}
        onClose={closeCloseModal}
        title="스터디 강제 종료"
        size="medium"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            이 스터디를 강제로 종료합니다.
            <br />
            모든 활동이 중단되며 읽기 전용 모드로 전환됩니다.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              종료 사유 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="종료 사유를 10자 이상 입력해주세요"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notifyOwner}
                onChange={(e) => setNotifyOwner(e.target.checked)}
              />
              <span>스터디장에게 알림 보내기</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={notifyMembers}
                onChange={(e) => setNotifyMembers(e.target.checked)}
              />
              <span>모든 멤버에게 알림 보내기</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={closeCloseModal}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleClose}
              loading={loading}
              disabled={loading || reason.trim().length < 10}
            >
              종료
            </Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="⚠️ 스터디 삭제"
        size="medium"
      >
        <div className={styles.modalContent}>
          <div className={styles.dangerAlert}>
            <strong>경고:</strong> 이 작업은 되돌릴 수 없습니다!
            <br />
            모든 메시지, 파일, 데이터가 영구적으로 삭제됩니다.
          </div>

          <div className={styles.studyInfo}>
            <div className={styles.studyInfoItem}>
              <span>스터디:</span>
              <strong>{study.name}</strong>
            </div>
            <div className={styles.studyInfoItem}>
              <span>멤버:</span>
              <strong>{study.memberStats.total}명</strong>
            </div>
            <div className={styles.studyInfoItem}>
              <span>메시지:</span>
              <strong>{study.activityStats.messages}개</strong>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              삭제 사유 <span className={styles.required}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="삭제 사유를 10자 이상 입력해주세요"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={closeDeleteModal}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              disabled={loading || reason.trim().length < 10}
            >
              영구 삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

