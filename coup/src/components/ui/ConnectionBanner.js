'use client'

import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

/**
 * 연결 상태 배너 컴포넌트
 *
 * @param {string} connectionState - 연결 상태 (ConnectionState enum)
 * @param {Object} error - 에러 객체
 * @param {Function} onRetry - 재연결 시도 콜백
 * @param {number} reconnectAttempt - 재연결 시도 횟수
 */
export function ConnectionBanner({
  connectionState,
  error,
  onRetry,
  reconnectAttempt
}) {
  // CONNECTED 상태면 표시하지 않음
  if (connectionState === 'connected') {
    return null
  }

  // 상태별 설정
  const getConfig = () => {
    switch (connectionState) {
      case 'connecting':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: <Wifi className="h-5 w-5 text-blue-500 animate-pulse" />,
          text: '연결 중...',
          textColor: 'text-blue-800',
          showRetry: false
        }

      case 'reconnecting':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />,
          text: `재연결 시도 중... (${reconnectAttempt}회)`,
          textColor: 'text-yellow-800',
          showRetry: false
        }

      case 'disconnected':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          icon: <WifiOff className="h-5 w-5 text-gray-500" />,
          text: '연결이 끊어졌습니다',
          textColor: 'text-gray-800',
          showRetry: true
        }

      case 'failed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: '연결에 실패했습니다',
          textColor: 'text-red-800',
          showRetry: true
        }

      case 'offline':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-500',
          icon: <WifiOff className="h-5 w-5 text-orange-500" />,
          text: '인터넷 연결을 확인해주세요',
          textColor: 'text-orange-800',
          showRetry: false
        }

      default:
        return null
    }
  }

  const config = getConfig()
  if (!config) return null

  return (
    <div className={`w-full ${config.bg} border-b-2 ${config.border} px-4 py-3`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className={`text-sm font-medium ${config.textColor}`}>
              {config.text}
            </p>
            {error && (
              <p className="text-xs text-gray-600 mt-0.5">
                {error.message}
              </p>
            )}
          </div>
        </div>

        {config.showRetry && onRetry && (
          <button
            onClick={onRetry}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              connectionState === 'failed'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            재연결
          </button>
        )}
      </div>
    </div>
  )
}

