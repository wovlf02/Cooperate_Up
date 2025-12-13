'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { io } from 'socket.io-client'
import { ChatConnectionException } from '@/lib/exceptions/chat'
import { handleChatError } from '@/lib/utils/chat'
import { logChatError, logChatWarning, logChatInfo } from '@/lib/utils/chat/errorLogger'

const SocketContext = createContext(null)

/**
 * Socket 연결 상태 열거형
 * @export
 */
export const ConnectionState = {
  DISCONNECTED: 'disconnected',      // 연결 안 됨
  CONNECTING: 'connecting',          // 연결 시도 중
  CONNECTED: 'connected',            // 연결됨
  RECONNECTING: 'reconnecting',      // 재연결 시도 중
  FAILED: 'failed',                  // 연결 실패 (재시도 중단)
  OFFLINE: 'offline'                 // 네트워크 오프라인
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED)
  const [connectionError, setConnectionError] = useState(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const { data: session, status } = useSession()

  // 중복 검증 방지
  const isValidatingRef = useRef(false)
  const hasValidatedRef = useRef(false)
  const reconnectTimeoutRef = useRef(null)
  const connectionTimeoutRef = useRef(null)
  const isOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // 최대 재연결 시도 횟수
  const MAX_RECONNECT_ATTEMPTS = 5
  const CONNECTION_TIMEOUT_MS = 30000 // 30초

  // 안전하게 user 정보 추출
  const user = session?.user && session.user.id ? session.user : null

  /**
   * 연결 에러 처리
   */
  const handleConnectionError = useCallback((error, context = {}) => {
    const errorInfo = handleChatError(error, {
      component: 'SocketContext',
      userId: user?.id,
      ...context
    })

    setConnectionError(errorInfo)
    logChatError(error, context)

    return errorInfo
  }, [user?.id])

  /**
   * 연결 타임아웃 설정
   */
  const setupConnectionTimeout = useCallback(() => {
    // 기존 타임아웃 제거
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }

    // 새 타임아웃 설정
    connectionTimeoutRef.current = setTimeout(() => {
      if (connectionState === ConnectionState.CONNECTING || 
          connectionState === ConnectionState.RECONNECTING) {
        const error = ChatConnectionException.timeout({
          state: connectionState,
          attempt: reconnectAttempt
        })
        handleConnectionError(error)
        setConnectionState(ConnectionState.FAILED)
      }
    }, CONNECTION_TIMEOUT_MS)
  }, [connectionState, reconnectAttempt, handleConnectionError])

  /**
   * 연결 타임아웃 해제
   */
  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
  }, [])

  /**
   * 네트워크 상태 확인
   */
  const checkNetworkStatus = useCallback(() => {
    if (typeof navigator === 'undefined') return true
    
    const isOnline = navigator.onLine
    
    if (!isOnline && connectionState !== ConnectionState.OFFLINE) {
      const error = ChatConnectionException.networkOffline()
      handleConnectionError(error)
      setConnectionState(ConnectionState.OFFLINE)
    }
    
    return isOnline
  }, [connectionState, handleConnectionError])

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (status === 'loading') {
      logChatInfo('Socket: Waiting for session...')
      return
    }

    // 로그인하지 않은 경우 또는 user 정보가 없는 경우 소켓 정리
    if (status === 'unauthenticated' || !user || !user.id) {
      logChatInfo('Socket: Not authenticated - no connection needed')
      
      // 기존 소켓이 있으면 정리
      if (socket) {
        logChatInfo('Socket: Cleaning up existing socket')
        
        // 타임아웃 정리
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = null
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
        
        socket.disconnect()
        setSocket(null)
        setConnectionState(ConnectionState.DISCONNECTED)
        setConnectionError(null)
        setReconnectAttempt(0)
      }
      return
    }

    // 네트워크 상태 확인
    if (!checkNetworkStatus()) {
      return
    }

    // 여기까지 왔다면: status === 'authenticated' && user?.id 존재
    logChatInfo('Socket: User authenticated, validating...', {
      userId: user.id,
      email: user.email,
      name: user.name
    })

    // 이미 검증했거나 검증 중이면 스킵
    if (hasValidatedRef.current || isValidatingRef.current) {
      logChatInfo('Socket: Already validated, skipping')
      return
    }

    // 세션 유효성 검증 (DB에서 사용자 확인)
    const validateAndConnect = async () => {
      if (isValidatingRef.current) return

      isValidatingRef.current = true
      setConnectionState(ConnectionState.CONNECTING)
      setupConnectionTimeout()

      try {
        const response = await fetch('/api/auth/validate-session', { credentials: 'include' })
        const data = await response.json()

        hasValidatedRef.current = true
        clearConnectionTimeout()

        if (!data.valid) {
          const error = ChatConnectionException.authenticationFailed({
            reason: data.error,
            shouldLogout: data.shouldLogout
          })
          handleConnectionError(error)
          setConnectionState(ConnectionState.FAILED)

          if (data.shouldLogout) {
            logChatWarning('Socket: User not found in DB, session will be cleared')
            // 기존 소켓 정리
            if (socket) {
              socket.disconnect()
              setSocket(null)
            }
          }
          return
        }

        // 세션 유효 - 소켓 연결 진행
        logChatInfo('Socket: Session validated, preparing connection...')

        // 이미 같은 사용자로 연결되어 있으면 재연결하지 않음
        if (socket?.auth?.userId === user.id && socket.connected) {
          logChatInfo('Socket: Already connected with same user')
          setConnectionState(ConnectionState.CONNECTED)
          setConnectionError(null)
          return
        }

        // 기존 소켓 정리 (다른 사용자이거나 연결이 끊긴 경우)
        if (socket) {
          logChatInfo('Socket: Disconnecting old socket')
          socket.disconnect()
        }

        // Socket.io 인스턴스 생성
        logChatInfo('Socket: Creating new socket instance')
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
          auth: {
            userId: user.id
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: CONNECTION_TIMEOUT_MS,
          autoConnect: false, // ⭐ 중요: 자동 연결 비활성화
        })

        // 이벤트 리스너 등록
        socketInstance.on('connect', () => {
          logChatInfo('Socket connected', { socketId: socketInstance.id })
          clearConnectionTimeout()
          setConnectionState(ConnectionState.CONNECTED)
          setConnectionError(null)
          setReconnectAttempt(0)
        })

        socketInstance.on('disconnect', (reason) => {
          logChatWarning('Socket disconnected', { reason })
          clearConnectionTimeout()
          setConnectionState(ConnectionState.DISCONNECTED)

          // 의도적 연결 해제가 아니면 재연결 시도
          if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
            setConnectionState(ConnectionState.RECONNECTING)
          }
        })

        socketInstance.on('connect_error', (error) => {
          logChatError(error, { 
            component: 'SocketContext',
            event: 'connect_error' 
          })
          
          clearConnectionTimeout()
          
          // 에러 유형에 따른 처리
          if (error.message.includes('User not found')) {
            const err = ChatConnectionException.authenticationFailed({
              reason: 'User not found in database'
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.FAILED)
            socketInstance.disconnect()
          } else if (error.message.includes('User status is')) {
            const err = ChatConnectionException.authenticationFailed({
              reason: 'User account is not active',
              status: error.message.split('User status is ')[1]
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.FAILED)
            socketInstance.disconnect()
          } else if (error.message.includes('Authentication') || error.message.includes('Invalid user')) {
            const err = ChatConnectionException.authenticationFailed({
              reason: error.message
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.FAILED)
            socketInstance.disconnect()
          } else if (error.message.includes('xhr poll error') || error.message.includes('websocket error')) {
            const err = ChatConnectionException.serverUnreachable({
              originalError: error.message
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.RECONNECTING)
          } else if (error.message.includes('timeout')) {
            const err = ChatConnectionException.timeout({
              originalError: error.message
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.RECONNECTING)
          } else {
            const err = ChatConnectionException.serverUnreachable({
              originalError: error.message
            })
            handleConnectionError(err)
            setConnectionState(ConnectionState.RECONNECTING)
          }
        })

        socketInstance.on('reconnect_attempt', (attempt) => {
          logChatInfo(`Socket: Reconnection attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`)
          setReconnectAttempt(attempt)
          setConnectionState(ConnectionState.RECONNECTING)
          setupConnectionTimeout()
        })

        socketInstance.on('reconnect_failed', () => {
          logChatError(new Error('Reconnection failed'), {
            component: 'SocketContext',
            attempts: MAX_RECONNECT_ATTEMPTS
          })
          
          const error = ChatConnectionException.reconnectionFailed(
            MAX_RECONNECT_ATTEMPTS,
            { userId: user.id }
          )
          handleConnectionError(error)
          clearConnectionTimeout()
          setConnectionState(ConnectionState.FAILED)
        })

        socketInstance.on('error', (error) => {
          logChatError(error, { 
            component: 'SocketContext',
            event: 'error' 
          })
          handleConnectionError(error)
        })

        // Transport 업그레이드 실패 처리
        socketInstance.io.on('error', (error) => {
          if (error.message.includes('websocket') || error.type === 'TransportError') {
            const err = ChatConnectionException.transportUpgradeFailed({
              originalError: error.message
            })
            handleConnectionError(err)
            // 계속 polling으로 동작하므로 연결 유지
          }
        })

        // 소켓 상태 저장
        setSocket(socketInstance)

        // 수동으로 연결 시작
        logChatInfo('Socket: Initiating connection...')
        socketInstance.connect()

      } catch (error) {
        logChatError(error, { component: 'SocketContext', phase: 'validation' })
        const err = ChatConnectionException.serverUnreachable({
          originalError: error.message
        })
        handleConnectionError(err)
        setConnectionState(ConnectionState.FAILED)
        hasValidatedRef.current = true
        clearConnectionTimeout()
      } finally {
        isValidatingRef.current = false
      }
    }

    // 검증 및 연결 실행
    validateAndConnect()

    // Cleanup 함수
    return () => {
      logChatInfo('Socket: Cleanup - disconnecting')
      // Ref 초기화 (컴포넌트 언마운트 시)
      hasValidatedRef.current = false
      isValidatingRef.current = false

      // 타임아웃 정리
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (socket?.connected) {
        socket.disconnect()
      }
      setConnectionState(ConnectionState.DISCONNECTED)
      setConnectionError(null)
      setReconnectAttempt(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, status])

  /**
   * 네트워크 상태 변경 감지
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      logChatInfo('Network: Online detected')
      isOnlineRef.current = true
      setConnectionError(null)

      // 연결 실패 상태였다면 재연결 시도
      if (connectionState === ConnectionState.OFFLINE || 
          connectionState === ConnectionState.FAILED) {
        if (socket && !socket.connected) {
          logChatInfo('Network: Attempting to reconnect...')
          setConnectionState(ConnectionState.RECONNECTING)
          socket.connect()
        }
      }
    }

    const handleOffline = () => {
      logChatWarning('Network: Offline detected')
      isOnlineRef.current = false
      const error = ChatConnectionException.networkOffline()
      handleConnectionError(error)
      setConnectionState(ConnectionState.OFFLINE)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [connectionState, socket, handleConnectionError])

  /**
   * 수동 재연결 시도
   */
  const reconnect = useCallback(() => {
    if (!socket) {
      logChatWarning('Socket: Cannot reconnect - socket not initialized')
      return
    }

    if (socket.connected) {
      logChatInfo('Socket: Already connected')
      return
    }

    if (!checkNetworkStatus()) {
      return
    }

    logChatInfo('Socket: Manual reconnection requested')
    setConnectionState(ConnectionState.RECONNECTING)
    setConnectionError(null)
    setReconnectAttempt(0)
    setupConnectionTimeout()
    socket.connect()
  }, [socket, checkNetworkStatus, setupConnectionTimeout])

  /**
   * 수동 연결 해제
   */
  const disconnect = useCallback(() => {
    if (!socket) {
      return
    }

    logChatInfo('Socket: Manual disconnection requested')
    
    // 타임아웃 정리
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    socket.disconnect()
    setConnectionState(ConnectionState.DISCONNECTED)
    setConnectionError(null)
    setReconnectAttempt(0)
  }, [socket])

  // 이전 호환성을 위한 isConnected
  const isConnected = connectionState === ConnectionState.CONNECTED

  const value = {
    socket,
    isConnected,
    connectionState,
    connectionError,
    reconnectAttempt,
    user,
    reconnect,
    disconnect,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
