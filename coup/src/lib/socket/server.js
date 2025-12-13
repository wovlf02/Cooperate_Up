// src/lib/socket/server.js
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { prisma } from '../prisma.js'
import { log } from '../utils/logger.js'

let io = null

export async function initSocketServer(httpServer) {
  if (io) return io

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Redis Adapter 설정 (멀티 서버 스케일링)
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL })
      const subClient = pubClient.duplicate()

      await Promise.all([pubClient.connect(), subClient.connect()])

      io.adapter(createAdapter(pubClient, subClient))
      log.info('Socket.IO Redis Adapter connected')
    } catch (error) {
      log.warn('Redis not available, using default adapter', error)
    }
  }

  // 인증 미들웨어
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId
      const token = socket.handshake.auth.token

      log.info(`🔐 Socket auth attempt: userId=${userId}`)

      // userId 없으면 연결 거부
      if (!userId) {
        log.warn('❌ Socket connection rejected: No userId provided')
        return next(new Error('Authentication required'))
      }

      // 사용자 존재 확인
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true
        }
      })

      log.info(`🔍 User lookup: ${user ? `Found ${user.name} (${user.email}) - status: ${user.status}` : 'Not found'}`)

      // 사용자 없으면 연결 거부
      if (!user) {
        log.warn(`❌ Socket connection rejected: User not found - ${userId}`)
        return next(new Error('User not found'))
      }

      // 비활성 상태면 연결 거부
      if (user.status !== 'ACTIVE') {
        log.warn(`❌ Socket connection rejected: User not active - ${userId} (status: ${user.status})`)
        return next(new Error(`User status is ${user.status}`))
      }

      // 인증 성공
      socket.userId = userId
      socket.user = user
      log.info(`✅ Socket authenticated: ${user.name} (${user.email})`)
      next()
    } catch (error) {
      log.error('❌ Socket authentication error:', error)
      next(new Error('Authentication failed: ' + error.message))
    }
  })

  // 연결 이벤트
  io.on('connection', (socket) => {
    log.info(`User connected: ${socket.userId}`, {
      userId: socket.userId,
      socketId: socket.id
    })

    // 사용자 온라인 상태 설정
    handleUserOnline(socket)

    // 스터디 룸 참여
    handleStudyRooms(socket)

    // 채팅 이벤트
    handleChatEvents(socket)

    // 타이핑 이벤트
    handleTypingEvents(socket)

    // 화상회의 이벤트
    handleVideoCallEvents(socket)

    // 연결 해제
    socket.on('disconnect', () => {
      handleUserOffline(socket)
      log.info(`User disconnected: ${socket.userId}`)
    })
  })

  log.info('Socket.IO server initialized')
  return io
}

// 사용자 온라인 상태 관리
async function handleUserOnline(socket) {
  const userId = socket.userId

  // 온라인 상태 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  })

  // 사용자의 모든 스터디에 온라인 알림
  const studyMembers = await prisma.studyMember.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { studyId: true }
  })

  studyMembers.forEach(({ studyId }) => {
    socket.join(`study:${studyId}`)
    socket.to(`study:${studyId}`).emit('user:online', {
      userId,
      user: socket.user,
      timestamp: new Date()
    })
  })

  // 본인에게 온라인 사용자 목록 전송
  studyMembers.forEach(({ studyId }) => {
    const onlineUsers = getOnlineUsersInStudy(studyId)
    socket.emit('study:online-users', {
      studyId,
      users: onlineUsers
    })
  })
}

async function handleUserOffline(socket) {
  const userId = socket.userId

  // 모든 스터디에 오프라인 알림
  const rooms = Array.from(socket.rooms).filter(room => room.startsWith('study:'))
  
  rooms.forEach(room => {
    socket.to(room).emit('user:offline', {
      userId,
      timestamp: new Date()
    })
  })
}

// 스터디 룸 관리
function handleStudyRooms(socket) {
  // 스터디 참여
  socket.on('study:join', async (studyId) => {
    try {
      // 멤버 확인
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: socket.userId
          }
        }
      })

      if (!member || member.status !== 'ACTIVE') {
        socket.emit('error', { message: '스터디 멤버가 아닙니다' })
        return
      }

      socket.join(`study:${studyId}`)
      
      // 온라인 사용자 목록 전송
      const onlineUsers = getOnlineUsersInStudy(studyId)
      socket.emit('study:online-users', {
        studyId,
        users: onlineUsers
      })

      log.info(`User ${socket.userId} joined study ${studyId}`)
    } catch (error) {
      log.error('Study join error', error)
      socket.emit('error', { message: '스터디 참여 실패' })
    }
  })

  // 스터디 나가기
  socket.on('study:leave', (studyId) => {
    socket.leave(`study:${studyId}`)
    log.info(`User ${socket.userId} left study ${studyId}`)
  })
}

