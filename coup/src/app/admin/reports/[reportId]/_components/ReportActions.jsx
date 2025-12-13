'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import Modal from '@/components/admin/ui/Modal/Modal'
import api from '@/lib/api'
import ReportProcessModal from './ReportProcessModal'
import styles from './ReportActions.module.css'

export default function ReportActions({ report, onUpdate }) {
  const router = useRouter()
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assignToMe, setAssignToMe] = useState(true)

  const canProcess = report.status === 'PENDING' || report.status === 'IN_PROGRESS'
  const isResolved = report.status === 'RESOLVED' || report.status === 'REJECTED'

  // 담당자 배정
  const handleAssign = async () => {
    if (loading) return

    setLoading(true)
    try {
      const data = await api.post(`/api/admin/reports/${report.id}/assign`, {
        autoAssign: !assignToMe,
      })

      if (data.success) {
        setIsAssignModalOpen(false)
        onUpdate?.()
        router.refresh()
      } else {
        alert(data.message || '배정 실패')
      }
    } catch (error) {
      console.error('배정 실패:', error)
      alert('담당자 배정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSuccess = () => {
    onUpdate?.()
    router.refresh()
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>처리 상태</h3>
        <div className={styles.statusInfo}>
          <StatusBadge status={report.status} />
          {report.processedAt && (
            <div className={styles.processedInfo}>
              <span className={styles.processedLabel}>처리 일시</span>
              <span className={styles.processedValue}>
                {new Date(report.processedAt).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 담당자 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>담당자</h3>
        {report.processedBy ? (
          <div className={styles.assigneeInfo}>
            <div className={styles.assigneeName}>
              {report.processedAdmin?.name || '담당자 배정됨'}
            </div>
            {report.processedAdmin?.adminRole && (
              <span className={styles.roleTag}>
                {getRoleLabel(report.processedAdmin.adminRole.role)}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.noAssignee}>
            <span>담당자 미배정</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAssignModalOpen(true)}
            >
              담당자 배정
            </Button>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>처리</h3>
        <div className={styles.actionButtons}>
          {canProcess ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsProcessModalOpen(true)}
            >
              🛡️ 신고 처리하기
            </Button>
          ) : isResolved ? (
            <div className={styles.resolvedMessage}>
              {report.status === 'RESOLVED'
                ? '✅ 이 신고는 승인 처리되었습니다.'
                : '❌ 이 신고는 거부 처리되었습니다.'}
            </div>
          ) : null}
        </div>
      </div>

      {/* 처리 사유 (처리된 경우) */}
      {report.resolution && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>처리 사유</h3>
          <div className={styles.resolutionBox}>
            {report.resolution}
          </div>
        </div>
      )}

      {/* 담당자 배정 모달 */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="담당자 배정"
        size="small"
      >
        <div className={styles.modalContent}>
          <div className={styles.assignOptions}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="assign"
                checked={assignToMe}
                onChange={() => setAssignToMe(true)}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>내가 담당</span>
                <span className={styles.optionDesc}>이 신고를 내가 처리합니다</span>
              </div>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="assign"
                checked={!assignToMe}
                onChange={() => setAssignToMe(false)}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionTitle}>자동 배정</span>
                <span className={styles.optionDesc}>가용한 관리자에게 자동 배정</span>
              </div>
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleAssign} loading={loading}>
              배정하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 신고 처리 모달 */}
      <ReportProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        report={report}
        onSuccess={handleProcessSuccess}
      />
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    PENDING: { label: '대기중', color: 'warning' },
    IN_PROGRESS: { label: '처리중', color: 'primary' },
    RESOLVED: { label: '승인됨', color: 'success' },
    REJECTED: { label: '거부됨', color: 'danger' },
  }

  const config = statusConfig[status] || { label: status, color: 'default' }

  return (
    <span className={`${styles.statusBadge} ${styles[config.color]}`}>
      {config.label}
    </span>
  )
}

function getRoleLabel(role) {
  const labels = {
    SUPER_ADMIN: '최고 관리자',
    ADMIN: '관리자',
    MODERATOR: '중재자',
  }
  return labels[role] || role
}

