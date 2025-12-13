'use client'

/**
 * 관리자 - 스터디 상세 페이지
 * /admin/studies/[studyId]
 */

import { useEffect, useState, useCallback, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import StudyActions from './_components/StudyActions'
import styles from './page.module.css'

export default function StudyDetailPage({ params }) {
  // Next.js 15에서 params는 Promise이므로 React.use()로 언래핑
  const { studyId } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudyDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.get(`/api/admin/studies/${studyId}`)

      if (result.success && result.data) {
        setStudy(result.data)
      } else {
        setError(result.error || '스터디 정보를 불러올 수 없습니다')
      }
    } catch (err) {
      console.error('Failed to fetch study detail:', err)
      setError(err.message || '스터디 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [studyId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/studies/' + studyId)
      return
    }

    if (status === 'authenticated') {
      fetchStudyDetail()
    }
  }, [status, studyId, router, fetchStudyDetail])

  // 로딩 상태
  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/admin/studies" className={styles.backLink}>
            ← 스터디 목록
          </Link>
        </div>
        <Card>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>스터디 정보를 불러오는 중...</p>
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
          <Link href="/admin/studies" className={styles.backLink}>
            ← 스터디 목록
          </Link>
        </div>
        <Card>
          <div className={styles.error}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <h2>오류 발생</h2>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <Button onClick={fetchStudyDetail} variant="primary">다시 시도</Button>
              <Link href="/admin/studies">
                <Button variant="outline">목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!study) return null

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link href="/admin/studies" className={styles.backLink}>
          ← 스터디 목록
        </Link>
        <div className={styles.titleRow}>
          <div className={styles.titleArea}>
            <span className={styles.emoji}>{study.emoji || '📚'}</span>
            <h1 className={styles.title}>{study.name}</h1>
          </div>
          <StudyActions studyId={studyId} study={study} onUpdate={fetchStudyDetail} />
        </div>
        <p className={styles.description}>{study.description}</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>멤버</div>
          <div className={styles.statValue}>
            {study.memberStats?.active || 0}/{study.settings?.maxMembers || 20}
          </div>
          <div className={styles.statDetail}>
            대기: {study.memberStats?.pending || 0}, 탈퇴: {study.memberStats?.left || 0}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>메시지</div>
          <div className={styles.statValue}>
            {(study.activityStats?.messages || 0).toLocaleString()}
          </div>
          <div className={styles.statDetail}>
            일평균 {(study.activityStats?.avgMessagesPerDay || 0).toFixed(1)}개
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>파일</div>
          <div className={styles.statValue}>
            {(study.activityStats?.files || 0).toLocaleString()}
          </div>
          <div className={styles.statDetail}>
            최근 30일: {study.activityStats?.recentFiles || 0}개
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>평점</div>
          <div className={styles.statValue}>
            ⭐ {(study.rating || 0).toFixed(1)}
          </div>
          <div className={styles.statDetail}>
            {study.reviewCount || 0}개 리뷰
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* 왼쪽 컬럼 */}
        <div className={styles.leftColumn}>
          {/* 기본 정보 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>카테고리</span>
                <span className={styles.infoValue}>
                  {study.category || '미분류'}
                  {study.subCategory && ` > ${study.subCategory}`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>태그</span>
                <div className={styles.tags}>
                  {study.tags && study.tags.length > 0 ? (
                    study.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noData}>태그 없음</span>
                  )}
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>초대 코드</span>
                <span className={styles.infoValue}>{study.inviteCode || '-'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>생성일</span>
                <span className={styles.infoValue}>
                  {study.createdAt ? new Date(study.createdAt).toLocaleString('ko-KR') : '-'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>최근 수정</span>
                <span className={styles.infoValue}>
                  {study.updatedAt ? new Date(study.updatedAt).toLocaleString('ko-KR') : '-'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>최근 활동</span>
                <span className={styles.infoValue}>
                  {study.activityStats?.lastActivityAt
                    ? new Date(study.activityStats.lastActivityAt).toLocaleString('ko-KR')
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 설정 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>설정</h2>
            <div className={styles.settingGrid}>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>공개 여부</span>
                {study.settings?.isPublic ? (
                  <Badge variant="success">공개</Badge>
                ) : (
                  <Badge variant="secondary">비공개</Badge>
                )}
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>모집 상태</span>
                {study.settings?.isRecruiting ? (
                  <Badge variant="primary">모집중</Badge>
                ) : (
                  <Badge variant="secondary">모집마감</Badge>
                )}
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>자동 승인</span>
                {study.settings?.autoApprove ? (
                  <Badge variant="success">자동</Badge>
                ) : (
                  <Badge variant="warning">수동</Badge>
                )}
              </div>
            </div>
          </div>

          {/* 스터디장 정보 */}
          {study.owner && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>스터디장</h2>
              <div className={styles.ownerCard}>
                <div className={styles.ownerHeader}>
                  <div className={styles.ownerName}>{study.owner.name || '이름 없음'}</div>
                  <Badge
                    variant={study.owner.status === 'ACTIVE' ? 'success' : 'danger'}
                  >
                    {study.owner.status || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className={styles.ownerEmail}>{study.owner.email}</div>
                <div className={styles.ownerDate}>
                  가입일: {study.owner.createdAt
                    ? new Date(study.owner.createdAt).toLocaleDateString('ko-KR')
                    : '-'}
                </div>
                <Link
                  href={`/admin/users/${study.owner.id}`}
                  className={styles.ownerLink}
                >
                  사용자 상세보기 →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽 컬럼 */}
        <div className={styles.rightColumn}>
          {/* 멤버 목록 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              멤버 목록 ({study.memberStats?.total || 0}명)
            </h2>
            <div className={styles.memberList}>
              {study.members && study.members.length > 0 ? (
                <>
                  {study.members.slice(0, 10).map((member) => (
                    <div key={member.id} className={styles.memberItem}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>
                          {member.user?.name || '익명'}
                          {member.role === 'OWNER' && (
                            <Badge variant="primary" size="small">
                              스터디장
                            </Badge>
                          )}
                        </div>
                        <div className={styles.memberEmail}>{member.user?.email}</div>
                      </div>
                      <Badge
                        variant={
                          member.status === 'ACTIVE'
                            ? 'success'
                            : member.status === 'PENDING'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                  {study.members.length > 10 && (
                    <div className={styles.moreMembers}>
                      외 {study.members.length - 10}명
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noMembers}>멤버가 없습니다</div>
              )}
            </div>
          </div>

          {/* 활동 통계 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>활동 통계</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>공지사항</span>
                <span className={styles.activityValue}>
                  {study.activityStats?.notices || 0}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>일정</span>
                <span className={styles.activityValue}>
                  {study.activityStats?.events || 0}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>할일</span>
                <span className={styles.activityValue}>
                  {study.activityStats?.studyTasks || 0}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>활성 멤버 (7일)</span>
                <span className={styles.activityValue}>
                  {study.activityStats?.activeMembers || 0}명
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>주간 메시지</span>
                <span className={styles.activityValue}>
                  {study.activityStats?.weeklyMessages || 0}개
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

