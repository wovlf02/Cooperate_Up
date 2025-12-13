/**
 * Toast 알림 헬퍼
 * react-toastify를 사용한 사용자 친화적 알림
 */

import { toast } from 'react-toastify';
import { handleStudyError, getErrorSeverity } from './study-error-handler';

/**
 * 기본 토스트 설정
 */
const defaultToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * 성공 토스트
 * @param {string} message - 메시지
 * @param {Object} options - 옵션
 */
export function showSuccessToast(message, options = {}) {
  toast.success(message, {
    ...defaultToastOptions,
    ...options,
  });
}

/**
 * 에러 토스트
 * @param {string} message - 메시지
 * @param {Object} options - 옵션
 */
export function showErrorToast(message, options = {}) {
  toast.error(message, {
    ...defaultToastOptions,
    autoClose: 5000, // 에러는 좀 더 길게
    ...options,
  });
}

/**
 * 경고 토스트
 * @param {string} message - 메시지
 * @param {Object} options - 옵션
 */
export function showWarningToast(message, options = {}) {
  toast.warning(message, {
    ...defaultToastOptions,
    ...options,
  });
}

/**
 * 정보 토스트
 * @param {string} message - 메시지
 * @param {Object} options - 옵션
 */
export function showInfoToast(message, options = {}) {
  toast.info(message, {
    ...defaultToastOptions,
    ...options,
  });
}

/**
 * Study 도메인 에러 토스트
 * @param {Error} error - API 에러
 * @param {Object} options - 옵션
 */
export function showStudyErrorToast(error, options = {}) {
  const { message, type, action } = handleStudyError(error);
  const severity = getErrorSeverity(type);

  // 심각도에 따라 다른 토스트 타입 사용
  const toastFn = severity === 'error' ? toast.error :
                  severity === 'warning' ? toast.warning :
                  toast.info;

  // 액션이 있는 경우 버튼 추가
  if (action) {
    toastFn(
      <div>
        <div>{message}</div>
        <button
          onClick={() => handleAction(action)}
          style={{
            marginTop: '8px',
            padding: '4px 12px',
            backgroundColor: 'white',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {action.label}
        </button>
      </div>,
      {
        ...defaultToastOptions,
        autoClose: severity === 'error' ? 5000 : 4000,
        ...options,
      }
    );
  } else {
    toastFn(message, {
      ...defaultToastOptions,
      autoClose: severity === 'error' ? 5000 : 3000,
      ...options,
    });
  }
}

/**
 * 액션 핸들러
 * @param {Object} action - { label, action }
 */
function handleAction(action) {
  switch (action.action) {
    case 'waitlist':
      // 대기 목록 등록 로직
      console.log('Add to waitlist');
      break;
    case 'notify':
      // 알림 설정 로직
      console.log('Set notification');
      break;
    case 'contact':
      // 관리자 문의 로직
      console.log('Contact admin');
      break;
    case 'viewApplication':
      // 신청 현황 보기 로직
      window.location.href = '/my-studies?tab=applications';
      break;
    case 'goToStudy':
      // 스터디로 이동 로직
      console.log('Go to study');
      break;
    case 'transferRole':
      // 역할 이전 로직
      console.log('Transfer role');
      break;
    case 'manageMembers':
      // 멤버 관리 로직
      console.log('Manage members');
      break;
    default:
      console.log('Unknown action:', action.action);
  }
}

/**
 * 로딩 토스트 (프로미스와 함께 사용)
 * @param {Promise} promise - 프로미스
 * @param {Object} messages - { pending, success, error }
 * @returns {Promise}
 */
export async function showLoadingToast(promise, messages = {}) {
  return toast.promise(
    promise,
    {
      pending: messages.pending || '처리 중...',
      success: messages.success || '완료되었습니다',
      error: {
        render({ data }) {
          const { message } = handleStudyError(data);
          return message;
        }
      }
    },
    defaultToastOptions
  );
}

/**
 * 필드 에러 토스트 (여러 개)
 * @param {Object} errors - { field: message }
 */
export function showFieldErrorsToast(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    showErrorToast(`${field}: ${message}`, {
      toastId: field, // 중복 방지
    });
  });
}

/**
 * 커스텀 토스트 (JSX 지원)
 * @param {React.ReactNode} content - JSX 내용
 * @param {Object} options - 옵션
 */
export function showCustomToast(content, options = {}) {
  toast(content, {
    ...defaultToastOptions,
    ...options,
  });
}

export default {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showStudyErrorToast,
  showLoadingToast,
  showFieldErrorsToast,
  showCustomToast,
};

