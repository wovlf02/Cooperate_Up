'use client'

import { useState, useEffect, useCallback } from 'react'
import Badge from '@/components/admin/ui/Badge'
import Modal from '@/components/admin/ui/Modal'
import api from '@/lib/api'
import styles from './LogTable.module.css'

const actionLabels = {
  USER_VIEW: '사용자 조회',
  USER_SEARCH: '사용자 검색',
  USER_WARN: '경고 부여',
  USER_SUSPEND: '사용자 정지',
  USER_UNSUSPEND: '정지 해제',
  USER_DELETE: '사용자 삭제',
  STUDY_VIEW: '스터디 조회',
  STUDY_HIDE: '스터디 숨김',
  STUDY_CLOSE: '스터디 종료',
  STUDY_DELETE: '스터디 삭제',
  REPORT_VIEW: '신고 조회',
  REPORT_ASSIGN: '담당자 배정',
  REPORT_RESOLVE: '신고 해결',
  REPORT_REJECT: '신고 거부',
  SETTINGS_VIEW: '설정 조회',
  SETTINGS_UPDATE: '설정 업데이트',
  SETTINGS_CACHE_CLEAR: '캐시 초기화',
  AUDIT_VIEW: '로그 조회',
  AUDIT_EXPORT: '로그 내보내기'
}

const actionColors = {
  USER_VIEW: 'blue',
  USER_WARN: 'warning',
  USER_SUSPEND: 'danger',
  USER_UNSUSPEND: 'success',
  USER_DELETE: 'danger',
  STUDY_HIDE: 'warning',
  STUDY_CLOSE: 'warning',
  STUDY_DELETE: 'danger',
  REPORT_RESOLVE: 'success',
  REPORT_REJECT: 'secondary',
  SETTINGS_UPDATE: 'primary',
  SETTINGS_CACHE_CLEAR: 'secondary'
}

export default function LogTable() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [filters] = useState({})

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)

      const params = { page, limit: 20 }
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key]
        }
      })

      const data = await api.get('/api/admin/audit-logs', params)

      if (data.success) {
        setLogs(data.data.logs)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('로그 불러오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  if (loading && logs.length === 0) {
    return <div className={styles.loading}>로그를 불러오는 중...</div>
  }

  return (
    <>
      <div className={styles.container}>
        {logs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <p>감사 로그가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>관리자</th>
                    <th>액션</th>
                    <th>대상</th>
                    <th>IP 주소</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className={styles.date}>
                        {new Date(log.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td>
                        <div className={styles.admin}>
                          <div className={styles.avatar}>
                            {log.admin.name?.[0] || '?'}
                          </div>
                          <div className={styles.adminInfo}>
                            <div className={styles.adminName}>
                              {log.admin.name || '알 수 없음'}
                            </div>
                            <div className={styles.adminEmail}>
                              {log.admin.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge variant={actionColors[log.action] || 'secondary'}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </td>

                      <td>
                        {log.targetType ? (
                          <div className={styles.target}>
                            <span className={styles.targetType}>
                              {log.targetType}
                            </span>
                            {log.targetId && (
                              <span className={styles.targetId}>
                                {log.targetId.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={styles.noData}>-</span>
                        )}
                      </td>

                      <td className={styles.ip}>
                        {log.ipAddress || '-'}
                      </td>

                      <td>
                        <button
                          className={styles.detailButton}
                          onClick={() => setSelectedLog(log)}
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </button>

                <span className={styles.pageInfo}>
                  {page} / {pagination.totalPages} 페이지 (전체 {pagination.total}건)
                </span>

                <button
                  className={styles.pageButton}
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasMore}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="로그 상세 정보"
        >
          <div className={styles.detail}>
            <div className={styles.detailSection}>
              <h3>기본 정보</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>일시</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedLog.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>관리자</span>
                  <span className={styles.detailValue}>
                    {selectedLog.admin.name} ({selectedLog.admin.email})
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>액션</span>
                  <span className={styles.detailValue}>
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>IP 주소</span>
                  <span className={styles.detailValue}>
                    {selectedLog.ipAddress || '-'}
                  </span>
                </div>
              </div>
            </div>

            {selectedLog.targetType && (
              <div className={styles.detailSection}>
                <h3>대상 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>타입</span>
                    <span className={styles.detailValue}>
                      {selectedLog.targetType}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ID</span>
                    <span className={styles.detailValue}>
                      {selectedLog.targetId || '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedLog.reason && (
              <div className={styles.detailSection}>
                <h3>사유</h3>
                <div className={styles.reasonBox}>
                  {selectedLog.reason}
                </div>
              </div>
            )}

            {(selectedLog.before || selectedLog.after) && (
              <div className={styles.detailSection}>
                <h3>변경 내역</h3>
                <div className={styles.jsonBox}>
                  {selectedLog.before && (
                    <div>
                      <strong>이전:</strong>
                      <pre>{JSON.stringify(selectedLog.before, null, 2)}</pre>
                    </div>
                  )}
                  {selectedLog.after && (
                    <div>
                      <strong>이후:</strong>
                      <pre>{JSON.stringify(selectedLog.after, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedLog.userAgent && (
              <div className={styles.detailSection}>
                <h3>User Agent</h3>
                <div className={styles.userAgentBox}>
                  {selectedLog.userAgent}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

