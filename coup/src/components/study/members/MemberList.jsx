// 멤버 목록 컴포넌트
'use client';

import MemberCard from './MemberCard';
import styles from './MemberList.module.css';

/**
 * 멤버 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.members - 필터링된 멤버 목록
 * @param {boolean} props.isOwner - 현재 사용자가 OWNER인지
 * @param {boolean} props.isAdmin - 현재 사용자가 ADMIN인지
 * @param {Function} props.onChangeRole - 역할 변경 핸들러
 * @param {Function} props.onKick - 강퇴 핸들러
 */
export default function MemberList({ 
  members = [], 
  isOwner, 
  isAdmin, 
  onChangeRole, 
  onKick 
}) {
  if (members.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.memberList}>
      {members.map((member) => (
        <MemberCard
          key={member.id || member.userId}
          member={member}
          isOwner={isOwner}
          isAdmin={isAdmin}
          onChangeRole={onChangeRole}
          onKick={onKick}
        />
      ))}
    </div>
  );
}
