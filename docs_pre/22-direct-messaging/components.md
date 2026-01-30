# 프론트엔드 컴포넌트 구조

## 개요

1:1 및 그룹 채팅 UI 구현을 위한 React 컴포넌트 설계입니다.

---

## 디렉토리 구조

```
src/
├── app/
│   └── messages/
│       ├── page.jsx                    # 채팅방 목록
│       ├── layout.jsx                  # 메시지 레이아웃
│       ├── new/
│       │   ├── page.jsx                # 새 대화 시작
│       │   └── group/
│       │       └── page.jsx            # 그룹 생성
│       └── [roomId]/
│           ├── page.jsx                # 채팅방
│           └── settings/
│               └── page.jsx            # 채팅방 설정
│
├── components/
│   └── dm/
│       ├── index.js                    # 배럴 파일
│       │
│       ├── layout/
│       │   ├── DMLayout.jsx            # DM 전체 레이아웃
│       │   ├── DMSidebar.jsx           # 좌측 사이드바
│       │   └── DMHeader.jsx            # 상단 헤더
│       │
│       ├── room-list/
│       │   ├── RoomList.jsx            # 채팅방 목록
│       │   ├── RoomListItem.jsx        # 채팅방 항목
│       │   ├── RoomListSkeleton.jsx    # 로딩 스켈레톤
│       │   ├── RoomSearch.jsx          # 채팅방 검색
│       │   └── RoomFilter.jsx          # 필터 (전체/1:1/그룹)
│       │
│       ├── chat-room/
│       │   ├── ChatRoom.jsx            # 채팅방 메인
│       │   ├── ChatHeader.jsx          # 채팅방 헤더
│       │   ├── ChatBody.jsx            # 메시지 영역
│       │   └── ChatFooter.jsx          # 입력 영역
│       │
│       ├── message/
│       │   ├── MessageList.jsx         # 메시지 목록
│       │   ├── MessageItem.jsx         # 메시지 아이템
│       │   ├── MessageBubble.jsx       # 메시지 버블
│       │   ├── MessageInput.jsx        # 메시지 입력
│       │   ├── MessageReply.jsx        # 답장 표시
│       │   ├── MessageReactions.jsx    # 반응 표시
│       │   ├── MessageFile.jsx         # 파일 메시지
│       │   ├── MessageImage.jsx        # 이미지 메시지
│       │   ├── MessageSystem.jsx       # 시스템 메시지
│       │   ├── MessageMenu.jsx         # 메시지 컨텍스트 메뉴
│       │   └── MessageSkeleton.jsx     # 로딩 스켈레톤
│       │
│       ├── input/
│       │   ├── InputArea.jsx           # 입력 영역 컨테이너
│       │   ├── TextInput.jsx           # 텍스트 입력
│       │   ├── EmojiPicker.jsx         # 이모지 선택
│       │   ├── FileUploader.jsx        # 파일 업로드
│       │   ├── ReplyPreview.jsx        # 답장 미리보기
│       │   └── TypingIndicator.jsx     # 타이핑 표시
│       │
│       ├── member/
│       │   ├── MemberList.jsx          # 멤버 목록
│       │   ├── MemberItem.jsx          # 멤버 아이템
│       │   ├── MemberInviteModal.jsx   # 멤버 초대 모달
│       │   └── MemberRoleMenu.jsx      # 권한 변경 메뉴
│       │
│       ├── create/
│       │   ├── NewChatModal.jsx        # 새 대화 모달
│       │   ├── UserSearchInput.jsx     # 사용자 검색
│       │   ├── SelectedUserList.jsx    # 선택된 사용자
│       │   └── GroupInfoForm.jsx       # 그룹 정보 입력
│       │
│       ├── settings/
│       │   ├── RoomSettings.jsx        # 채팅방 설정
│       │   ├── NotificationSettings.jsx # 알림 설정
│       │   └── LeaveRoomModal.jsx      # 나가기 확인
│       │
│       └── common/
│           ├── Avatar.jsx              # 아바타
│           ├── AvatarGroup.jsx         # 그룹 아바타
│           ├── OnlineStatus.jsx        # 온라인 상태
│           ├── UnreadBadge.jsx         # 안읽음 뱃지
│           ├── TimeStamp.jsx           # 시간 표시
│           └── EmptyState.jsx          # 빈 상태
│
├── hooks/
│   └── dm/
│       ├── useDMSocket.js              # 소켓 훅
│       ├── useChatRooms.js             # 채팅방 목록 훅
│       ├── useChatRoom.js              # 채팅방 상세 훅
│       ├── useMessages.js              # 메시지 훅
│       ├── useTyping.js                # 타이핑 훅
│       └── useUnreadCount.js           # 안읽음 카운트 훅
│
├── contexts/
│   └── DMContext.jsx                   # DM 전역 상태
│
└── lib/
    └── dm/
        ├── api.js                      # API 호출 함수
        └── utils.js                    # 유틸 함수
```

