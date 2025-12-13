'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardHeader, CardContent } from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import Modal, { ConfirmModal } from '@/components/admin/ui/Modal/Modal'
import api from '@/lib/api'
import styles from './page.module.css'

export default function UserDetailPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [userId, setUserId] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // params에서 id 추출
  useEffect(() => {
    if (params?.id) {
      setUserId(params.id)
    }
  }, [params])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const result = await api.get(`/api/admin/users/${userId}`)

      if (result.success && result.data) {
        setUser(result.data)
      } else {
        setError('사용자를 찾을 수 없습니다')
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/users')
      return
    }

    if (status === 'authenticated' && userId) {
      fetchUser()
    }
  }, [status, userId, router])

  async function handleSuspend() {
    try {
      await api.post(`/api/admin/users/${userId}/suspend`, {
        reason: '관리자에 의한 정지',
        duration: null, // 영구 정지
      })
      alert('사용자가 정지되었습니다')
      fetchUser()
    } catch (err) {
      alert('오류: ' + err.message)
    }
  }

  async function handleActivate() {
    try {
      await api.post(`/api/admin/users/${userId}/activate`)
      alert('사용자가 활성화되었습니다')
      fetchUser()
    } catch (err) {
      alert('오류: ' + err.message)
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/admin/users/${userId}`)
      alert('사용자가 삭제되었습니다')
      router.push('/admin/users')
    } catch (err) {
      alert('오류: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <div className={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p>{error || '사용자를 찾을 수 없습니다'}</p>
              <Button onClick={() => router.push('/admin/users')}>목록으로</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.push('/admin/users')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          목록으로
        </Button>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>편집</Button>
          {user.status === 'ACTIVE' ? (
            <Button variant="warning" onClick={handleSuspend}>정지</Button>
          ) : (
            <Button variant="success" onClick={handleActivate}>활성화</Button>
          )}
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>삭제</Button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Profile Card */}
        <Card className={styles.profileCard}>
          <CardContent>
            <div className={styles.profile}>
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={120}
                  height={120}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
              <div className={styles.profileInfo}>
                <h1 className={styles.name}>{user.name || '이름 없음'}</h1>
                <p className={styles.email}>{user.email}</p>
                <div className={styles.badges}>
                  <Badge variant={getStatusVariant(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                  {user.role === 'ADMIN' && (
                    <Badge variant="primary">관리자</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={styles.grid}>
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <h3>기본 정보</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>사용자 ID</span>
                  <span className={styles.infoValue}>{user.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>이메일</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>이름</span>
                  <span className={styles.infoValue}>{user.name || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>가입일</span>
                  <span className={styles.infoValue}>
                    {new Date(user.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>최근 로그인</span>
                  <span className={styles.infoValue}>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ko-KR') : '없음'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>인증 제공자</span>
                  <span className={styles.infoValue}>{user.provider || 'email'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 활동 통계 */}
          <Card>
            <CardHeader>
              <h3>활동 통계</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statIcon} style={{ backgroundColor: 'var(--pastel-teal-100)', color: 'var(--pastel-teal-600)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>참여 스터디</span>
                    <span className={styles.statValue}>{user._count?.studyMembers || 0}개</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon} style={{ backgroundColor: 'var(--pastel-purple-100)', color: 'var(--pastel-purple-600)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>개설 스터디</span>
                    <span className={styles.statValue}>{user._count?.ownedStudies || 0}개</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon} style={{ backgroundColor: 'var(--pastel-blue-100)', color: 'var(--pastel-blue-600)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>메시지</span>
                    <span className={styles.statValue}>{user._count?.messages || 0}개</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon} style={{ backgroundColor: 'var(--pastel-orange-100)', color: 'var(--pastel-orange-600)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>신고 수신</span>
                    <span className={styles.statValue}>{user._count?.reports || 0}회</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 제재 및 경고 내역 */}
        {(user.sanctions?.length > 0 || user.receivedWarnings?.length > 0) && (
          <div className={styles.historySection}>
            {/* 제재 내역 */}
            {user.sanctions?.length > 0 && (
              <Card>
                <CardHeader>
                  <h3>제재 내역</h3>
                </CardHeader>
                <CardContent>
                  <div className={styles.historyList}>
                    {user.sanctions.map((sanction) => (
                      <div key={sanction.id} className={styles.historyItem}>
                        <div className={styles.historyIcon}>
                          <Badge variant="danger">제재</Badge>
                        </div>
                        <div className={styles.historyContent}>
                          <div className={styles.historyTitle}>{sanction.reason}</div>
                          <div className={styles.historyMeta}>
                            {new Date(sanction.createdAt).toLocaleString('ko-KR')}
                            {sanction.expiresAt && (
                              <span> • 만료: {new Date(sanction.expiresAt).toLocaleString('ko-KR')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 경고 내역 */}
            {user.receivedWarnings?.length > 0 && (
              <Card>
                <CardHeader>
                  <h3>경고 내역</h3>
                </CardHeader>
                <CardContent>
                  <div className={styles.historyList}>
                    {user.receivedWarnings.map((warning) => (
                      <div key={warning.id} className={styles.historyItem}>
                        <div className={styles.historyIcon}>
                          <Badge variant="warning">경고</Badge>
                        </div>
                        <div className={styles.historyContent}>
                          <div className={styles.historyTitle}>{warning.reason}</div>
                          <div className={styles.historyMeta}>
                            {new Date(warning.createdAt).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal (준비중) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="사용자 편집"
        size="md"
      >
        <p>편집 기능은 준비 중입니다.</p>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="사용자 삭제"
        message={`정말 "${user.name || user.email}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}

function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    BANNED: 'danger',
    PENDING: 'default',
  }
  return variants[status] || 'default'
}

function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    SUSPENDED: '정지',
    BANNED: '차단',
    PENDING: '대기',
  }
  return labels[status] || status
}

