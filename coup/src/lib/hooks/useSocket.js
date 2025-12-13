// src/lib/hooks/useSocket.js
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

let socket = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(() => {
    // 초기 상태를 소켓의 실제 연결 상태로 설정
    return socket ? socket.connected : false;
  });
  const [transport, setTransport] = useState('N/A')
  const [user, setUser] = useState(null)

  // 사용자 정보 가져오기 (로그인된 경우만)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Socket] User fetched:', data.user?.name, data.user?.id);
          setUser(data.user);
        } else {
          // 로그인되지 않은 경우 (401) 또는 기타 에러
          if (response.status === 401) {
            console.log('[Socket] User not authenticated (401)');
          } else {
            console.warn('[Socket] Failed to fetch user:', response.status);
          }
          setUser(null);
        }
      } catch (error) {
        console.error('[Socket] Error fetching user:', error);
        setUser(null);
      }
    }

    fetchUser();
  }, [])

  useEffect(() => {
    if (!user?.id) {
      console.log('[Socket] No user ID, skipping socket initialization');
      return;
    }

    console.log('[Socket] useEffect triggered, socket exists:', !!socket, 'connected:', socket?.connected);

    // Socket.IO 초기화 (한 번만)
    if (!socket) {
      // 분리형 아키텍처: 시그널링 서버로 연결
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
      console.log('[Socket] Creating new socket connection to:', socketUrl, 'userId:', user.id);

      socket = io(socketUrl, {
        auth: {
          userId: user.id
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('[Socket] ✅ Connected! Socket ID:', socket.id);
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        socket.io.engine.on('upgrade', (transport) => {
          console.log('[Socket] Transport upgraded to:', transport.name);
          setTransport(transport.name);
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] ❌ Disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('[Socket] Socket error:', error);
      });
    } else {
      // 소켓이 이미 초기화된 경우 - 즉시 상태 동기화
      console.log('[Socket] Socket already exists, syncing state. Connected:', socket.connected);

      // 즉시 상태 업데이트
      setIsConnected(socket.connected);

      if (socket.connected) {
        console.log('[Socket] ✅ Already connected! Socket ID:', socket.id);
        setTransport(socket.io.engine.transport.name);
      } else {
        console.log('[Socket] Socket exists but not connected, attempting reconnection...');
        socket.connect();
      }
    }

    return () => {
      // 컴포넌트 언마운트 시에는 소켓을 끊지 않음 (재사용)
    };
  }, [user?.id]);

  return {
    socket,
    isConnected,
    transport
  }
}

// 스터디 룸 훅
export function useStudyRoom(studyId) {
  const { socket, isConnected } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!socket || !isConnected || !studyId) return

    // 스터디 참여
    socket.emit('study:join', studyId)

    // 온라인 사용자 목록
    socket.on('study:online-users', (data) => {
      if (data.studyId === studyId) {
        setOnlineUsers(data.users)
      }
    })

    // 사용자 온라인
    socket.on('user:online', (data) => {
      setOnlineUsers((prev) => {
        if (prev.find(u => u.userId === data.userId)) return prev
        return [...prev, data.user]
      })
    })

    // 사용자 오프라인
    socket.on('user:offline', (data) => {
      setOnlineUsers((prev) => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      socket.emit('study:leave', studyId)
      socket.off('study:online-users')
      socket.off('user:online')
      socket.off('user:offline')
    }
  }, [socket, isConnected, studyId])

  return { onlineUsers }
}

// 채팅 훅
export function useChat(studyId) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (!socket || !isConnected || !studyId) return

    // 새 메시지
    socket.on('chat:new-message', (message) => {
      if (message.studyId === studyId) {
        setMessages((prev) => [...prev, message])
      }
    })

    // 메시지 읽음
    socket.on('chat:message-read', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, readers: data.readers }
            : msg
        )
      )
    })

    // 타이핑 중
    socket.on('chat:user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (prev.find(u => u.userId === data.userId)) return prev
          return [...prev, data.user]
        })

        // 3초 후 자동 제거
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId))
        }, 3000)
      } else {
        setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId))
      }
    })

    return () => {
      socket.off('chat:new-message')
      socket.off('chat:message-read')
      socket.off('chat:user-typing')
    }
  }, [socket, isConnected, studyId])

  const sendMessage = useCallback((content, fileId = null) => {
    if (!socket || !isConnected) return

    socket.emit('chat:message', {
      studyId,
      content,
      fileId
    })
  }, [socket, isConnected, studyId])

  const markAsRead = useCallback((messageId) => {
    if (!socket || !isConnected) return

    socket.emit('chat:read', { messageId })
  }, [socket, isConnected])

  const setTyping = useCallback((isTyping) => {
    if (!socket || !isConnected) return

    socket.emit('chat:typing', {
      studyId,
      isTyping
    })
  }, [socket, isConnected, studyId])

  return {
    messages,
    typingUsers,
    sendMessage,
    markAsRead,
    setTyping
  }
}

// 화상회의 훅
export function useVideoCall(roomId) {
  const { socket, isConnected } = useSocket()
  const [participants, setParticipants] = useState([])
  const [inCall, setInCall] = useState(false)

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return

    // 참여자 목록
    socket.on('video:participants', (data) => {
      setParticipants(data.participants)
    })

    // 사용자 참여
    socket.on('video:user-joined', (data) => {
      setParticipants((prev) => {
        if (prev.find(p => p.userId === data.userId)) return prev
        return [...prev, data.user]
      })
    })

    // 사용자 퇴장
    socket.on('video:user-left', (data) => {
      setParticipants((prev) => prev.filter(p => p.userId !== data.userId))
    })

    return () => {
      socket.off('video:participants')
      socket.off('video:user-joined')
      socket.off('video:user-left')
    }
  }, [socket, isConnected, roomId])

  const startCall = useCallback((studyId) => {
    if (!socket || !isConnected) return

    socket.emit('video:start', { studyId, roomId })
    setInCall(true)
  }, [socket, isConnected, roomId])

  const joinCall = useCallback(() => {
    if (!socket || !isConnected) return

    socket.emit('video:join', { roomId })
    setInCall(true)
  }, [socket, isConnected, roomId])

  const leaveCall = useCallback(() => {
    if (!socket || !isConnected) return

    socket.emit('video:leave', { roomId })
    setInCall(false)
  }, [socket, isConnected, roomId])

  const sendSignal = useCallback((to, signal) => {
    if (!socket || !isConnected) return

    socket.emit('video:signal', { to, signal })
  }, [socket, isConnected])

  return {
    participants,
    inCall,
    startCall,
    joinCall,
    leaveCall,
    sendSignal
  }
}

export default useSocket
