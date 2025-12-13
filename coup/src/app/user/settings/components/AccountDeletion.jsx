// 계정 삭제 컴포넌트
'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './AccountDeletion.module.css';

export default function AccountDeletion({ user }) {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  // 토스트 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 에러 메시지 매핑
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'PROFILE-001': '필수 항목이 누락되었습니다',
      'PROFILE-064': 'OWNER 권한의 스터디가 있습니다. 스터디를 먼저 이관하거나 삭제해주세요',
      'PROFILE-067': '삭제 확인이 일치하지 않습니다',
      'PROFILE-069': '계정 삭제에 실패했습니다'
    };
    return errorMessages[errorCode] || '오류가 발생했습니다';
  };

  const handleDelete = async () => {
    setErrors({});

    // 확인 입력 검증
    if (confirmation !== user?.email && confirmation !== 'DELETE') {
      const errorMsg = '이메일 또는 "DELETE"를 정확히 입력해주세요';
      setErrors({ confirmation: errorMsg });
      showToast(errorMsg, 'error');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmation })
      });

      const data = await response.json();

      if (!data.success) {
        const errorCode = data.error?.code;
        const errorMsg = getErrorMessage(errorCode) || data.error?.message || '계정 삭제에 실패했습니다';
        setErrors({ general: errorMsg });
        showToast(errorMsg, 'error');
        return;
      }

      // 성공 - 로그아웃 처리
      showToast('계정이 삭제되었습니다. 로그아웃합니다...', 'success');

      setTimeout(async () => {
        // React Query 캐시 전체 초기화
        queryClient.clear();
        await signOut({ callbackUrl: '/auth/signin?deleted=true' });
      }, 2000);

    } catch (error) {
      console.error('Account deletion error:', error);
      const errorMsg = '네트워크 오류가 발생했습니다';
      setErrors({ general: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🗑️ 계정 삭제</h2>

      {/* 토스트 메시지 */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.warningBox}>
        <h3 className={styles.warningTitle}>⚠️ 주의사항</h3>
        <ul className={styles.warningList}>
          <li>계정 삭제 후 30일간 데이터가 보관되며, 이후 완전히 삭제됩니다</li>
          <li>OWNER 권한의 스터디가 있는 경우 삭제할 수 없습니다</li>
          <li>삭제된 계정은 복구할 수 없습니다</li>
          <li>모든 활동 내역과 데이터가 삭제됩니다</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          className={styles.deleteButton}
        >
          계정 삭제
        </button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDialog && (
        <div className={styles.dialogOverlay} onClick={() => setShowDialog(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>⚠️ 계정 삭제 확인</h3>

            {errors.general && (
              <div className={styles.errorBanner}>
                ⚠️ {errors.general}
              </div>
            )}

            <div className={styles.dialogContent}>
              <p className={styles.dialogText}>
                정말로 계정을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>

              <div className={styles.dialogField}>
                <label className={styles.dialogLabel}>
                  확인을 위해 이메일 또는 <strong>&quot;DELETE&quot;</strong>를 입력하세요:
                </label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => {
                    setConfirmation(e.target.value);
                    if (errors.confirmation) setErrors({ ...errors, confirmation: null });
                  }}
                  placeholder={user?.email || 'DELETE'}
                  className={`${styles.dialogInput} ${errors.confirmation ? styles.inputError : ''}`}
                  disabled={isDeleting}
                />
                {errors.confirmation && (
                  <p className={styles.errorText}>⚠️ {errors.confirmation}</p>
                )}
              </div>
            </div>

            <div className={styles.dialogActions}>
              <button
                type="button"
                onClick={() => {
                  setShowDialog(false);
                  setConfirmation('');
                  setErrors({});
                }}
                className={styles.cancelButton}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={styles.confirmDeleteButton}
                disabled={isDeleting || !confirmation}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

