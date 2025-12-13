'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import styles from './SettingsHistory.module.css'

export default function SettingsHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/admin/settings/history', {
        page,
        limit: 10
      })

      if (data.success) {
        setLogs(data.data.logs)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('이력 불러오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading && logs.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>📜 변경 이력</h2>
        <div className={styles.loading}>이력을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📜 변경 이력</h2>

      {logs.length === 0 ? (
        <div className={styles.empty}>
          변경 이력이 없습니다.
        </div>
      ) : (
        <>
          <div className={styles.timeline}>
            {logs.map(log => (
              <div key={log.id} className={styles.item}>
                <div className={styles.dot} />

                <div className={styles.content}>
                  <div className={styles.header}>
                    <div className={styles.admin}>
                      <div className={styles.avatar}>
                        {log.admin.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className={styles.name}>{log.admin.name}</div>
                        <div className={styles.email}>{log.admin.email}</div>
                      </div>
                    </div>

                    <div className={styles.date}>
                      {new Date(log.createdAt).toLocaleString('ko-KR')}
                    </div>
                  </div>

                  <div className={styles.changes}>
                    <div className={styles.reason}>{log.reason}</div>

                    {log.settings && log.settings.length > 0 && (
                      <div className={styles.settingsList}>
                        {log.settings.map((setting, idx) => (
                          <div key={idx} className={styles.settingItem}>
                            <span className={styles.key}>{setting.key}</span>
                            <span className={styles.arrow}>→</span>
                            <span className={styles.value}>
                              {String(setting.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {log.ipAddress && (
                    <div className={styles.meta}>
                      IP: {log.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                {page} / {pagination.totalPages}
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
  )
}

