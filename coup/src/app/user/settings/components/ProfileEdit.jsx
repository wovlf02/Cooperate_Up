// 프로필 편집 컴포넌트
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ProfileEdit.module.css';

export default function ProfileEdit({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    major: user?.major || '',
    interests: user?.interests || []
  });
  const [avatar, setAvatar] = useState(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // 토스트 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 에러 메시지 매핑 함수
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'PROFILE-001': '필수 항목이 누락되었습니다',
      'PROFILE-002': '이름 형식이 올바르지 않습니다',
      'PROFILE-003': '이름은 2자 이상이어야 합니다',
      'PROFILE-004': '이름은 50자 이하여야 합니다',
      'PROFILE-005': '자기소개는 200자 이하여야 합니다',
      'PROFILE-012': '보안상 문제가 있는 입력입니다 (XSS)',
      'PROFILE-013': '보안상 문제가 있는 입력입니다 (SQL Injection)',
      'PROFILE-014': '프로필 업데이트에 실패했습니다',
      'PROFILE-021': '파일이 제공되지 않았습니다',
      'PROFILE-022': '파일 크기는 5MB 이하여야 합니다',
      'PROFILE-023': 'JPG, PNG, GIF, WebP 형식만 지원합니다',
      'PROFILE-024': '올바른 이미지 형식이 아닙니다',
      'PROFILE-026': '파일 업로드에 실패했습니다',
      'PROFILE-030': '아바타 삭제에 실패했습니다',
      'PROFILE-032': '아바타를 찾을 수 없습니다',
      'PROFILE-034': '아바타 URL이 올바르지 않습니다'
    };
    return errorMessages[errorCode] || '오류가 발생했습니다';
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기는 5MB 이하여야 합니다', 'error');
      return;
    }

    // 파일 타입 체크
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('JPG, PNG, GIF, WebP 형식만 지원합니다', 'error');
      return;
    }

    setIsUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = getErrorMessage(data.error?.code) || data.error?.message || '업로드에 실패했습니다';
        showToast(errorMsg, 'error');
        return;
      }

      setAvatar(data.user.avatar);
      showToast('프로필 사진이 변경되었습니다', 'success');
    } catch (error) {
      console.error('Avatar upload error:', error);
      showToast('네트워크 오류가 발생했습니다', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 아바타 삭제 함수 추가
  const handleAvatarDelete = async () => {
    if (!avatar || !avatar.startsWith('/uploads/')) {
      showToast('삭제할 아바타가 없습니다', 'error');
      return;
    }

    if (!confirm('프로필 사진을 삭제하시겠습니까?')) {
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = getErrorMessage(data.error?.code) || data.error?.message || '삭제에 실패했습니다';
        showToast(errorMsg, 'error');
        return;
      }

      setAvatar(null);
      showToast('프로필 사진이 삭제되었습니다', 'success');
    } catch (error) {
      console.error('Avatar delete error:', error);
      showToast('네트워크 오류가 발생했습니다', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddInterest = () => {
    const interest = prompt('관심 분야를 입력하세요:');
    if (interest && interest.trim()) {
      if (formData.interests.length >= 5) {
        showToast('관심 분야는 최대 5개까지 추가할 수 있습니다', 'error');
        return;
      }
      setFormData({
        ...formData,
        interests: [...formData.interests, interest.trim()]
      });
    }
  };

  const handleRemoveInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio || null
        })
      });

      const data = await response.json();

      if (!data.success) {
        // 에러 코드별 처리
        const errorCode = data.error?.code;
        const errorMsg = getErrorMessage(errorCode) || data.error?.message || '프로필 저장에 실패했습니다';

        // 필드별 에러 설정
        if (['PROFILE-002', 'PROFILE-003', 'PROFILE-004'].includes(errorCode)) {
          setErrors({ name: errorMsg });
        } else if (errorCode === 'PROFILE-005') {
          setErrors({ bio: errorMsg });
        } else if (['PROFILE-012', 'PROFILE-013'].includes(errorCode)) {
          setErrors({ general: errorMsg });
        } else {
          setErrors({ general: errorMsg });
        }

        showToast(errorMsg, 'error');
        return;
      }

      showToast('프로필이 저장되었습니다', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Save error:', error);
      const errorMsg = '네트워크 오류가 발생했습니다';
      setErrors({ general: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>👤 프로필 편집</h2>

      {/* 토스트 메시지 */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
          {toast.message}
        </div>
      )}

      {/* 전체 에러 메시지 */}
      {errors.general && (
        <div className={styles.errorBanner}>
          ⚠️ {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 프로필 사진 */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {avatar ? (
              <Image
                src={avatar}
                alt="프로필 사진"
                width={120}
                height={120}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
          />
          <div className={styles.avatarButtons}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={styles.avatarButton}
            >
              {isUploading ? '업로드 중...' : '📷 사진 변경'}
            </button>
            {avatar && avatar.startsWith('/uploads/') && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isUploading}
                className={styles.avatarDeleteButton}
              >
                🗑️ 삭제
              </button>
            )}
          </div>
        </div>

        {/* 이름 */}
        <div className={styles.field}>
          <label className={styles.label}>
            이름 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            minLength={2}
            maxLength={50}
            required
          />
          {errors.name && (
            <p className={styles.errorText}>⚠️ {errors.name}</p>
          )}
          <p className={styles.hint}>
            2-50자, 한글/영문/숫자 사용 가능 ({formData.name.length}/50)
          </p>
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className={styles.field}>
          <label className={styles.label}>이메일 (변경 불가)</label>
          <input
            type="email"
            value={user?.email || ''}
            className={`${styles.input} ${styles.inputReadonly}`}
            readOnly
            disabled
          />
        </div>

        {/* 소개 */}
        <div className={styles.field}>
          <label className={styles.label}>소개</label>
          <textarea
            value={formData.bio}
            onChange={(e) => {
              setFormData({ ...formData, bio: e.target.value });
              if (errors.bio) setErrors({ ...errors, bio: null });
            }}
            className={`${styles.textarea} ${errors.bio ? styles.inputError : ''}`}
            rows={4}
            maxLength={200}
            placeholder="자신을 소개해주세요..."
          />
          {errors.bio && (
            <p className={styles.errorText}>⚠️ {errors.bio}</p>
          )}
          <p className={styles.hint}>
            {formData.bio.length}/200자
          </p>
        </div>

        {/* 전공/분야 */}
        <div className={styles.field}>
          <label className={styles.label}>전공/분야</label>
          <select
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className={styles.select}
          >
            <option value="">선택하세요</option>
            <option value="컴퓨터공학">컴퓨터공학</option>
            <option value="소프트웨어공학">소프트웨어공학</option>
            <option value="정보통신공학">정보통신공학</option>
            <option value="전자공학">전자공학</option>
            <option value="산업디자인">산업디자인</option>
            <option value="경영학">경영학</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 관심 분야 */}
        <div className={styles.field}>
          <label className={styles.label}>관심 분야 (최대 5개)</label>
          <div className={styles.interests}>
            {formData.interests.map((interest, index) => (
              <div key={index} className={styles.interestTag}>
                # {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className={styles.interestRemove}
                >
                  ✕
                </button>
              </div>
            ))}
            {formData.interests.length < 5 && (
              <button
                type="button"
                onClick={handleAddInterest}
                className={styles.interestAdd}
              >
                + 추가
              </button>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

