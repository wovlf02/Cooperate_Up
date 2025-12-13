// src/lib/redis.js
import { createClient } from 'redis'

let redisClient = null

export async function getRedisClient() {
  if (redisClient && redisClient.isReady) {
    return redisClient
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis connection failed after 10 retries')
          return new Error('Redis connection failed')
        }
        return retries * 100
      }
    }
  })

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  redisClient.on('connect', () => {
    console.log('Redis Client Connected')
  })

  redisClient.on('ready', () => {
    console.log('Redis Client Ready')
  })

  try {
    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isReady) {
    await redisClient.quit()
    redisClient = null
  }
}

// Refresh Token 관련 유틸리티
const REFRESH_TOKEN_PREFIX = 'refresh_token:'
const REFRESH_TOKEN_USER_PREFIX = 'user_refresh_tokens:'

/**
 * Refresh Token 저장 (7일 TTL)
 */
export async function saveRefreshToken(userId, token, expiresIn = 7 * 24 * 60 * 60) {
  const redis = await getRedisClient()

  // 토큰 -> userId 매핑
  await redis.setEx(`${REFRESH_TOKEN_PREFIX}${token}`, expiresIn, userId)

  // userId -> 토큰 목록 (Set으로 관리)
  await redis.sAdd(`${REFRESH_TOKEN_USER_PREFIX}${userId}`, token)
  await redis.expire(`${REFRESH_TOKEN_USER_PREFIX}${userId}`, expiresIn)
}

/**
 * Refresh Token 검증 및 userId 반환
 */
export async function getRefreshToken(token) {
  const redis = await getRedisClient()
  return await redis.get(`${REFRESH_TOKEN_PREFIX}${token}`)
}

/**
 * Refresh Token 삭제
 */
export async function deleteRefreshToken(token) {
  const redis = await getRedisClient()

  // userId 가져오기
  const userId = await redis.get(`${REFRESH_TOKEN_PREFIX}${token}`)

  // 토큰 삭제
  await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`)

  // 사용자의 토큰 목록에서 제거
  if (userId) {
    await redis.sRem(`${REFRESH_TOKEN_USER_PREFIX}${userId}`, token)
  }
}

/**
 * 사용자의 모든 Refresh Token 삭제 (로그아웃 올 디바이스)
 */
export async function deleteAllRefreshTokens(userId) {
  const redis = await getRedisClient()

  // 사용자의 모든 토큰 가져오기
  const tokens = await redis.sMembers(`${REFRESH_TOKEN_USER_PREFIX}${userId}`)

  // 모든 토큰 삭제
  if (tokens && tokens.length > 0) {
    const pipeline = redis.multi()
    tokens.forEach(token => {
      pipeline.del(`${REFRESH_TOKEN_PREFIX}${token}`)
    })
    await pipeline.exec()
  }

  // 사용자 토큰 목록 삭제
  await redis.del(`${REFRESH_TOKEN_USER_PREFIX}${userId}`)
}

