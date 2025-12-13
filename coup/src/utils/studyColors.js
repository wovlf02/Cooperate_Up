// 스터디 색상 유틸리티
// 스터디마다 일관된 색상 테마를 적용하기 위한 함수

const colorThemes = [
  {
    name: 'blue-purple',
    bg: 'linear-gradient(135deg, var(--pastel-blue-bg) 0%, var(--pastel-purple-bg) 100%)',
    border: 'var(--pastel-blue-border)',
    shadow: 'rgba(99, 102, 241, 0.1)',
  },
  {
    name: 'orange-pink',
    bg: 'linear-gradient(135deg, var(--pastel-orange-bg) 0%, var(--pastel-pink-bg) 100%)',
    border: 'var(--pastel-orange-border)',
    shadow: 'rgba(251, 146, 60, 0.1)',
  },
  {
    name: 'green-cyan',
    bg: 'linear-gradient(135deg, var(--pastel-green-bg) 0%, var(--pastel-cyan-bg) 100%)',
    border: 'var(--pastel-green-border)',
    shadow: 'rgba(34, 197, 94, 0.1)',
  },
  {
    name: 'purple-pink',
    bg: 'linear-gradient(135deg, var(--pastel-purple-bg) 0%, var(--pastel-pink-bg) 100%)',
    border: 'var(--pastel-purple-border)',
    shadow: 'rgba(139, 92, 246, 0.1)',
  },
  {
    name: 'blue-cyan',
    bg: 'linear-gradient(135deg, var(--pastel-blue-bg) 0%, var(--pastel-cyan-bg) 100%)',
    border: 'var(--pastel-blue-border)',
    shadow: 'rgba(59, 130, 246, 0.1)',
  },
  {
    name: 'pink-purple',
    bg: 'linear-gradient(135deg, var(--pastel-pink-bg) 0%, var(--pastel-purple-bg) 100%)',
    border: 'var(--pastel-pink-border)',
    shadow: 'rgba(236, 72, 153, 0.1)',
  },
];

/**
 * 스터디 ID를 기반으로 일관된 색상 테마를 반환
 * @param {string} studyId - 스터디 고유 ID
 * @returns {object} 색상 테마 객체 (bg, border, shadow)
 */
export function getStudyColorTheme(studyId) {
  if (!studyId) {
    return colorThemes[0]; // 기본 색상
  }

  // studyId를 숫자로 변환하여 색상 선택
  let hash = 0;
  for (let i = 0; i < studyId.length; i++) {
    hash = studyId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colorThemes.length;
  return colorThemes[index];
}

/**
 * 스터디 헤더에 적용할 인라인 스타일 생성
 * @param {string} studyId - 스터디 고유 ID
 * @returns {object} React 인라인 스타일 객체
 */
export function getStudyHeaderStyle(studyId) {
  const theme = getStudyColorTheme(studyId);
  return {
    background: theme.bg,
    borderColor: theme.border,
    boxShadow: `0 2px 8px ${theme.shadow}`,
  };
}

