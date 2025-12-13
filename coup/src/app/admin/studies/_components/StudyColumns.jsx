'use client'

import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import styles from './StudyList.module.css'

/**
 * 스터디 테이블 컬럼 정의
 */
export function getStudyColumns() {
  return [
    {
      key: 'name',
      label: '스터디명',
      sortable: true,
      width: '300px',
      render: (name, study) => (
        <div className={styles.studyCell}>
          {study.thumbnail ? (
            <Image
              src={study.thumbnail}
              alt={name || '스터디'}
              width={56}
              height={56}
              className={styles.thumbnail}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <span>{study.emoji || '📚'}</span>
            </div>
          )}
          <div className={styles.studyInfo}>
            <div className={styles.studyTitle}>{name || '제목 없음'}</div>
            <div className={styles.studyOwner}>{study.owner?.name || '알 수 없음'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '120px',
      render: (category) => (
        <Badge variant="default" style={{
          backgroundColor: getCategoryColor(category).bg,
          color: getCategoryColor(category).fg,
        }}>
          {category || '미분류'}
        </Badge>
      ),
    },
    {
      key: 'isRecruiting',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (isRecruiting, study) => {
        if (study.settings?.isClosed) {
          return <Badge variant="danger">종료</Badge>
        }
        return isRecruiting
          ? <Badge variant="primary">모집중</Badge>
          : <Badge variant="default">진행중</Badge>
      },
    },
    {
      key: 'members',
      label: '인원',
      sortable: true,
      width: '100px',
      render: (_, study) => (
        <span className={styles.memberCount}>
          {study.stats?.memberCount || 0}/{study.settings?.maxMembers || 20}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: '생성일',
      sortable: true,
      width: '120px',
      render: (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, study) => (
        <Link href={`/admin/studies/${study.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
        </Link>
      ),
    },
  ]
}

/**
 * 카테고리 색상 반환
 */
export function getCategoryColor(category) {
  const colors = {
    '프로그래밍': { bg: 'var(--primary-50)', fg: 'var(--primary-700)' },
    '디자인': { bg: 'var(--danger-50)', fg: 'var(--danger-700)' },
    '어학': { bg: 'var(--success-50)', fg: 'var(--success-700)' },
    '자격증': { bg: 'var(--warning-50)', fg: 'var(--warning-700)' },
    '취업': { bg: 'var(--info-50)', fg: 'var(--info-700)' },
    '독서': { bg: 'var(--gray-100)', fg: 'var(--gray-700)' },
    '취미': { bg: 'var(--secondary-50)', fg: 'var(--secondary-700)' },
  }
  return colors[category] || { bg: 'var(--gray-100)', fg: 'var(--gray-600)' }
}