---

## 핵심 컴포넌트

### 1. DMLayout.jsx

채팅 화면 전체 레이아웃

```jsx
'use client'

import { useState } from 'react'
import { DMSidebar } from './DMSidebar'
import { ChatRoom } from '../chat-room/ChatRoom'
import { DMContextProvider } from '@/contexts/DMContext'

export function DMLayout({ children }) {
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  
  return (
    <DMContextProvider>
      <div className="flex h-screen">
        {/* 좌측: 채팅방 목록 */}
        <aside className="w-80 border-r flex-shrink-0 hidden md:flex flex-col">
          <DMSidebar 
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        </aside>
        
        {/* 우측: 채팅 내용 */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </DMContextProvider>
  )
}
```

### 2. RoomListItem.jsx

채팅방 목록 항목

```jsx
import { Avatar, AvatarGroup } from '../common/Avatar'
import { OnlineStatus } from '../common/OnlineStatus'
import { UnreadBadge } from '../common/UnreadBadge'
import { TimeStamp } from '../common/TimeStamp'
import { PinIcon, BellOffIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function RoomListItem({ room, isSelected, onClick }) {
  const { 
    id, 
    type, 
    name, 
    imageUrl, 
    participants, 
    lastMessage, 
    unreadCount,
    isPinned,
    isMuted,
    updatedAt 
  } = room
  
  // 1:1 채팅인 경우 상대방 정보
  const otherUser = type === 'DIRECT' ? participants[0] : null
  
  // 표시할 이름
  const displayName = type === 'DIRECT' 
    ? otherUser?.name 
    : name
  
  // 표시할 이미지
  const displayImage = type === 'DIRECT'
    ? otherUser?.avatar
    : imageUrl
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        'hover:bg-gray-100',
        isSelected && 'bg-blue-50 hover:bg-blue-50'
      )}
    >
      {/* 아바타 */}
      <div className="relative flex-shrink-0">
        {type === 'DIRECT' ? (
          <>
            <Avatar src={displayImage} name={displayName} size={48} />
            <OnlineStatus 
              isOnline={otherUser?.isOnline} 
              className="absolute -bottom-0.5 -right-0.5"
            />
          </>
        ) : (
          <AvatarGroup 
            users={participants.slice(0, 4)} 
            size={48}
            fallbackImage={displayImage}
          />
        )}
      </div>
      
      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate flex items-center gap-1">
            {isPinned && <PinIcon className="w-3 h-3 text-gray-400" />}
            {displayName}
            {type === 'GROUP' && (
              <span className="text-xs text-gray-400">
                ({room.memberCount})
              </span>
            )}
          </span>
          <TimeStamp date={updatedAt} className="text-xs text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-500 truncate">
            {lastMessage?.type === 'IMAGE' && '📷 사진'}
            {lastMessage?.type === 'FILE' && '📎 파일'}
            {lastMessage?.type === 'TEXT' && lastMessage.content}
            {!lastMessage && '대화를 시작해보세요'}
          </p>
          
          <div className="flex items-center gap-1">
            {isMuted && <BellOffIcon className="w-4 h-4 text-gray-400" />}
            {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3. MessageItem.jsx

메시지 아이템

```jsx
import { useState, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageReply } from './MessageReply'
import { MessageReactions } from './MessageReactions'
import { MessageMenu } from './MessageMenu'
import { Avatar } from '../common/Avatar'
import { TimeStamp } from '../common/TimeStamp'
import { cn } from '@/lib/utils'

