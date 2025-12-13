/**
 * ErrorBoundary.jsx
 *
 * 대시보드 전용 React Error Boundary
 *
 * 사용 예시:
 * ```jsx
 * <DashboardErrorBoundary>
 *   <DashboardClient />
 * </DashboardErrorBoundary>
 * ```
 *
 * @module components/dashboard/ErrorBoundary
 */

'use client'

import { Component } from 'react'
import { logDashboardError } from '@/lib/exceptions/dashboard-errors'
import styles from './ErrorBoundary.module.css'

/**
 * 대시보드 에러 바운더리
 *
 * React 렌더링 중 발생하는 에러를 포착하고 폴백 UI 표시
 *
 * @class DashboardErrorBoundary
 * @extends {Component}
 */
export default class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    }
  }

  /**
   * 에러 발생 시 상태 업데이트
   *
   * @static
   * @param {Error} error - 발생한 에러
   * @returns {Object} 새로운 state
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }

  /**
   * 에러 로깅 및 추가 처리
   *
   * @param {Error} error - 발생한 에러
   * @param {Object} errorInfo - React 에러 정보 (componentStack 포함)
   */
  componentDidCatch(error, errorInfo) {
    const { errorCount, lastErrorTime } = this.state
    const now = Date.now()

    // 에러 빈도 추적 (1분 내 3번 이상 에러 시 경고)
    const timeSinceLastError = lastErrorTime ? now - lastErrorTime : Infinity
    const newErrorCount = timeSinceLastError < 60000 ? errorCount + 1 : 1

    // 상태 업데이트
    this.setState({
      errorInfo,
      errorCount: newErrorCount,
      lastErrorTime: now
    })

    // 에러 로깅
    logDashboardError('대시보드 렌더링 에러', error, {
      componentStack: errorInfo.componentStack,
      errorCount: newErrorCount,
      userId: this.props.userId,
      context: 'ErrorBoundary'
    })

    // 반복적인 에러 발생 시 추가 로깅
    if (newErrorCount >= 3) {
      console.error('⚠️ 대시보드 반복 에러 감지:', {
        error: error.message,
        count: newErrorCount,
        timeWindow: '1분'
      })
    }

    // 프로덕션 환경에서는 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === 'production' && this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  /**
   * 에러 상태 초기화 및 재시도
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    })

    // 페이지 리로드 옵션 (props로 제어)
    if (this.props.resetOnRetry) {
      window.location.reload()
    }
  }

  /**
   * 홈으로 이동
   */
  handleGoHome = () => {
    window.location.href = '/'
  }

  /**
   * 에러 상세 정보 토글
   */
  toggleErrorDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state
    const { children, fallback } = this.props

    // 에러가 없으면 정상 렌더링
    if (!hasError) {
      return children
    }

    // 커스텀 폴백이 있으면 사용
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ error, errorInfo, reset: this.handleReset })
        : fallback
    }

    // 기본 에러 UI
    return (
      <div className={styles.errorBoundary}>
        <div className={styles.errorContainer}>
          {/* 에러 아이콘 */}
          <div className={styles.errorIcon}>
            {errorCount >= 3 ? '🚨' : '⚠️'}
          </div>

          {/* 에러 제목 */}
          <h2 className={styles.errorTitle}>
            {errorCount >= 3
              ? '반복적인 오류가 발생했습니다'
              : '일시적인 오류가 발생했습니다'}
          </h2>

          {/* 에러 메시지 */}
          <p className={styles.errorMessage}>
            {errorCount >= 3 ? (
              <>
                짧은 시간 내에 여러 번 오류가 발생했습니다.
                <br />
                페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </>
            ) : (
              <>
                대시보드를 불러오는 중 문제가 발생했습니다.
                <br />
                다시 시도하거나 홈으로 돌아가주세요.
              </>
            )}
          </p>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className={styles.errorDetails}>
              <button
                onClick={this.toggleErrorDetails}
                className={styles.detailsToggle}
              >
                {this.state.showDetails ? '▼' : '▶'} 에러 상세 정보
              </button>

              {this.state.showDetails && (
                <div className={styles.detailsContent}>
                  <div className={styles.errorName}>{error.name}</div>
                  <div className={styles.errorText}>{error.message}</div>
                  {error.stack && (
                    <pre className={styles.errorStack}>{error.stack}</pre>
                  )}
                  {errorInfo?.componentStack && (
                    <details className={styles.componentStack}>
                      <summary>컴포넌트 스택</summary>
                      <pre>{errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className={styles.errorActions}>
            <button
              onClick={this.handleReset}
              className={styles.primaryButton}
            >
              다시 시도
            </button>

            <button
              onClick={this.handleGoHome}
              className={styles.secondaryButton}
            >
              홈으로 이동
            </button>
          </div>

          {/* 에러 발생 횟수 표시 */}
          {errorCount > 1 && (
            <div className={styles.errorCount}>
              최근 1분 내 {errorCount}번의 오류가 발생했습니다
            </div>
          )}
        </div>
      </div>
    )
  }
}

/**
 * 위젯 전용 경량 Error Boundary
 *
 * 개별 위젯의 에러를 격리하여 전체 대시보드 크래시 방지
 *
 * @example
 * <WidgetErrorBoundary widgetName="StudyStatus">
 *   <StudyStatus />
 * </WidgetErrorBoundary>
 */
export class WidgetErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error, errorInfo) {
    const { widgetName } = this.props

    logDashboardError(`위젯 에러: ${widgetName}`, error, {
      widgetName,
      componentStack: errorInfo.componentStack,
      context: 'WidgetErrorBoundary'
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  render() {
    const { hasError, error } = this.state
    const { children, widgetName } = this.props

    if (!hasError) {
      return children
    }

    return (
      <div className={styles.widgetError}>
        <div className={styles.widgetErrorContent}>
          <div className={styles.widgetErrorIcon}>⚠️</div>
          <div className={styles.widgetErrorText}>
            <div className={styles.widgetErrorTitle}>
              {widgetName || '위젯'}을 불러올 수 없습니다
            </div>
            <div className={styles.widgetErrorMessage}>
              일시적인 문제가 발생했습니다
            </div>
          </div>
          <button
            onClick={this.handleRetry}
            className={styles.widgetRetryButton}
          >
            다시 시도
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className={styles.widgetErrorDetails}>
            <summary>개발자 정보</summary>
            <pre>{error.message}</pre>
          </details>
        )}
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트로 사용할 수 있는 HOC
 *
 * @param {Component} Component - 감싸질 컴포넌트
 * @param {Object} options - ErrorBoundary 옵션
 * @returns {Component} ErrorBoundary로 감싸진 컴포넌트
 *
 * @example
 * const SafeDashboard = withErrorBoundary(DashboardClient, {
 *   resetOnRetry: false,
 *   onError: (error, errorInfo) => console.error(error)
 * })
 */
export function withErrorBoundary(Component, options = {}) {
  return function WithErrorBoundaryComponent(props) {
    return (
      <DashboardErrorBoundary {...options}>
        <Component {...props} />
      </DashboardErrorBoundary>
    )
  }
}

/**
 * 위젯용 HOC
 *
 * @param {Component} Component - 감싸질 위젯 컴포넌트
 * @param {string} widgetName - 위젯 이름
 * @returns {Component} WidgetErrorBoundary로 감싸진 컴포넌트
 *
 * @example
 * const SafeStudyStatus = withWidgetErrorBoundary(StudyStatus, 'StudyStatus')
 */
export function withWidgetErrorBoundary(Component, widgetName) {
  return function WithWidgetErrorBoundaryComponent(props) {
    return (
      <WidgetErrorBoundary widgetName={widgetName}>
        <Component {...props} />
      </WidgetErrorBoundary>
    )
  }
}

