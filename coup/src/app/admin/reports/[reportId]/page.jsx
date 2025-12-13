'use client'

/**
 * 관리자 - 신고 상세 페이지
 * /admin/reports/[reportId]
 */

import { useEffect, useState, useCallback, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import ReportActions from './_components/ReportActions'
import styles from './page.module.css'

// 날짜 포맷
function formatDateTime(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 신고 유형 한글
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

// 상태 한글
function getStatusLabel(status) {
  const labels = {
    PENDING: '대기중',
    IN_PROGRESS: '처리중',
    RESOLVED: '해결됨',
    REJECTED: '거부됨',
  }
  return labels[status] || status
}

// 우선순위 한글
function getPriorityLabel(priority) {
  const labels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  }
  return labels[priority] || priority
}

// 대상 유형 한글
function getTargetTypeLabel(targetType) {
  const labels = {
    USER: '사용자',
    STUDY: '스터디',
    MESSAGE: '메시지',
  }
  return labels[targetType] || targetType
}

// 우선순위 색상
const PRIORITY_COLORS = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'danger',
}

// 상태 색상
const STATUS_COLORS = {
  PENDING: 'warning',
  IN_PROGRESS: 'primary',
  RESOLVED: 'success',
  REJECTED: 'default',
}

export default function ReportDetailPage({ params }) {
  // Next.js 15에서 params는 Promise이므로 React.use()로 언래핑
  const { reportId } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [relatedReports, setRelatedReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReportDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.get(`/api/admin/reports/${reportId}`)

      if (result.success && result.data) {
        setReport(result.data.report || result.data)
        setRelatedReports(result.data.relatedReports || [])
      } else {
        setError(result.error || '신고 정보를 불러올 수 없습니다')
      }
    } catch (err) {
      console.error('Failed to fetch report detail:', err)
      setError(err.message || '신고 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/reports/' + reportId)
      return
    }

    if (status === 'authenticated') {
      fetchReportDetail()
    }
  }, [status, reportId, router, fetchReportDetail])

  // 로딩 상태
  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/reports" className={styles.backLink}>
            ← 신고 목록
          </Link>
        </div>
        <Card>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>신고 정보를 불러오는 중...</p>
          </div>
        </Card>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/reports" className={styles.backLink}>
            ← 신고 목록
          </Link>
        </div>
        <Card>
          <div className={styles.errorState}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <h2>오류 발생</h2>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <Button onClick={fetchReportDetail} variant="primary">다시 시도</Button>
              <Link href="/admin/reports">
                <Button variant="outline">목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link href="/admin/reports" className={styles.backLink}>
          ← 신고 목록
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>신고 상세</h1>
            <p className={styles.subtitle}>신고 ID: {report.id}</p>
          </div>
          <div className={styles.badges}>
            <Badge variant={STATUS_COLORS[report.status]}>
              {getStatusLabel(report.status)}
            </Badge>
            <Badge variant={PRIORITY_COLORS[report.priority]}>
              {getPriorityLabel(report.priority)}
            </Badge>
          </div>
        </div>
      </div>

      {/* 레이아웃 */}
      <div className={styles.layout}>
        {/* 왼쪽: 신고 정보 */}
        <div className={styles.mainContent}>
          {/* 신고 기본 정보 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>신고 정보</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>신고 유형</span>
                <span className={styles.infoValue}>{getTypeLabel(report.type)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>접수 일시</span>
                <span className={styles.infoValue}>{formatDateTime(report.createdAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>대상 유형</span>
                <span className={styles.infoValue}>{getTargetTypeLabel(report.targetType)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>대상</span>
                <span className={styles.infoValue}>{report.targetName || report.targetId}</span>
              </div>
            </div>
          </div>

          {/* 신고 사유 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>신고 사유</h2>
            <div className={styles.reasonBox}>
              {report.reason || '사유 없음'}
            </div>
          </div>

          {/* 증거 자료 */}
          {report.evidence && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>증거 자료</h2>
              <div className={styles.evidenceBox}>
                <pre className={styles.evidenceContent}>
                  {JSON.stringify(report.evidence, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 신고자 정보 */}
          {report.reporter && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>신고자 정보</h2>
              <div className={styles.userCard}>
                <div className={styles.userAvatar}>
                  {report.reporter.avatar ? (
                    <Image src={report.reporter.avatar} alt={report.reporter.name || '신고자'} width={64} height={64} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>👤</div>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{report.reporter.name || '이름 없음'}</div>
                  <div className={styles.userEmail}>{report.reporter.email}</div>
                  {report.reporterHistory && (
                    <div className={styles.userMeta}>
                      총 신고 횟수: {report.reporterHistory.totalReports || 0}회
                    </div>
                  )}
                </div>
                <Link href={`/admin/users/${report.reporter.id}`}>
                  <Button size="sm" variant="outline">사용자 상세</Button>
                </Link>
              </div>
            </div>
          )}

          {/* 신고 대상 정보 */}
          {report.target && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>신고 대상</h2>
              {report.targetType === 'USER' && (
                <div className={styles.userCard}>
                  <div className={styles.userAvatar}>
                    {report.target.avatar ? (
                      <Image src={report.target.avatar} alt={report.target.name || '대상'} width={64} height={64} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>👤</div>
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{report.target.name || '이름 없음'}</div>
                    <div className={styles.userEmail}>{report.target.email}</div>
                    <div className={styles.userMeta}>
                      상태: {report.target.status} | 받은 신고: {report.targetReportCount || 0}회
                    </div>
                  </div>
                  <Link href={`/admin/users/${report.target.id}`}>
                    <Button size="sm" variant="outline">사용자 상세</Button>
                  </Link>
                </div>
              )}
              {report.targetType === 'STUDY' && (
                <div className={styles.studyCard}>
                  <div className={styles.studyEmoji}>{report.target.emoji || '📚'}</div>
                  <div className={styles.studyInfo}>
                    <div className={styles.studyName}>{report.target.name}</div>
                    <div className={styles.studyDescription}>{report.target.description}</div>
                    <div className={styles.studyMeta}>
                      멤버: {report.target._count?.members || 0}명 | 메시지: {report.target._count?.messages || 0}개
                    </div>
                  </div>
                  <Link href={`/admin/studies/${report.target.id}`}>
                    <Button size="sm" variant="outline">스터디 상세</Button>
                  </Link>
                </div>
              )}
              {report.targetType === 'MESSAGE' && (
                <div className={styles.messageCard}>
                  <div className={styles.messageContent}>{report.target.content}</div>
                  <div className={styles.messageMeta}>
                    작성자: {report.target.user?.name || '알 수 없음'} | 스터디: {report.target.study?.name || '알 수 없음'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 처리 정보 */}
          {report.processedBy && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>처리 정보</h2>
              <div className={styles.processInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>처리자</span>
                  <span className={styles.infoValue}>
                    {report.processedAdmin?.name || report.processedBy}
                    {report.processedAdmin?.adminRole && (
                      <span className={styles.roleTag}>
                        {report.processedAdmin.adminRole.role}
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>처리 일시</span>
                  <span className={styles.infoValue}>{formatDateTime(report.processedAt)}</span>
                </div>
                {report.resolution && (
                  <div className={styles.resolutionBox}>
                    <div className={styles.resolutionLabel}>처리 사유</div>
                    <div className={styles.resolutionContent}>{report.resolution}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 관련 신고 */}
          {relatedReports && relatedReports.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>동일 대상 관련 신고 ({relatedReports.length}건)</h2>
              <div className={styles.relatedReports}>
                {relatedReports.map(related => (
                  <Link
                    key={related.id}
                    href={`/admin/reports/${related.id}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedHeader}>
                      <Badge variant={PRIORITY_COLORS[related.priority]}>
                        {getPriorityLabel(related.priority)}
                      </Badge>
                      <Badge variant={STATUS_COLORS[related.status]}>
                        {getStatusLabel(related.status)}
                      </Badge>
                    </div>
                    <div className={styles.relatedReason}>
                      {related.reason?.substring(0, 80) || '사유 없음'}...
                    </div>
                    <div className={styles.relatedMeta}>
                      {formatDateTime(related.createdAt)} | {related.reporter?.name || '알 수 없음'}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 액션 패널 */}
        <div className={styles.sidebar}>
          <ReportActions report={report} onUpdate={fetchReportDetail} />
        </div>
      </div>
    </div>
  )
}