export function MessageItem({ 
  message, 
  isOwn, 
  showAvatar, 
  showTime,
  onReply,
  onEdit,
  onDelete,
  onReaction 
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  
  const { 
    id, 
    content, 
    type, 
    sender, 
    replyTo, 
    reactions,
    isEdited, 
    createdAt 
  } = message
  
  return (
    <div 
      className={cn(
        'group flex gap-2 px-4 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* 아바타 */}
      <div className="w-8 flex-shrink-0">
        {showAvatar && !isOwn && (
          <Avatar src={sender.avatar} name={sender.name} size={32} />
        )}
      </div>
      
      {/* 메시지 내용 */}
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* 발신자 이름 (그룹, 상대방만) */}
        {showAvatar && !isOwn && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {sender.name}
          </span>
        )}
        
        {/* 답장 대상 */}
        {replyTo && (
          <MessageReply 
            message={replyTo} 
            isOwn={isOwn}
          />
        )}
        
        {/* 메시지 버블 */}
        <div className="relative">
          <MessageBubble 
            content={content}
            type={type}
            isOwn={isOwn}
            fileUrl={message.fileUrl}
            fileName={message.fileName}
            thumbnailUrl={message.thumbnailUrl}
          />
          
          {/* 컨텍스트 메뉴 */}
          {showMenu && (
            <MessageMenu
              ref={menuRef}
              isOwn={isOwn}
              onReply={() => onReply(message)}
              onEdit={isOwn ? () => onEdit(message) : null}
              onDelete={() => onDelete(message)}
              onReaction={(emoji) => onReaction(message.id, emoji)}
            />
          )}
        </div>
        
        {/* 반응 */}
        {reactions?.length > 0 && (
          <MessageReactions 
            reactions={reactions}
            onToggle={(emoji) => onReaction(message.id, emoji)}
          />
        )}
        
        {/* 시간, 수정됨 */}
        {showTime && (
          <div className="flex items-center gap-1 mt-0.5">
            <TimeStamp 
              date={createdAt} 
              format="HH:mm"
              className="text-xs text-gray-400" 
            />
            {isEdited && (
              <span className="text-xs text-gray-400">(수정됨)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4. MessageInput.jsx

메시지 입력 컴포넌트

```jsx
import { useState, useRef, useCallback } from 'react'
import { EmojiPicker } from '../input/EmojiPicker'
import { FileUploader } from '../input/FileUploader'
import { ReplyPreview } from '../input/ReplyPreview'
import { 
  SendIcon, 
  EmojiIcon, 
  AttachIcon 
} from '@/components/ui/icons'

export function MessageInput({ 
  onSend, 
  onTyping,
  replyTo,
  onCancelReply,
  disabled 
}) {
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [files, setFiles] = useState([])
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  
  // 타이핑 이벤트
  const handleChange = (e) => {
    setContent(e.target.value)
    
    // 디바운스된 타이핑 이벤트
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    onTyping?.(true)
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false)
    }, 2000)
  }
  
  // 전송
  const handleSend = useCallback(() => {
    const trimmedContent = content.trim()
    if (!trimmedContent && files.length === 0) return
    
    onSend({
      content: trimmedContent,
      type: files.length > 0 ? 'FILE' : 'TEXT',
      files,
      replyToId: replyTo?.id
    })
    
    setContent('')
    setFiles([])
    onCancelReply?.()
    inputRef.current?.focus()
  }, [content, files, replyTo, onSend, onCancelReply])
  
  // Enter 키
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  // 이모지 선택
  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }
  
  // 파일 선택
  const handleFileSelect = (selectedFiles) => {
    setFiles(prev => [...prev, ...selectedFiles])
  }
  
  return (
    <div className="border-t bg-white">
      {/* 답장 미리보기 */}
      {replyTo && (
        <ReplyPreview 
          message={replyTo}
          onCancel={onCancelReply}
        />
      )}
      
      {/* 파일 미리보기 */}
      {files.length > 0 && (
        <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto">
          {files.map((file, index) => (
            <FilePreview 
              key={index}
              file={file}
              onRemove={() => setFiles(prev => prev.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
      
      {/* 입력 영역 */}
      <div className="flex items-end gap-2 p-4">
        {/* 첨부 버튼 */}
        <FileUploader onSelect={handleFileSelect}>
          <button 
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <AttachIcon className="w-5 h-5" />
          </button>
        </FileUploader>
        
        {/* 텍스트 입력 */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2 pr-10 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            style={{ minHeight: '40px' }}
          />
          
          {/* 이모지 버튼 */}
          <button
            type="button"
            onClick={() => setShowEmoji(prev => !prev)}
            className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <EmojiIcon className="w-5 h-5" />
          </button>
          
          {/* 이모지 피커 */}
          {showEmoji && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
        
        {/* 전송 버튼 */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!content.trim() && files.length === 0)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
```

### 5. TypingIndicator.jsx

타이핑 표시 컴포넌트

```jsx
import { Avatar } from '../common/Avatar'

export function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null
  
  const names = users.map(u => u.name)
  let text = ''
  
  if (names.length === 1) {
    text = `${names[0]}님이 입력 중...`
  } else if (names.length === 2) {
    text = `${names[0]}님, ${names[1]}님이 입력 중...`
  } else {
    text = `${names[0]}님 외 ${names.length - 1}명이 입력 중...`
  }
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map(user => (
          <Avatar 
            key={user.id}
            src={user.avatar} 
            name={user.name} 
            size={20}
            className="border-2 border-white"
          />
        ))}
      </div>
      
      <span>{text}</span>
      
      {/* 타이핑 애니메이션 */}
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
```

---

## Hooks

### useChatRooms.js

채팅방 목록 훅

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChatRooms, createChatRoom, updateRoomSettings } from '@/lib/dm/api'

export function useChatRooms(options = {}) {
  const queryClient = useQueryClient()
  
  // 채팅방 목록 조회
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['chatRooms', options],
    queryFn: ({ pageParam = 1 }) => getChatRooms({ ...options, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
  })
  
  // 채팅방 생성
  const createMutation = useMutation({
    mutationFn: createChatRoom,
    onSuccess: (newRoom) => {
      queryClient.setQueryData(['chatRooms', options], (old) => {
        // 새 방을 목록 맨 위에 추가
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: [newRoom, ...page.data]
              }
            }
            return page
          })
        }
      })
    }
  })
  
  // 설정 변경 (고정, 음소거)
  const settingsMutation = useMutation({
    mutationFn: ({ roomId, settings }) => updateRoomSettings(roomId, settings),
    onSuccess: (_, { roomId, settings }) => {
      queryClient.setQueryData(['chatRooms', options], (old) => {
        // 해당 방 설정 업데이트
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(room => 
              room.id === roomId ? { ...room, ...settings } : room
            )
          }))
        }
      })
    }
  })
  
  // 목록 데이터 평탄화
  const rooms = data?.pages.flatMap(page => page.data) ?? []
  
  return {
    rooms,
    isLoading,
    error,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    createRoom: createMutation.mutate,
    updateSettings: settingsMutation.mutate,
    isCreating: createMutation.isPending,
  }
}
```

### useMessages.js

메시지 훅

```javascript
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage, editMessage, deleteMessage } from '@/lib/dm/api'
import { useDMSocket } from './useDMSocket'
import { useEffect, useCallback } from 'react'

