"use client"
import { useSession } from "next-auth/react"

/**
 * NextAuth 기반 인증 커스텀 훅
 *
 * @returns {Object} 인증 상태 및 사용자 정보
 * @property {Object|null} user - 현재 로그인한 사용자 정보
 * @property {boolean} isLoading - 세션 로딩 중 여부
 * @property {boolean} isAuthenticated - 인증 여부
 * @property {"loading"|"authenticated"|"unauthenticated"} status - 세션 상태
 */
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    status,
  }
}

