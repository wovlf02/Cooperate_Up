'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/utils/time'
import { getInitials } from '@/utils/format'
import { useUpdateProfile } from '@/lib/hooks/useApi'
import styles from './HeroProfile.module.css'

export default function HeroProfile({ user }) {
  const { update: updateSession } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  const updateProfile = useUpdateProfile()

  // 프로필 편집 시작
  const startEditing = () => {
    setEditForm({ name: user?.name || '', bio: user?.bio || '' })
    setIsEditing(true)
  }

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (editForm.name.length < 2 || editForm.name.length > 50) {
      alert('이름은 2-50자여야 합니다')
      return
    }
    try {
      await updateProfile.mutateAsync(editForm)
      await updateSession({ name: editForm.name })
      setIsEditing(false)
      alert('프로필이 수정되었습니다!')
    } catch (error) {
      alert('프로필 수정에 실패했습니다.')
    }
  }

  // 출석하기
  const handleAttendance = async () => {
    if (isAttending) return
    setIsAttending(true)
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '출석 실패')
      alert(data.attendedStudies === 0
        ? '참여 중인 스터디가 없습니다.'
        : `출석 완료! ${data.attendedStudies}개 스터디에 출석되었습니다.`)
    } catch (error) {
      alert(error.message || '출석 처리 중 오류가 발생했습니다.')
    } finally {
      setIsAttending(false)
    }
  }

  // 이미지 업로드
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
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
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          await updateProfile.mutateAsync({ avatar: reader.result })
          alert('프로필 이미지가 변경되었습니다!')
        } catch {
          alert('이미지 업로드에 실패했습니다')
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      alert('이미지 처리에 실패했습니다')
      setUploading(false)
    }
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground}></div>
      <div className={styles.heroContent}>
        {/* 프로필 이미지 */}
        <div className={styles.avatarWrapper}>
          <label className={styles.avatarLabel}>
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={120}
                height={120}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(user.name)}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <span>{uploading ? '⏳' : '📷'}</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className={styles.avatarInput}
            />
          </label>
        </div>

        {/* 사용자 정보 */}
        <div className={styles.userInfo}>
          {isEditing ? (
            <div className={styles.editForm}>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                className={styles.editInput}
                placeholder="이름"
                maxLength={50}
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                className={styles.editTextarea}
                placeholder="자기소개를 입력하세요..."
                maxLength={200}
              />
              <span className={styles.charCount}>{editForm.bio.length}/200</span>
              <div className={styles.editActions}>
                <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                  취소
                </button>
                <button
                  onClick={handleSaveProfile}
                  className={styles.saveBtn}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userEmail}>{user.email}</p>
              {user.bio && <p className={styles.userBio}>{user.bio}</p>}
              <p className={styles.joinDate}>🗓️ {formatDate(user.createdAt)} 가입</p>
            </>
          )}
        </div>

        {/* 퀵 액션 버튼 */}
        <div className={styles.quickActions}>
          {!isEditing && (
            <button onClick={startEditing} className={styles.actionBtn}>
              ✏️ 프로필 수정
            </button>
          )}
          <button
            onClick={handleAttendance}
            disabled={isAttending}
            className={`${styles.actionBtn} ${styles.attendanceBtn}`}
          >
            {isAttending ? '⏳ 출석 중...' : '✅ 출석하기'}
          </button>
        </div>
      </div>
    </section>
  )
}

