// 비밀번호 변경 컴포넌트
'use client';

import { useState } from 'react';
import styles from './PasswordChange.module.css';

export default function PasswordChange() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChanging, setIsChanging] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // 토스트 표시 함수
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 에러 메시지 매핑
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'PROFILE-055': '비밀번호를 입력해주세요',
      'PROFILE-056': '비밀번호가 너무 약합니다 (8자 이상, 대소문자, 숫자, 특수문자 필요)',
      'PROFILE-057': '현재 비밀번호가 일치하지 않습니다',
      'PROFILE-059': '비밀번호 변경에 실패했습니다',
      'PROFILE-060': '새 비밀번호가 현재 비밀번호와 같습니다',
      'PROFILE-061': '비밀번호가 일치하지 않습니다'
    };
    return errorMessages[errorCode] || '오류가 발생했습니다';
  };

  // 비밀번호 요구사항 체크
  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };
  };

  const calculatePasswordStrength = (password) => {
    const requirements = getPasswordRequirements(password);
    return Object.values(requirements).filter(Boolean).length;
  };

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, newPassword: value });
    setPasswordStrength(calculatePasswordStrength(value));
    if (errors.newPassword) setErrors({ ...errors, newPassword: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 클라이언트 측 유효성 검사
    if (formData.newPassword.length < 8) {
      const errorMsg = '비밀번호는 최소 8자 이상이어야 합니다';
      setErrors({ newPassword: errorMsg });
      showToast(errorMsg, 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const errorMsg = '새 비밀번호가 일치하지 않습니다';
      setErrors({ confirmPassword: errorMsg });
      showToast(errorMsg, 'error');
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (!data.success) {
        const errorCode = data.error?.code;
        const errorMsg = getErrorMessage(errorCode) || data.error?.message || '비밀번호 변경에 실패했습니다';

        // 필드별 에러 설정
        if (errorCode === 'PROFILE-057') {
          setErrors({ currentPassword: errorMsg });
        } else if (['PROFILE-056', 'PROFILE-060'].includes(errorCode)) {
          setErrors({ newPassword: errorMsg });
        } else if (errorCode === 'PROFILE-061') {
          setErrors({ confirmPassword: errorMsg });
        } else {
          setErrors({ general: errorMsg });
        }

        showToast(errorMsg, 'error');
        return;
      }

      showToast('비밀번호가 변경되었습니다', 'success');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength(0);
    } catch (error) {
      console.error('Password change error:', error);
      const errorMsg = '네트워크 오류가 발생했습니다';
      setErrors({ general: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setIsChanging(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return '약함';
    if (passwordStrength <= 3) return '보통';
    return '강함';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#ef4444';
    if (passwordStrength <= 3) return '#f59e0b';
    return '#10b981';
  };

  const requirements = getPasswordRequirements(formData.newPassword);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔒 비밀번호 변경</h2>

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
        {/* 현재 비밀번호 */}
        <div className={styles.field}>
          <label className={styles.label}>
            현재 비밀번호 <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => {
              setFormData({ ...formData, currentPassword: e.target.value });
              if (errors.currentPassword) setErrors({ ...errors, currentPassword: null });
            }}
            className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
            required
          />
          {errors.currentPassword && (
            <p className={styles.errorText}>⚠️ {errors.currentPassword}</p>
          )}
        </div>

        {/* 새 비밀번호 */}
        <div className={styles.field}>
          <label className={styles.label}>
            새 비밀번호 <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
            required
          />
          {errors.newPassword && (
            <p className={styles.errorText}>⚠️ {errors.newPassword}</p>
          )}

          {/* 강도 표시기 */}
          {formData.newPassword && (
            <>
              <div className={styles.strengthMeter}>
                <div
                  className={styles.strengthBar}
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getStrengthColor()
                  }}
                />
              </div>
              <div className={styles.strengthLabel} style={{ color: getStrengthColor() }}>
                강도: {getStrengthLabel()} ({passwordStrength}/5)
              </div>
            </>
          )}

          {/* 요구사항 체크리스트 */}
          {formData.newPassword && (
            <div className={styles.requirements}>
              <div className={`${styles.requirement} ${requirements.length ? styles.requirementMet : ''}`}>
                {requirements.length ? '✅' : '❌'} 8자 이상
              </div>
              <div className={`${styles.requirement} ${requirements.uppercase ? styles.requirementMet : ''}`}>
                {requirements.uppercase ? '✅' : '❌'} 대문자 포함
              </div>
              <div className={`${styles.requirement} ${requirements.lowercase ? styles.requirementMet : ''}`}>
                {requirements.lowercase ? '✅' : '❌'} 소문자 포함
              </div>
              <div className={`${styles.requirement} ${requirements.number ? styles.requirementMet : ''}`}>
                {requirements.number ? '✅' : '❌'} 숫자 포함
              </div>
              <div className={`${styles.requirement} ${requirements.special ? styles.requirementMet : ''}`}>
                {requirements.special ? '✅' : '❌'} 특수문자 포함
              </div>
            </div>
          )}
        </div>

        {/* 새 비밀번호 확인 */}
        <div className={styles.field}>
          <label className={styles.label}>
            새 비밀번호 확인 <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            required
          />
          {errors.confirmPassword && (
            <p className={styles.errorText}>⚠️ {errors.confirmPassword}</p>
          )}
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className={styles.errorText}>⚠️ 비밀번호가 일치하지 않습니다</p>
          )}
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isChanging}
            className={styles.saveButton}
          >
            {isChanging ? '변경 중...' : '변경'}
          </button>
        </div>
      </form>
    </div>
  );
}

