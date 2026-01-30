# 🪝 Custom Hooks

## 개요

재사용 가능한 Custom Hooks입니다.

---

## 파일 구조

```
coup/src/
├── hooks/                       # 페이지용 Hooks
│   ├── index.js
│   ├── useRestriction.js        # 제재 상태 확인
│   └── useSettingsUtils.js      # 설정 유틸리티
└── lib/hooks/                   # 공용 Hooks
    ├── useApi.js                # React Query 훅
    ├── useAuth.js               # 인증 훅
    ├── useDynamicPagination.js  # 동적 페이지네이션
    ├── useErrorHandler.js       # 에러 핸들링
    ├── useOptimisticMessage.js  # 낙관적 메시지
    ├── useSocket.js             # Socket 훅
    ├── useStudySocket.js        # 스터디 소켓
    └── useVideoCall.js          # 화상 통화
```

---

## useApi.js (React Query)

React Query 기반 데이터 페칭 훅입니다.

### 사용자 관련

```javascript
import { useMe, useUserStats, useUpdateProfile, useChangePassword, useSearchUsers } from '@/lib/hooks/useApi'

// 현재 사용자 정보
const { data, isLoading, error } = useMe()

// 사용자 통계
const { data: stats } = useUserStats()

// 프로필 업데이트
const { mutate: updateProfile, isPending } = useUpdateProfile()
updateProfile({ name: '새 이름', bio: '자기소개' })

// 비밀번호 변경
const { mutate: changePassword } = useChangePassword()
changePassword({ currentPassword: '...', newPassword: '...' })

// 사용자 검색
const { data: users } = useSearchUsers('검색어')
```

### 대시보드

```javascript
import { useDashboard } from '@/lib/hooks/useApi'

// 대시보드 데이터 (30초마다 자동 갱신)
const { data, isLoading, refetch } = useDashboard()
```

**useDashboard 옵션:**
- `refetchInterval`: 30초
- `staleTime`: 20초
- `gcTime`: 5분
- `refetchOnWindowFocus`: true
- `retry`: 3회

### 스터디 관련

```javascript
import { useStudies, useStudy, useMyStudies, useCreateStudy, useUpdateStudy } from '@/lib/hooks/useApi'

// 스터디 목록
const { data } = useStudies({ page: 1, category: 'programming' })

// 스터디 상세
const { data: study } = useStudy(studyId)

// 내 스터디 (1분마다 자동 갱신)
const { data: myStudies } = useMyStudies()

// 스터디 생성
const { mutate: createStudy } = useCreateStudy()
createStudy({ name: '스터디명', description: '설명' })

// 스터디 수정
const { mutate: updateStudy } = useUpdateStudy()
updateStudy({ id: studyId, data: { name: '새 이름' } })
```

### 알림 관련

```javascript
import { useNotifications, useMarkAllNotificationsAsRead } from '@/lib/hooks/useApi'

// 알림 목록
const { data: notifications } = useNotifications({ limit: 10 })

// 모든 알림 읽음 처리
const { mutate: markAllRead } = useMarkAllNotificationsAsRead()
markAllRead()
```

### 채팅 관련

```javascript
import { useMessages, useSendMessage } from '@/lib/hooks/useApi'

// 메시지 목록
const { data: messages } = useMessages(studyId, { page: 1 })

// 메시지 전송
const { mutate: sendMessage } = useSendMessage()
sendMessage({ studyId, content: '메시지 내용' })
```

### 파일 관련

```javascript
import { useFiles, useUploadFile } from '@/lib/hooks/useApi'

// 파일 목록
const { data: files } = useFiles(studyId)

// 파일 업로드
const { mutate: uploadFile } = useUploadFile()
uploadFile({ studyId, file: fileObject })
```

### 일정 관련

```javascript
import { useEvents, useCreateEvent } from '@/lib/hooks/useApi'

// 일정 목록
const { data: events } = useEvents(studyId, { month: '2024-12' })

// 일정 생성
const { mutate: createEvent } = useCreateEvent()
createEvent({ studyId, title: '일정 제목', startDate: '...' })
```

---

## useRestriction

사용자 제재 상태를 확인합니다.

### 반환값

| 필드 | Type | 설명 |
|------|------|------|
| isRestricted | `boolean` | 제재 여부 |
| restrictedActions | `string[]` | 제한된 활동 목록 |
| restrictedUntil | `Date \| null` | 제한 해제 시간 |
| canCreateStudy | `boolean` | 스터디 생성 가능 여부 |
| canJoinStudy | `boolean` | 스터디 가입 가능 여부 |
| canSendMessage | `boolean` | 메시지 전송 가능 여부 |

### 제한 타입

| 타입 | 설명 |
|------|------|
| STUDY_CREATE | 스터디 생성 제한 |
| STUDY_JOIN | 스터디 가입 제한 |
| MESSAGE | 메시지 전송 제한 |

