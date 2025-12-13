// src/lib/api/index.js
import { api } from './client'

// ==================== 인증 API ====================
// NextAuth 사용으로 대부분의 인증 API는 더 이상 필요하지 않습니다.
// - 로그인: signIn('credentials', { email, password }) 사용
// - 로그아웃: signOut({ callbackUrl: '/' }) 사용
// - 현재 사용자: useSession() 또는 getSession() 사용
export const authApi = {
  // 회원가입만 API로 유지 (회원가입 후 signIn 호출)
  signup: (data) => api.post('/api/auth/signup', data),
}

// ==================== 사용자 API ====================
export const userApi = {
  getMe: () => api.get('/api/users/me'),
  updateProfile: (data) => api.patch('/api/users/me', data),
  changePassword: (data) => api.patch('/api/users/me/password', data),
  getStats: () => api.get('/api/users/me/stats'),
  search: (query) => api.get('/api/users', query),
  getById: (userId) => api.get(`/api/users/${userId}`),
}

// ==================== 대시보드 API ====================
export const dashboardApi = {
  getData: () => api.get('/api/dashboard'),
  getMyStudies: (params) => api.get('/api/my-studies', params),
}

// ==================== 스터디 API ====================
export const studyApi = {
  getList: (params) => api.get('/api/studies', params),
  create: (data) => api.post('/api/studies', data),
  getById: (id) => api.get(`/api/studies/${id}`),
  update: (id, data) => api.patch(`/api/studies/${id}`, data),
  delete: (id) => api.delete(`/api/studies/${id}`),
  join: (id, data) => api.post(`/api/studies/${id}/join`, data),
  leave: (id) => api.post(`/api/studies/${id}/leave`),

  // 멤버 관리
  getMembers: (id, params) => api.get(`/api/studies/${id}/members`, params),
  getJoinRequests: (id) => api.get(`/api/studies/${id}/join-requests`),
  approveJoinRequest: (studyId, requestId) => api.post(`/api/studies/${studyId}/join-requests/${requestId}/approve`),
  rejectJoinRequest: (studyId, requestId, reason) => api.post(`/api/studies/${studyId}/join-requests/${requestId}/reject`, { reason }),
  approveMember: (id, userId) => api.post(`/api/studies/${id}/members/${userId}/approve`),
  rejectMember: (id, userId) => api.post(`/api/studies/${id}/members/${userId}/reject`),
  kickMember: (studyId, memberId, reason) => api.delete(`/api/studies/${studyId}/members/${memberId}`, { reason }),
  changeMemberRole: (studyId, memberId, role) => api.patch(`/api/studies/${studyId}/members/${memberId}/role`, { role }),

  // 초대
  createInvite: (id) => api.post(`/api/studies/${id}/invite`),
  getInvite: (id) => api.get(`/api/studies/${id}/invite`),
}

// ==================== 채팅 API ====================
export const chatApi = {
  getMessages: (studyId, params) => api.get(`/api/studies/${studyId}/chat`, params),
  sendMessage: (studyId, data) => api.post(`/api/studies/${studyId}/chat`, data),
  deleteMessage: (studyId, messageId) => api.delete(`/api/studies/${studyId}/chat/${messageId}`),
  markAsRead: (studyId, messageId) => api.post(`/api/studies/${studyId}/chat/${messageId}/read`),
  search: (studyId, params) => api.get(`/api/studies/${studyId}/chat/search`, params),
}

// ==================== 공지사항 API ====================
export const noticeApi = {
  getList: (studyId, params) => api.get(`/api/studies/${studyId}/notices`, params),
  create: (studyId, data) => api.post(`/api/studies/${studyId}/notices`, data),
  getById: (studyId, noticeId) => api.get(`/api/studies/${studyId}/notices/${noticeId}`),
  update: (studyId, noticeId, data) => api.patch(`/api/studies/${studyId}/notices/${noticeId}`, data),
  delete: (studyId, noticeId) => api.delete(`/api/studies/${studyId}/notices/${noticeId}`),
  togglePin: (studyId, noticeId) => api.post(`/api/studies/${studyId}/notices/${noticeId}/pin`),
}

// ==================== 파일 API ====================
export const fileApi = {
  getList: (studyId, params) => api.get(`/api/studies/${studyId}/files`, params),
  upload: (studyId, formData) => api.upload(`/api/studies/${studyId}/files`, formData),
  delete: (studyId, fileId) => api.delete(`/api/studies/${studyId}/files/${fileId}`),
  download: (studyId, fileId) => `/api/studies/${studyId}/files/${fileId}/download`,
}

// ==================== 캘린더 API ====================
export const calendarApi = {
  getEvents: (studyId, params) => api.get(`/api/studies/${studyId}/calendar`, params),
  createEvent: (studyId, data) => api.post(`/api/studies/${studyId}/calendar`, data),
  updateEvent: (studyId, eventId, data) => api.patch(`/api/studies/${studyId}/calendar/${eventId}`, data),
  deleteEvent: (studyId, eventId) => api.delete(`/api/studies/${studyId}/calendar/${eventId}`),
}

// ==================== 할일 API ====================
export const taskApi = {
  getList: (params) => api.get('/api/tasks', params),
  create: (data) => api.post('/api/tasks', data),
  getById: (id) => api.get(`/api/tasks/${id}`),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  toggle: (id) => api.patch(`/api/tasks/${id}/toggle`),
  getStats: () => api.get('/api/tasks/stats'),
}

// ==================== 스터디 할일 API ====================
export const studyTaskApi = {
  getList: (studyId, params) => api.get(`/api/studies/${studyId}/tasks`, params),
  create: (studyId, data) => api.post(`/api/studies/${studyId}/tasks`, data),
  update: (studyId, taskId, data) => api.patch(`/api/studies/${studyId}/tasks/${taskId}`, data),
  delete: (studyId, taskId) => api.delete(`/api/studies/${studyId}/tasks/${taskId}`),
}

// ==================== 알림 API ====================
export const notificationApi = {
  getList: (params) => api.get('/api/notifications', params),
  markAsRead: (id) => api.post(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.post('/api/notifications/mark-all-read'),
}