export function useMessages(roomId) {
  const queryClient = useQueryClient()
  const { socket, onMessage, sendMessage: socketSend } = useDMSocket()
  
  // 메시지 목록 조회 (역순 - 최신이 아래)
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', roomId],
    queryFn: ({ pageParam }) => getMessages(roomId, { cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!roomId,
  })
  
  // 실시간 메시지 수신
  useEffect(() => {
    if (!roomId) return
    
    const unsubscribe = onMessage((data) => {
      if (data.roomId !== roomId) return
      
      queryClient.setQueryData(['messages', roomId], (old) => {
        if (!old) return old
        
        // 첫 페이지에 새 메시지 추가
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: [...page.data, data.message]
              }
            }
            return page
          })
        }
      })
    })
    
    return unsubscribe
  }, [roomId, onMessage, queryClient])
  
  // 메시지 전송 (낙관적 업데이트)
  const sendMutation = useMutation({
    mutationFn: async (messageData) => {
      // 소켓으로 전송
      const tempId = socketSend(roomId, messageData.content, messageData.type, messageData.replyToId)
      return { tempId, ...messageData }
    },
    onMutate: async (messageData) => {
      // 낙관적 업데이트 - 임시 메시지 추가
      const tempMessage = {
        id: `temp_${Date.now()}`,
        ...messageData,
        sender: { /* 현재 사용자 */ },
        createdAt: new Date().toISOString(),
        isPending: true,
      }
      
      queryClient.setQueryData(['messages', roomId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, data: [...page.data, tempMessage] }
            }
            return page
          })
        }
      })
      
      return { tempMessage }
    },
    onError: (err, _, context) => {
      // 에러 시 임시 메시지 제거
      queryClient.setQueryData(['messages', roomId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(m => m.id !== context.tempMessage.id)
          }))
        }
      })
    }
  })
  
  // 메시지 수정
  const editMutation = useMutation({
    mutationFn: ({ messageId, content }) => editMessage(roomId, messageId, content),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(['messages', roomId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(m => m.id === updatedMessage.id ? updatedMessage : m)
          }))
        }
      })
    }
  })
  
  // 메시지 삭제
  const deleteMutation = useMutation({
    mutationFn: (messageId) => deleteMessage(roomId, messageId),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(['messages', roomId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(m => m.id !== messageId)
          }))
        }
      })
    }
  })
  
  // 메시지 목록 평탄화 및 역순 정렬
  const messages = data?.pages.flatMap(page => page.data).reverse() ?? []
  
  return {
    messages,
    isLoading,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    loadMore: fetchNextPage,
    send: sendMutation.mutate,
    edit: editMutation.mutate,
    delete: deleteMutation.mutate,
    isSending: sendMutation.isPending,
  }
}
```

---

## 상태 관리 (Context)

### DMContext.jsx

```jsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useDMSocket } from '@/hooks/dm/useDMSocket'

