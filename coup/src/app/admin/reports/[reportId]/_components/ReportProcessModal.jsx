'use client'

import { useState } from 'react'
import Modal from '@/components/admin/ui/Modal/Modal'
import Button from '@/components/admin/ui/Button'
import Badge from '@/components/admin/ui/Badge'
import api from '@/lib/api'
import styles from './ReportProcessModal.module.css'

/**
 * 신고 처리 모달
 * 관리자가 신고를 승인/거부/보류 처리하고 연계 제재를 부과할 수 있음
 */
export default function ReportProcessModal({
  isOpen,
  onClose,
  report,
  onSuccess
}) {
  const [step, setStep] = useState(1) // 1: 처리 선택, 2: 상세 설정, 3: 확인
  const [action, setAction] = useState(null) // 'approve', 'reject', 'hold'
  const [resolution, setResolution] = useState('')
  const [linkedAction, setLinkedAction] = useState('none')
  const [linkedActionDetails, setLinkedActionDetails] = useState({
    severity: 'NORMAL',
    duration: '7d',
    restrictType: 'all'
  })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  if (!report) return null

  const handleActionSelect = (selectedAction) => {
    setAction(selectedAction)
    if (selectedAction === 'approve' && report.targetType === 'USER') {
      setStep(2)
    } else if (selectedAction === 'approve') {
      setStep(2)
    } else {
      setStep(3)
    }
  }

  const handleLinkedActionSelect = (selectedLinkedAction) => {
    setLinkedAction(selectedLinkedAction)
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!resolution.trim()) {
      setError('처리 사유를 입력해주세요.')
      return
    }

    try {
      setProcessing(true)
      setError(null)

      const result = await api.post(`/api/admin/reports/${report.id}/process`, {
        action,
        resolution: resolution.trim(),
        linkedAction: action === 'approve' ? linkedAction : 'none',
        linkedActionDetails: action === 'approve' && linkedAction !== 'none'
          ? linkedActionDetails
          : null
      })

      if (result.success) {
        onSuccess?.(result.data)
        handleClose()
      } else {
        setError(result.message || '처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('Report process error:', err)
      setError(err.message || '처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setAction(null)
    setResolution('')
    setLinkedAction('none')
    setLinkedActionDetails({
      severity: 'NORMAL',
      duration: '7d',
      restrictType: 'all'
    })
    setError(null)
    onClose()
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setAction(null)
    } else if (step === 3) {
      if (action === 'approve') {
        setStep(2)
      } else {
        setStep(1)
        setAction(null)
      }
    }
  }

  const getActionLabel = (act) => {
    const labels = {
      approve: '승인 (제재 조치)',
      reject: '거부 (허위 신고)',
      hold: '보류 (추가 검토 필요)'
    }
    return labels[act] || act
  }

  const getLinkedActionLabel = (la) => {
    const labels = {
      none: '조치 없음',
      warn_user: '경고 부여',
      suspend_user: '계정 정지',
      restrict_user: '활동 제한',
      delete_content: '콘텐츠 삭제'
    }
    return labels[la] || la
  }

  const getSeverityLabel = (sev) => {
    const labels = {
      MINOR: '경미',
      NORMAL: '보통',
      MAJOR: '심각',
      CRITICAL: '매우 심각'
    }
    return labels[sev] || sev
  }

  const getDurationLabel = (dur) => {
    const labels = {
      '1d': '1일',
      '3d': '3일',
      '7d': '7일',
      '14d': '14일',
      '30d': '30일',
      '90d': '90일',
      'permanent': '영구'
    }
    return labels[dur] || dur
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`신고 처리 - ${step === 1 ? '처리 방법 선택' : step === 2 ? '제재 설정' : '최종 확인'}`}
      size="large"
    >
      <div className={styles.container}>
        {/* 진행 표시기 */}
        <div className={styles.stepper}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <span>처리 선택</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <span>제재 설정</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>3</div>
            <span>최종 확인</span>
          </div>
        </div>

        {/* 신고 요약 */}
        <div className={styles.reportSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>신고 유형</span>
            <Badge variant="warning">{getTypeLabel(report.type)}</Badge>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>대상</span>
            <span>{getTargetTypeLabel(report.targetType)}: {report.targetName || report.targetId}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>신고 사유</span>
            <span className={styles.reason}>{report.reason}</span>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 1: 처리 방법 선택 */}
        {step === 1 && (
          <div className={styles.actionSelection}>
            <h3 className={styles.sectionTitle}>처리 방법을 선택하세요</h3>

            <div className={styles.actionCards}>
              <button
                className={`${styles.actionCard} ${styles.approve}`}
                onClick={() => handleActionSelect('approve')}
              >
                <div className={styles.actionIcon}>✓</div>
                <div className={styles.actionTitle}>승인</div>
                <div className={styles.actionDesc}>
                  신고를 승인하고 대상에게 제재를 부과합니다
                </div>
              </button>

              <button
                className={`${styles.actionCard} ${styles.reject}`}
                onClick={() => handleActionSelect('reject')}
              >
                <div className={styles.actionIcon}>✕</div>
                <div className={styles.actionTitle}>거부</div>
                <div className={styles.actionDesc}>
                  허위 또는 부당한 신고로 판단하여 거부합니다
                </div>
              </button>

              <button
                className={`${styles.actionCard} ${styles.hold}`}
                onClick={() => handleActionSelect('hold')}
              >
                <div className={styles.actionIcon}>⏸</div>
                <div className={styles.actionTitle}>보류</div>
                <div className={styles.actionDesc}>
                  추가 검토가 필요하여 처리를 보류합니다
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 제재 설정 */}
        {step === 2 && (
          <div className={styles.linkedActionSelection}>
            <h3 className={styles.sectionTitle}>제재 조치를 선택하세요</h3>

            {report.targetType === 'USER' && (
              <div className={styles.linkedActionCards}>
                <button
                  className={`${styles.linkedCard} ${linkedAction === 'none' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('none')}
                >
                  <div className={styles.linkedIcon}>🔔</div>
                  <div className={styles.linkedTitle}>조치 없음</div>
                  <div className={styles.linkedDesc}>경고 없이 신고만 승인 처리</div>
                </button>

                <button
                  className={`${styles.linkedCard} ${linkedAction === 'warn_user' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('warn_user')}
                >
                  <div className={styles.linkedIcon}>⚠️</div>
                  <div className={styles.linkedTitle}>경고 부여</div>
                  <div className={styles.linkedDesc}>경고 누적 시 자동 제재</div>
                </button>

                <button
                  className={`${styles.linkedCard} ${linkedAction === 'restrict_user' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('restrict_user')}
                >
                  <div className={styles.linkedIcon}>🚫</div>
                  <div className={styles.linkedTitle}>활동 제한</div>
                  <div className={styles.linkedDesc}>특정 기능 사용 제한</div>
                </button>

                <button
                  className={`${styles.linkedCard} ${linkedAction === 'suspend_user' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('suspend_user')}
                >
                  <div className={styles.linkedIcon}>🔒</div>
                  <div className={styles.linkedTitle}>계정 정지</div>
                  <div className={styles.linkedDesc}>로그인 및 모든 활동 차단</div>
                </button>
              </div>
            )}

            {(report.targetType === 'STUDY' || report.targetType === 'MESSAGE') && (
              <div className={styles.linkedActionCards}>
                <button
                  className={`${styles.linkedCard} ${linkedAction === 'none' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('none')}
                >
                  <div className={styles.linkedIcon}>🔔</div>
                  <div className={styles.linkedTitle}>조치 없음</div>
                  <div className={styles.linkedDesc}>신고만 승인 처리</div>
                </button>

                <button
                  className={`${styles.linkedCard} ${linkedAction === 'delete_content' ? styles.selected : ''}`}
                  onClick={() => handleLinkedActionSelect('delete_content')}
                >
                  <div className={styles.linkedIcon}>🗑️</div>
                  <div className={styles.linkedTitle}>콘텐츠 삭제</div>
                  <div className={styles.linkedDesc}>해당 콘텐츠를 삭제합니다</div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: 최종 확인 */}
        {step === 3 && (
          <div className={styles.confirmation}>
            <h3 className={styles.sectionTitle}>처리 내용 확인</h3>

            <div className={styles.confirmationBox}>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>처리 방법</span>
                <Badge variant={action === 'approve' ? 'success' : action === 'reject' ? 'danger' : 'warning'}>
                  {getActionLabel(action)}
                </Badge>
              </div>

              {action === 'approve' && linkedAction !== 'none' && (
                <>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmLabel}>제재 조치</span>
                    <Badge variant="danger">{getLinkedActionLabel(linkedAction)}</Badge>
                  </div>

                  {linkedAction === 'warn_user' && (
                    <div className={styles.detailsSection}>
                      <label className={styles.detailLabel}>경고 심각도</label>
                      <div className={styles.radioGroup}>
                        {['MINOR', 'NORMAL', 'MAJOR', 'CRITICAL'].map(sev => (
                          <label key={sev} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="severity"
                              value={sev}
                              checked={linkedActionDetails.severity === sev}
                              onChange={(e) => setLinkedActionDetails(prev => ({
                                ...prev,
                                severity: e.target.value
                              }))}
                            />
                            {getSeverityLabel(sev)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {(linkedAction === 'suspend_user' || linkedAction === 'restrict_user') && (
                    <div className={styles.detailsSection}>
                      <label className={styles.detailLabel}>제재 기간</label>
                      <div className={styles.radioGroup}>
                        {['1d', '3d', '7d', '14d', '30d', '90d', 'permanent'].map(dur => (
                          <label key={dur} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="duration"
                              value={dur}
                              checked={linkedActionDetails.duration === dur}
                              onChange={(e) => setLinkedActionDetails(prev => ({
                                ...prev,
                                duration: e.target.value
                              }))}
                            />
                            {getDurationLabel(dur)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {linkedAction === 'restrict_user' && (
                    <div className={styles.detailsSection}>
                      <label className={styles.detailLabel}>제한 유형</label>
                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={linkedActionDetails.restrictType === 'all' || linkedActionDetails.restrictStudyCreate}
                            onChange={(e) => setLinkedActionDetails(prev => ({
                              ...prev,
                              restrictStudyCreate: e.target.checked
                            }))}
                          />
                          스터디 생성 제한
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={linkedActionDetails.restrictType === 'all' || linkedActionDetails.restrictStudyJoin}
                            onChange={(e) => setLinkedActionDetails(prev => ({
                              ...prev,
                              restrictStudyJoin: e.target.checked
                            }))}
                          />
                          스터디 가입 제한
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={linkedActionDetails.restrictType === 'all' || linkedActionDetails.restrictMessage}
                            onChange={(e) => setLinkedActionDetails(prev => ({
                              ...prev,
                              restrictMessage: e.target.checked
                            }))}
                          />
                          메시지 전송 제한
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.resolutionSection}>
              <label className={styles.resolutionLabel}>
                처리 사유 <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.resolutionInput}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="처리 사유를 상세히 입력해주세요. (신고자와 대상자에게 전달될 수 있습니다)"
                rows={4}
              />
            </div>

            {action === 'approve' && linkedAction === 'suspend_user' && (
              <div className={styles.warningBox}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>주의:</strong> 계정 정지 시 해당 사용자는 즉시 로그아웃되며,
                  정지 기간 동안 로그인할 수 없습니다.
                </div>
              </div>
            )}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className={styles.actions}>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={processing}>
              이전
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            취소
          </Button>
          {step === 3 && (
            <Button
              variant={action === 'approve' ? 'success' : action === 'reject' ? 'danger' : 'primary'}
              onClick={handleSubmit}
              loading={processing}
            >
              {processing ? '처리 중...' : '처리 완료'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// 헬퍼 함수들
function getTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절한 콘텐츠',
    COPYRIGHT: '저작권 침해',
    OTHER: '기타',
  }
  return labels[type] || type
}

function getTargetTypeLabel(targetType) {
  const labels = {
    USER: '사용자',
    STUDY: '스터디',
    MESSAGE: '메시지',
  }
  return labels[targetType] || targetType
}

