'use client'

import Image from 'next/image'
import { useState } from 'react'
import { formatDate } from '@/utils/time'
import { getInitials } from '@/utils/format'
import { useUpdateProfile } from '@/lib/hooks/useApi'
import styles from './ProfileSection.module.css'

export default function ProfileSection({ user }) {
  const [uploading, setUploading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const updateProfile = useUpdateProfile();

  // 출석하기
  const handleAttendance = async () => {
    if (isAttending) return;

    if (!confirm('오늘 참여 중인 모든 스터디에 출석하시겠습니까?')) {
      return;
    }

    setIsAttending(true);

    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '출석 실패');
      }

      if (data.attendedStudies === 0) {
        alert(data.message || '참여 중인 스터디가 없습니다.');
      } else {
        alert(`출석 완료! ${data.attendedStudies}개 스터디에 출석되었습니다.`);
      }
    } catch (error) {
      console.error('출석 실패', error);
      alert(error.message || '출석 처리 중 오류가 발생했습니다.');
    } finally {
      setIsAttending(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다')
      return
    }

    setUploading(true)

    try {
      // Base64로 인코딩하여 전송 (또는 별도 파일 업로드 API 사용)
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          await updateProfile.mutateAsync({ avatar: reader.result })
          alert('프로필 이미지가 변경되었습니다!')
        } catch (error) {
          console.error('이미지 업로드 실패:', error)
          alert('이미지 업로드에 실패했습니다')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('이미지 처리 실패:', error)
      alert('이미지 처리에 실패했습니다')
      setUploading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeaderWrapper}>
        <h2 className={styles.sectionHeader}>1. 프로필</h2>
        <button
          onClick={handleAttendance}
          disabled={isAttending}
          className={styles.attendanceButton}
        >
          {isAttending ? '출석 중...' : '✅ 출석하기'}
        </button>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileImageWrapper}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={128}
              height={128}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.profileImagePlaceholder}>
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <h3 className={styles.profileName}>{user.name}</h3>
        <p className={styles.profileEmail}>{user.email}</p>

        <label className={styles.changeImageButton}>
          {uploading ? '업로드 중...' : '프로필 이미지 변경'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        <p className={styles.profileInfo}>
          이메일로 가입 · 가입일: {formatDate(user.createdAt)}
        </p>
      </div>
    </section>
  )
}
