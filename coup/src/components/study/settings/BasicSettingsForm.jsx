// 기본 설정 폼 컴포넌트
'use client';

import { useState, useEffect } from 'react';
import styles from './BasicSettingsForm.module.css';

const STUDY_CATEGORIES = [
  { main: '개발', sub: ['알고리즘/코테', '웹개발', '앱개발', 'AI/ML', '데이터과학'] },
  { main: '언어', sub: ['영어', '중국어', '일본어', '기타'] },
  { main: '취업/자격증', sub: ['공무원', '자격증', '취업준비'] },
  { main: '교양/취미', sub: ['독서', '운동', '음악', '미술'] },
  { main: '학업', sub: ['수능', '편입', '대학공부'] }
];

/**
 * 기본 설정 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.study - 스터디 정보
 * @param {Function} props.onSave - 저장 핸들러
 * @param {Function} props.onCancel - 취소 핸들러
 * @param {boolean} props.isSaving - 저장 중 상태
 */
export default function BasicSettingsForm({ 
  study, 
  onSave, 
  onCancel,
  isSaving = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    tags: [],
    isPublic: true,
    autoApprove: false,
    maxMembers: 50
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  // 스터디 데이터로 폼 초기화
  useEffect(() => {
    if (study) {
      setFormData({
        name: study.name || '',
        category: study.category || '',
        subCategory: study.subCategory || '',
        description: study.description || '',
        tags: study.tags || [],
        isPublic: study.isPublic !== undefined ? study.isPublic : true,
        autoApprove: study.autoApprove || false,
        maxMembers: study.maxMembers || 50
      });
    }
  }, [study]);

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '스터디 이름은 필수입니다.';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '스터디 이름은 2-50자 사이여야 합니다.';
    }

    if (formData.description.length < 10) {
      newErrors.description = '스터디 소개는 최소 10자 이상이어야 합니다.';
    } else if (formData.description.length > 500) {
      newErrors.description = '스터디 소개는 500자를 초과할 수 없습니다.';
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 100) {
      newErrors.maxMembers = '최대 인원은 2-100명 사이여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag) && formData.tags.length < 5) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // 현재 카테고리의 서브카테고리 목록
  const currentSubCategories = STUDY_CATEGORIES.find(
    cat => cat.main === formData.category
  )?.sub || [];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.settingsCard}>
        <h3 className={styles.cardTitle}>📝 기본 정보</h3>

        {/* 스터디 이름 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>스터디 이름 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="스터디 이름을 입력하세요"
            disabled={isSaving}
          />
          <span className={styles.hint}>
            {errors.name ? (
              <span className={styles.error}>{errors.name}</span>
            ) : (
              `${formData.name.length}/50자`
            )}
          </span>
        </div>

        {/* 카테고리 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.selectGroup}>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ 
                ...formData, 
                category: e.target.value,
                subCategory: '' 
              })}
              className={styles.select}
              disabled={isSaving}
            >
              <option value="">선택하세요</option>
              {STUDY_CATEGORIES.map((cat) => (
                <option key={cat.main} value={cat.main}>
                  {cat.main}
                </option>
              ))}
            </select>
            {currentSubCategories.length > 0 && (
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className={styles.select}
                disabled={isSaving}
              >
                <option value="">세부 카테고리</option>
                {currentSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 스터디 소개 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>스터디 소개 *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            rows={5}
            placeholder="스터디에 대해 소개해주세요"
            disabled={isSaving}
          />
          <span className={styles.hint}>
            {errors.description ? (
              <span className={styles.error}>{errors.description}</span>
            ) : (
              `${formData.description.length}/500자`
            )}
          </span>
        </div>

        {/* 태그 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>태그 (최대 5개)</label>
          <div className={styles.tagContainer}>
            {formData.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => handleTagRemove(tag)}
                  disabled={isSaving}
                >
                  ×
                </button>
              </span>
            ))}
            {formData.tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="+ 추가 (Enter)"
                className={styles.tagInput}
                disabled={isSaving}
              />
            )}
          </div>
        </div>

        {/* 공개 여부 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>공개 여부</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                checked={formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: true })}
                disabled={isSaving}
              />
              <span>전체 공개 - 누구나 검색 가능</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                checked={!formData.isPublic}
                onChange={() => setFormData({ ...formData, isPublic: false })}
                disabled={isSaving}
              />
              <span>비공개 - 초대 링크만</span>
            </label>
          </div>
        </div>

        {/* 가입 승인 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>가입 승인</label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.autoApprove}
              onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
              disabled={isSaving}
            />
            <span>자동 승인 (체크 해제 시 수동 승인)</span>
          </label>
        </div>

        {/* 최대 인원 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>최대 인원</label>
          <input
            type="number"
            value={formData.maxMembers}
            onChange={(e) => setFormData({ 
              ...formData, 
              maxMembers: parseInt(e.target.value) || 2 
            })}
            className={`${styles.input} ${styles.numberInput} ${errors.maxMembers ? styles.inputError : ''}`}
            min="2"
            max="100"
            disabled={isSaving}
          />
          <span className={styles.hint}>
            {errors.maxMembers ? (
              <span className={styles.error}>{errors.maxMembers}</span>
            ) : (
              '2-100명'
            )}
          </span>
        </div>

        {/* 버튼 */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </div>
    </form>
  );
}
