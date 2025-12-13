'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDateTimeKST } from '@/utils/time';
import { formatBytes } from '@/utils/file'; // formatBytes 유틸리티 함수 임포트
import { useSession } from 'next-auth/react'; // useSession 임포트
import { useStudy, useNotice } from '@/lib/hooks/useApi';
import styles from './page.module.css';

export default function AnnouncementDetailPage({ params }) {
  const router = useRouter();
  const { studyId, announcementId } = params;
  const { data: session } = useSession();

  // 스터디 정보 가져오기 (브레드크럼에 스터디 이름 표시용)
  const { data: studyData, isLoading: isStudyLoading, error: studyError } = useStudy(studyId);
  const study = studyData?.data;

  // 공지사항 정보 가져오기
  const { data: noticeData, isLoading: isNoticeLoading, error: noticeError } = useNotice(studyId, announcementId);
  const notice = noticeData?.data;

  // 로딩 상태 처리
  if (isStudyLoading || isNoticeLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>공지사항을 불러오는 중...</div>
      </div>
    );
  }

  // 오류 상태 처리
  if (studyError || noticeError || !study) {
    console.error("Error fetching data:", studyError || noticeError);
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {studyError?.message || noticeError?.message || "스터디 또는 공지사항을 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>공지사항을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const hasAttachments = notice.attachments && notice.attachments.length > 0;

  const userId = session?.user?.id;
  const userRoleInStudy = study?.myRole; // useStudy 훅에서 이미 가져온 스터디 내 사용자 역할

  const isAuthor = notice.authorId === userId;
  const isStudyAdmin = userRoleInStudy === 'ADMIN' || userRoleInStudy === 'OWNER';

  const canEdit = isAuthor || isStudyAdmin;
  const canDelete = isAuthor || isStudyAdmin;

  const handleEdit = () => {
    router.push(`/my-studies/${studyId}/announcements/${announcementId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      // TODO: 삭제 API 연동
      console.log('Delete notice:', announcementId);
      // 삭제 성공 후 목록으로 이동
      // router.push(`/my-studies/${studyId}/notices`);
    }
  };

  return (
    <div className={styles.container}>
      {/* 네비게이션 (Breadcrumbs) */}
      <div className={styles.breadcrumbs}>
        <Link href="/my-studies" className={styles.breadcrumbItem}>내 스터디</Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <Link href={`/my-studies/${studyId}`} className={styles.breadcrumbItem}>{study.name}</Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <Link href={`/my-studies/${studyId}/notices`} className={styles.breadcrumbItem}>공지사항</Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{notice.title}</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{notice.title}</h1>
        <div className={styles.meta}>
          <span className={styles.author}>작성자: {notice.author?.name || '알 수 없음'}</span>
          <span className={styles.date}>작성일: {formatDateTimeKST(notice.createdAt)}</span>
        </div>
      </div>

      <div className={styles.content}>
        {/* 여기서는 간단히 HTML로 렌더링하지만, 실제로는 Markdown Renderer 등을 사용해야 합니다. */}
        <p>{notice.content}</p>
      </div>

      {/* 첨부 파일 */}
      <div className={styles.attachments}>
        <h3>첨부 파일</h3>
        {hasAttachments ? (
          <ul className={styles.attachmentList}>
            {notice.attachments.map((attachment) => (
              <li key={attachment.file.id} className={styles.attachmentItem}>
                <a href={attachment.file.url} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                  <span className={styles.attachmentName}>{attachment.file.name}</span>
                  <span className={styles.attachmentSize}>({formatBytes(attachment.file.size)})</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyText}>첨부 파일이 없습니다.</p>
        )}
      </div>

      <div className={styles.actions}>
        <button onClick={() => router.push(`/my-studies/${studyId}/notices`)} className={styles.listButton}>
          목록으로
        </button>
        {canEdit && (
          <button onClick={handleEdit} className={styles.editButton}>
            수정
          </button>
        )}
        {canDelete && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