// 채팅 이벤트
function handleChatEvents(socket) {
  // 메시지 전송
  socket.on('chat:message', async (data) => {
    const { studyId, content, fileId } = data

    try {
      // 메시지 저장
      const message = await prisma.message.create({
        data: {
          studyId,
          userId: socket.userId,
          content,
          fileId,
          readers: [socket.userId]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          file: {
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
              size: true
            }
          }
        }
      })

      // 스터디 룸에 브로드캐스트
      io.to(`study:${studyId}`).emit('chat:new-message', message)

      log.info(`Message sent in study ${studyId}`, {
        userId: socket.userId,
        messageId: message.id
      })
    } catch (error) {
      log.error('Chat message error', error)
      socket.emit('error', { message: '메시지 전송 실패' })
    }
  })

  // 메시지 읽음 처리
  socket.on('chat:read', async (data) => {
    const { messageId } = data

    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      })

      if (!message) return

      // readers 배열에 추가
      if (!message.readers.includes(socket.userId)) {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            readers: {
              push: socket.userId
            }
          }
        })

        // 스터디 룸에 읽음 상태 브로드캐스트
        io.to(`study:${message.studyId}`).emit('chat:message-read', {
          messageId,
          userId: socket.userId,
          readers: [...message.readers, socket.userId]
        })
      }
    } catch (error) {
      log.error('Chat read error', error)
    }
  })
}

// 타이핑 이벤트
function handleTypingEvents(socket) {
  socket.on('chat:typing', (data) => {
    const { studyId, isTyping } = data

    socket.to(`study:${studyId}`).emit('chat:user-typing', {
      userId: socket.userId,
      user: socket.user,
      isTyping
    })
  })
}

// 화상회의 이벤트
function handleVideoCallEvents(socket) {
  // 화상회의 시작
  socket.on('video:start', async (data) => {
    const { studyId, roomId } = data

    try {
      socket.join(`video:${roomId}`)

      // 스터디 멤버들에게 알림
      socket.to(`study:${studyId}`).emit('video:started', {
        roomId,
        startedBy: socket.user,
        timestamp: new Date()
      })

      log.info(`Video call started: ${roomId}`, {
        userId: socket.userId,
        studyId
      })
    } catch (error) {
      log.error('Video start error', error)
    }
  })

  // 화상회의 참여
  socket.on('video:join', (data) => {
    const { roomId } = data

    socket.join(`video:${roomId}`)

    // 기존 참여자들에게 알림
    socket.to(`video:${roomId}`).emit('video:user-joined', {
      userId: socket.userId,
      user: socket.user
    })

    // 본인에게 기존 참여자 목록 전송
    const participants = getVideoCallParticipants(roomId)
    socket.emit('video:participants', { participants })
  })

  // WebRTC 시그널링
  socket.on('video:signal', (data) => {
    const { to, signal } = data

    io.to(to).emit('video:signal', {
      from: socket.id,
      signal
    })
  })

  // 화상회의 나가기
  socket.on('video:leave', (data) => {
    const { roomId } = data

    socket.leave(`video:${roomId}`)
    socket.to(`video:${roomId}`).emit('video:user-left', {
      userId: socket.userId
    })
  })
}

// 헬퍼 함수
function getOnlineUsersInStudy(studyId) {
  const room = io.sockets.adapter.rooms.get(`study:${studyId}`)
  if (!room) return []

  const users = []
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId)
    if (socket && socket.user) {
      users.push({
        userId: socket.userId,
        ...socket.user
      })
    }
  }
  return users
}

function getVideoCallParticipants(roomId) {
  const room = io.sockets.adapter.rooms.get(`video:${roomId}`)
  if (!room) return []

  const participants = []
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId)
    if (socket && socket.user) {
      participants.push({
        socketId,
        userId: socket.userId,
        ...socket.user
      })
    }
  }
  return participants
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

