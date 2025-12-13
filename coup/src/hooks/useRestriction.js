'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

/**
 * 사용자 제재 상태 확인 훅
 * 현재 사용자가 특정 활동에 제한이 있는지 확인
 */
export function useRestriction() {
  const { data: session } = useSession()

  const restrictions = useMemo(() => {
    if (!session?.user) {
      return {
        isRestricted: false,
        restrictedActions: [],
        restrictedUntil: null,
        canCreateStudy: true,
        canJoinStudy: true,
        canSendMessage: true,
      }
    }

    const user = session.user
    const restrictedActions = user.restrictedActions || []
    const restrictedUntil = user.restrictedUntil

    // 제한 기간 만료 체크
    const isExpired = restrictedUntil && new Date(restrictedUntil) < new Date()

    if (isExpired) {
      return {
        isRestricted: false,
        restrictedActions: [],
        restrictedUntil: null,
        canCreateStudy: true,
        canJoinStudy: true,
        canSendMessage: true,
      }
    }

    return {
      isRestricted: restrictedActions.length > 0,
      restrictedActions,
      restrictedUntil,
      canCreateStudy: !restrictedActions.includes('STUDY_CREATE'),
      canJoinStudy: !restrictedActions.includes('STUDY_JOIN'),
      canSendMessage: !restrictedActions.includes('MESSAGE'),
    }
  }, [session])

  return restrictions
}

/**
 * 특정 활동이 가능한지 체크하고 에러 메시지 반환
 */
export function useCanPerformAction(actionType) {
  const restrictions = useRestriction()

  const result = useMemo(() => {
    const actionMap = {
      STUDY_CREATE: {
        allowed: restrictions.canCreateStudy,
        message: '활동 제한으로 인해 스터디를 생성할 수 없습니다.',
      },
      STUDY_JOIN: {
        allowed: restrictions.canJoinStudy,
        message: '활동 제한으로 인해 스터디에 가입할 수 없습니다.',
      },
      MESSAGE: {
        allowed: restrictions.canSendMessage,
        message: '활동 제한으로 인해 메시지를 보낼 수 없습니다.',
      },
    }

    const action = actionMap[actionType]
    if (!action) {
      return { allowed: true, message: null }
    }

    if (!action.allowed && restrictions.restrictedUntil) {
      const untilDate = new Date(restrictions.restrictedUntil).toLocaleDateString('ko-KR')
      return {
        allowed: false,
        message: `${action.message} (${untilDate}까지)`,
      }
    }

    return action
  }, [actionType, restrictions])

  return result
}

export default useRestriction

