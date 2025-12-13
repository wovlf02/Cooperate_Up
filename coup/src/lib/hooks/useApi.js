// src/lib/hooks/useApi.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// ==================== 사용자 ====================
export function useMe(options = {}) {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get('/api/auth/me'),
    enabled: options.enabled !== false,
    ...options,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => api.get('/api/user/stats'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/api/user/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'me'])
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => api.put('/api/user/password', data),
  })
}

export function useSearchUsers(query) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => api.get('/api/users/search', { q: query }),
    enabled: !!query,
  })
}

export function useUser(userId) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.get(`/api/users/${userId}`),
    enabled: !!userId,
  })
}

// ==================== 대시보드 ====================
/**
 * Dashboard 데이터 조회 Hook
 * - 30초마다 자동 갱신
 * - 20초 stale time
 * - 5분 캐시 유지
 * - 창 포커스 시 재검증
 * @param {Object} options - React Query 옵션 (선택)
 * @returns {Object} useQuery 결과
 */
export function useDashboard(options = {}) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),

    // 실시간 업데이트 설정
    refetchInterval: 30000, // 30초마다 갱신
    refetchIntervalInBackground: false, // 백그라운드에서는 갱신 안함
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
    refetchOnReconnect: true, // 재연결 시 갱신

    // 캐시 설정
    staleTime: 20000, // 20초 동안 데이터를 신선하다고 간주
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지 (구 cacheTime)

    // 에러 처리
    retry: 3, // 3회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프

    // 사용자 정의 옵션 병합
    ...options
  })
}

// ==================== 스터디 ====================
/**
 * 내 스터디 목록 조회 Hook
 * - 1분마다 자동 갱신
 * - 창 포커스 시 갱신
 * @param {Object} params - 쿼리 파라미터
 * @param {Object} options - React Query 옵션
 * @returns {Object} useQuery 결과
 */
export function useMyStudies(params = {}, options = {}) {
  return useQuery({
    queryKey: ['my-studies', params],
    queryFn: () => api.get('/api/my-studies', params),

    // 실시간 업데이트
    refetchInterval: 60000, // 1분마다 갱신
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30초
    gcTime: 10 * 60 * 1000, // 10분

    ...options
  })
}

export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/api/studies', params),
  })
}

export function useStudy(id) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: () => api.get(`/api/studies/${id}`),
    enabled: !!id,
  })
}

export function useCreateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/studies', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useUpdateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/studies/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

export function useDeleteStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/studies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}

/**
 * 스터디 가입 Hook (Optimistic Update)
 * - 즉시 내 스터디 목록에 추가
 * - 실패 시 롤백
 * @returns {Object} useMutation 결과
 */
export function useJoinStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/api/studies/${id}/join`, data),

    // Optimistic Update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['studies', id] })
      await queryClient.cancelQueries({ queryKey: ['my-studies'] })

      const previousStudy = queryClient.getQueryData(['studies', id])
      const previousMyStudies = queryClient.getQueryData(['my-studies'])

      // 스터디 멤버 수 증가
      queryClient.setQueryData(['studies', id], (old) => {
        if (!old) return old
        return {
          ...old,
          memberCount: (old.memberCount || 0) + 1
        }
      })

      return { previousStudy, previousMyStudies }
    },

    // 에러 시 롤백
    onError: (err, { id }, context) => {
      if (context?.previousStudy) {
        queryClient.setQueryData(['studies', id], context.previousStudy)
      }
      if (context?.previousMyStudies) {
        queryClient.setQueryData(['my-studies'], context.previousMyStudies)
      }
    },

    // 성공 시 갱신
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

/**
 * 스터디 탈퇴 Hook (Optimistic Update)
 * - 즉시 내 스터디 목록에서 제거
 * - 실패 시 복원
 * @returns {Object} useMutation 결과
 */
export function useLeaveStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/studies/${id}/leave`),

    // Optimistic Update
    onMutate: async (studyId) => {
      // 해당 스터디 관련 모든 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['studies', studyId] })
      await queryClient.cancelQueries({ queryKey: ['my-studies'] })

      const previousStudies = queryClient.getQueryData(['studies'])
      const previousMyStudies = queryClient.getQueryData(['my-studies'])

      // 내 스터디 목록에서 제거
      queryClient.setQueryData(['my-studies'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            studies: old.data?.studies?.filter(study => study.study?.id !== studyId)
          }
        }
      })

      return { previousStudies, previousMyStudies, studyId }
    },

    // 에러 시 복원
    onError: (err, studyId, context) => {
      if (context?.previousStudies) {
        queryClient.setQueryData(['studies'], context.previousStudies)
      }
      if (context?.previousMyStudies) {
        queryClient.setQueryData(['my-studies'], context.previousMyStudies)
      }
    },

    // 성공 시 해당 스터디 관련 캐시 모두 제거
    onSuccess: (_, studyId) => {
      // 탈퇴한 스터디 관련 캐시 즉시 제거
      queryClient.removeQueries({ queryKey: ['studies', studyId] })

      // 다른 쿼리들 갱신
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

/**
 * OWNER 권한 위임 Hook
 * - OWNER만 사용 가능
 * - ADMIN에게만 위임 가능
 * - 위임 후 원래 OWNER는 ADMIN으로 강등
 * @returns {Object} useMutation 결과
 */
export function useTransferOwnership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, targetUserId }) =>
      api.post(`/api/studies/${studyId}/transfer-ownership`, { targetUserId }),

    onSuccess: (data, variables) => {
      // 스터디 정보 갱신
      queryClient.invalidateQueries({ queryKey: ['studies', variables.studyId] })
      queryClient.invalidateQueries({ queryKey: ['studies', variables.studyId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
    }
  })
}

