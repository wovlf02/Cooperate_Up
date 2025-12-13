// src/lib/jwt.js
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'

// Access Token 생성 (15분)
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m'
  })
}

// Refresh Token 생성 (7일) - 단순 랜덤 문자열
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

// Access Token 검증
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 이전 버전 호환성을 위한 함수들
export function signJWT(payload) {
  return signAccessToken(payload)
}

export function verifyJWT(token) {
  return verifyAccessToken(token)
}


