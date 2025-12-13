/**
 * WidgetErrorBoundary.jsx
 *
 * 개별 위젯 전용 Error Boundary
 * 위젯 단위 에러 격리로 전체 대시보드 다운 방지
 *
 * @module components/dashboard/widgets/WidgetErrorBoundary
 */

'use client'

import { Component } from 'react'
import styles from './Widget.module.css'

/**
 * 위젯 에러 바운더리
 *
 * 개별 위젯에서 발생하는 에러를 포착하고 폴백 UI 표시
 * 다른 위젯에는 영향을 주지 않음
 *
 * @class WidgetErrorBoundary
 * @extends {Component}
 */
export default class WidgetErrorBoundary extends Component {
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
    // 위젯 에러 로깅 (덜 중요하므로 경고 레벨)
    console.warn(`⚠️ [위젯 에러] ${this.props.widgetName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  /**
   * 위젯 재시도
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    })

    // 부모 컴포넌트에 재시도 알림
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      // 컴팩트한 위젯 에러 UI
      return (
        <div className={styles.widget}>
          <div className={styles.widgetError}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorMessage}>
              {this.props.widgetName || '위젯'}을(를) 불러올 수 없습니다
            </p>
            <button
              onClick={this.handleRetry}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