// ==================== 스터디 멤버 ====================
export function useStudyMembers(studyId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'members', params],
    queryFn: () => api.get(`/api/studies/${studyId}/members`, params),
    enabled: !!studyId,
    ...options, // 외부에서 enabled 등을 오버라이드 가능
  })
}

export function useJoinRequests(studyId) {
  return useQuery({
    queryKey: ['studies', studyId, 'join-requests'],
    queryFn: () => api.get(`/api/studies/${studyId}/join-requests`),
    enabled: !!studyId,
    staleTime: 0, // 항상 최신 데이터 조회
  })
}

export function useApproveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => api.post(`/api/studies/${studyId}/members/${userId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useRejectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => api.post(`/api/studies/${studyId}/members/${userId}/reject`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId, reason }) =>
      api.post(`/api/studies/${studyId}/join-requests/${requestId}/reject`, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}

// 멤버 역할 변경 (OWNER만 가능)
export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, memberId, role }) => 
      api.patch(`/api/studies/${studyId}/members/${memberId}/role`, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}

// 멤버 강퇴 (ADMIN 이상 가능)
export function useKickMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, memberId, reason }) => 
      api.delete(`/api/studies/${studyId}/members/${memberId}`, { reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}

// 가입 신청 승인
export function useApproveJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId }) => 
      api.post(`/api/studies/${studyId}/join-requests/${requestId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}

// ==================== 채팅 ====================
export function useChatMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'chat', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat`, params),
    enabled: !!studyId,
  })
}

// 별칭: useMessages (useChatMessages와 동일)
export function useMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat`, params),
    enabled: !!studyId,
    refetchInterval: 5000, // 5초마다 새 메시지 확인
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/chat`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'chat'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, messageId }) => api.delete(`/api/studies/${studyId}/chat/${messageId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'chat'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}

export function useSearchChat(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'chat', 'search', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat/search`, params),
    enabled: !!studyId && !!params.q,
  })
}

// ==================== 공지사항 ====================
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', params],
    queryFn: () => api.get(`/api/studies/${studyId}/notices`, params),
    enabled: !!studyId,
  })
}

export function useNotice(studyId, noticeId) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', noticeId],
    queryFn: () => api.get(`/api/studies/${studyId}/notices/${noticeId}`),
    enabled: !!studyId && !!noticeId,
  })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/notices`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices'
        }
      })
    },
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId, data }) => api.patch(`/api/studies/${studyId}/notices/${noticeId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices'
        }
      })
    },
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => api.delete(`/api/studies/${studyId}/notices/${noticeId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices'
        }
      })
    },
  })
}

export function useTogglePinNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => api.post(`/api/studies/${studyId}/notices/${noticeId}/pin`),
    onSuccess: (_, variables) => {
      // notices 관련 모든 쿼리 무효화 (params 포함한 쿼리도)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices'
        }
      })
    },
  })
}

// ==================== 파일 ====================
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'files', params],
    queryFn: () => api.get(`/api/studies/${studyId}/files`, params),
    enabled: !!studyId,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, formData }) => api.post(`/api/studies/${studyId}/files`, formData, { headers: {} }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, fileId }) => api.delete(`/api/studies/${studyId}/files/${fileId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}

// ==================== 캘린더 ====================
export function useEvents(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'calendar', params],
    queryFn: () => api.get(`/api/studies/${studyId}/calendar`, params),
    enabled: !!studyId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/calendar`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId, data }) => api.patch(`/api/studies/${studyId}/calendar/${eventId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId }) => api.delete(`/api/studies/${studyId}/calendar/${eventId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar'])
    },
  })
}

// ==================== 할일 ====================
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/api/tasks', params),
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get(`/api/tasks/${id}`),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['tasks', variables.id])
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/api/tasks/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

// ==================== 스터디 할일 ====================
export function useStudyTasks(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'tasks', params],
    queryFn: () => api.get(`/api/studies/${studyId}/tasks`, params),
    enabled: !!studyId,
  })
}

export function useCreateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useUpdateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId, data }) => api.patch(`/api/studies/${studyId}/tasks/${taskId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useDeleteStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId }) => api.delete(`/api/studies/${studyId}/tasks/${taskId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => api.get('/api/tasks/stats'),
  })
}

// ==================== 알림 ====================
export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.get('/api/notifications', params),
    enabled: options.enabled !== false,
    ...options,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}