const DMContext = createContext(null)

export function DMContextProvider({ children }) {
  const [currentRoomId, setCurrentRoomId] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})  // { roomId: [users] }
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [unreadCounts, setUnreadCounts] = useState({})  // { roomId: count }
  
  const { socket, joinRoom, leaveRoom, onTyping, onMessage } = useDMSocket()
  
  // 채팅방 입장/퇴장
  useEffect(() => {
    if (!currentRoomId) return
    
    joinRoom(currentRoomId)
    return () => leaveRoom(currentRoomId)
  }, [currentRoomId, joinRoom, leaveRoom])
  
  // 타이핑 이벤트 처리
  useEffect(() => {
    const handleTyping = ({ roomId, user }) => {
      setTypingUsers(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []).filter(u => u.id !== user.id), user]
      }))
      
      // 3초 후 자동 제거
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(u => u.id !== user.id)
        }))
      }, 3000)
    }
    
    const unsubscribe = onTyping(handleTyping)
    return unsubscribe
  }, [onTyping])
  
  // 안읽음 카운트 증가
  useEffect(() => {
    const handleNewMessage = ({ roomId }) => {
      if (roomId !== currentRoomId) {
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1
        }))
      }
    }
    
    const unsubscribe = onMessage(handleNewMessage)
    return unsubscribe
  }, [currentRoomId, onMessage])
  
  // 안읽음 초기화
  const clearUnread = useCallback((roomId) => {
    setUnreadCounts(prev => ({ ...prev, [roomId]: 0 }))
  }, [])
  
  const value = {
    currentRoomId,
    setCurrentRoomId,
    typingUsers,
    onlineUsers,
    unreadCounts,
    clearUnread,
  }
  
  return (
    <DMContext.Provider value={value}>
      {children}
    </DMContext.Provider>
  )
}

export function useDMContext() {
  const context = useContext(DMContext)
  if (!context) {
    throw new Error('useDMContext must be used within DMContextProvider')
  }
  return context
}
```

