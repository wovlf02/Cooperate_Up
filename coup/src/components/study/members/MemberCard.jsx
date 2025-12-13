// 멤버 카드 컴포넌트
'use client';

import styles from './MemberCard.module.css';

/**
 * 역할 배지 렌더링
 */
export function getRoleBadge(role) {
  const badges = {
    OWNER: { icon: '👑', text: 'OWNER', className: styles.owner },
    ADMIN: { icon: '⭐', text: 'ADMIN', className: styles.admin },
    MEMBER: { icon: '👤', text: 'MEMBER', className: styles.member },
  };
  const badge = badges[role] || badges.MEMBER;
  return (
    <span className={`${styles.roleBadge} ${badge.className}`}>
      {badge.icon} {badge.text}
    </span>
  );
}

/**
 * 멤버 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.member - 멤버 정보
 * @param {boolean} props.isOwner - 현재 사용자가 OWNER인지
 * @param {boolean} props.isAdmin - 현재 사용자가 ADMIN인지
 * @param {Function} props.onChangeRole - 역할 변경 핸들러
 * @param {Function} props.onKick - 강퇴 핸들러
 */
export default function MemberCard({ 
  member, 
  isOwner, 
  isAdmin, 
  onChangeRole, 
  onKick 
}) {
  if (!member || !member.user) {
    return null;
  }

  const canChangeRole = isOwner && member.role !== 'OWNER';
  const canKick = member.role !== 'OWNER' && (
    member.role !== 'ADMIN' || isOwner
  );

  return (
    <div className={styles.memberCard}>
      <div className={styles.memberCardHeader}>
        <div className={styles.memberInfo}>
          <div className={styles.memberAvatar}>
            {member.user.avatar ? (
              <img src={member.user.avatar} alt={member.user.name} />
            ) : (
              member.user.name?.charAt(0) || '?'
            )}
          </div>
          <div className={styles.memberDetails}>
            <div className={styles.memberNameRow}>
              <h4 className={styles.memberName}>{member.user.name}</h4>
              {getRoleBadge(member.role)}
            </div>
            <div className={styles.memberEmail}>{member.user.email}</div>
            <div className={styles.memberMeta}>
              가입: {new Date(member.joinedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className={styles.memberActions}>
          {canChangeRole && (
            <>
              {member.role === 'ADMIN' ? (
                <button
                  className={styles.actionBtn}
                  onClick={() => onChangeRole(member, 'MEMBER')}
                  title="일반 멤버로 강등"
                >
                  강등
                </button>
              ) : (
                <button
                  className={styles.actionBtn}
                  onClick={() => onChangeRole(member, 'ADMIN')}
                  title="관리자로 승격"
                >
                  승격
                </button>
              )}
            </>
          )}
          {canKick && (isOwner || isAdmin) && (
            <button
              className={styles.kickBtn}
              onClick={() => onKick(member)}
              title="멤버 강퇴"
            >
              강퇴
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