### 사용 예시

```jsx
import { useRestriction, useCanPerformAction } from '@/hooks/useRestriction'

function CreateStudyButton() {
  const { isRestricted, canCreateStudy, restrictedUntil } = useRestriction()

  if (!canCreateStudy) {
    return <button disabled>스터디 생성 불가 (제한됨)</button>
  }

  return <button>스터디 만들기</button>
}

// 특정 액션 체크
function SendMessageButton() {
  const { allowed, message } = useCanPerformAction('MESSAGE')

  if (!allowed) {
    return <span>{message}</span>
  }

  return <button>메시지 보내기</button>
}
```

---

## useSocket

Socket.io 연결을 관리합니다.

### 반환값

| 필드 | Type | 설명 |
|------|------|------|
| socket | `Socket \| null` | Socket 인스턴스 |
| isConnected | `boolean` | 연결 상태 |
| emit | `function` | 이벤트 전송 |
| on | `function` | 이벤트 리스너 등록 |
| off | `function` | 이벤트 리스너 해제 |

### 사용 예시

```jsx
import { useSocket } from '@/lib/hooks/useSocket'

function ChatComponent() {
  const { socket, isConnected, emit, on, off } = useSocket()

  useEffect(() => {
    const handleMessage = (message) => {
      console.log('새 메시지:', message)
    }

    on('message', handleMessage)
    return () => off('message', handleMessage)
  }, [on, off])

  const sendMessage = (content) => {
    emit('message', { content })
  }

  return <div>{isConnected ? '연결됨' : '연결 안됨'}</div>
}
```

---

## useStudySocket

스터디별 Socket 이벤트를 관리합니다.

### 사용 예시

```jsx
import { useStudySocket } from '@/lib/hooks/useStudySocket'

function StudyChatComponent({ studyId }) {
  const { joinRoom, leaveRoom, sendMessage, messages } = useStudySocket(studyId)

  useEffect(() => {
    joinRoom()
    return () => leaveRoom()
  }, [studyId])

  return <div>채팅 컴포넌트</div>
}
```

---

## useDynamicPagination

동적 페이지네이션을 관리합니다.

### 반환값

| 필드 | Type | 설명 |
|------|------|------|
| page | `number` | 현재 페이지 |
| limit | `number` | 페이지당 항목 수 |
| setPage | `function` | 페이지 변경 |
| setLimit | `function` | limit 변경 |
| offset | `number` | 오프셋 값 |

### 사용 예시

```jsx
import { useDynamicPagination } from '@/lib/hooks/useDynamicPagination'

function ListComponent() {
  const { page, limit, setPage, offset } = useDynamicPagination({
    initialPage: 1,
    initialLimit: 20
  })

  const { data } = useStudies({ page, limit })

  return (
    <div>
      {/* 목록 렌더링 */}
      <button onClick={() => setPage(page + 1)}>다음</button>
    </div>
  )
}
```

---

## useErrorHandler

에러 핸들링을 관리합니다.

### 사용 예시

```jsx
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'

function FormComponent() {
  const { handleError, clearError, error } = useErrorHandler()

  const handleSubmit = async () => {
    try {
      await api.post('/api/submit', data)
    } catch (e) {
      handleError(e)
    }
  }

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      <button onClick={handleSubmit}>제출</button>
    </div>
  )
}
```

---

## useVideoCall

화상 통화를 관리합니다.

### 반환값

| 필드 | Type | 설명 |
|------|------|------|
| localStream | `MediaStream` | 로컬 비디오/오디오 |
| remoteStreams | `Map` | 원격 스트림들 |
| isConnected | `boolean` | 연결 상태 |
| isMuted | `boolean` | 음소거 상태 |
| isVideoOff | `boolean` | 비디오 끔 상태 |
| toggleMute | `function` | 음소거 토글 |
| toggleVideo | `function` | 비디오 토글 |
| joinCall | `function` | 통화 참여 |
| leaveCall | `function` | 통화 종료 |

### 사용 예시

```jsx
import { useVideoCall } from '@/lib/hooks/useVideoCall'

function VideoCallComponent({ roomId }) {
  const {
    localStream,
    remoteStreams,
    isConnected,
    isMuted,
    toggleMute,
    toggleVideo,
    joinCall,
    leaveCall
  } = useVideoCall(roomId)

  return (
    <div>
      <video ref={el => el && (el.srcObject = localStream)} />
      <button onClick={toggleMute}>{isMuted ? '음소거 해제' : '음소거'}</button>
      <button onClick={toggleVideo}>비디오 토글</button>
      <button onClick={leaveCall}>나가기</button>
    </div>
  )
}
```

---

## 관련 문서

- [Context Providers](./contexts.md)
- [UI 컴포넌트](./components.md)
- [API 클라이언트](./api-client.md)
- [README](./README.md)

