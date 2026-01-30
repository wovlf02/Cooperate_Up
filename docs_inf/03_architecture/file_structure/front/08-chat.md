// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\08-chat.md
# 채팅 도메인 파일 구조 (Chat Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

실시간 채팅 기능 관련 파일 구조입니다.
- **채팅방 목록**: 그룹 채팅, 1:1 채팅 목록
- **채팅 화면**: 실시간 메시지 송수신, 파일 첨부, 읽음 표시

---

## 디렉토리 구조

```
src/features/chat/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~4 lines)
│   │
│   ├── ChatListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ChatListScreen.tsx          # 채팅방 목록 (~75 lines)
│   │   └── ChatListScreen.styles.ts    # (~45 lines)
│   │
│   └── ChatRoomScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── ChatRoomScreen.tsx          # 채팅 화면 (~95 lines)
│       └── ChatRoomScreen.styles.ts    # (~55 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~18 lines)
│   │
│   ├── ChatRoomItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ChatRoomItem.tsx            # 채팅방 항목 (~50 lines)
│   │   └── ChatRoomItem.styles.ts      # (~45 lines)
│   │
│   ├── MessageBubble/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MessageBubble.tsx           # 메시지 버블 (~60 lines)
│   │   ├── MessageBubble.styles.ts     # (~55 lines)
│   │   ├── SentBubble.tsx              # 보낸 메시지 (~40 lines)
│   │   └── ReceivedBubble.tsx          # 받은 메시지 (~45 lines)
│   │
│   ├── MessageInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MessageInput.tsx            # 메시지 입력창 (~55 lines)
│   │   └── MessageInput.styles.ts      # (~45 lines)
│   │
│   ├── MessageDate/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MessageDate.tsx             # 날짜 구분선 (~30 lines)
│   │   └── MessageDate.styles.ts       # (~25 lines)
│   │
│   ├── MessageTime/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── MessageTime.tsx             # 메시지 시간 표시 (~30 lines)
│   │   └── MessageTime.styles.ts       # (~25 lines)
│   │
│   ├── UnreadBadge/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── UnreadBadge.tsx             # 안읽은 수 배지 (~30 lines)
│   │   └── UnreadBadge.styles.ts       # (~25 lines)
│   │
│   ├── AttachmentPicker/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AttachmentPicker.tsx        # 첨부파일 선택 (~55 lines)
│   │   └── AttachmentPicker.styles.ts  # (~40 lines)
│   │
│   ├── ImageMessage/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ImageMessage.tsx            # 이미지 메시지 (~45 lines)
│   │   └── ImageMessage.styles.ts      # (~35 lines)
│   │
│   ├── FileMessage/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── FileMessage.tsx             # 파일 메시지 (~45 lines)
│   │   └── FileMessage.styles.ts       # (~35 lines)
│   │
│   ├── SearchBar/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SearchBar.tsx               # 메시지 검색 (~45 lines)
│   │   └── SearchBar.styles.ts         # (~35 lines)
│   │
│   └── NewMessageIndicator/
│       ├── index.ts                    # (~3 lines)
│       ├── NewMessageIndicator.tsx     # 새 메시지 알림 (~35 lines)
│       └── NewMessageIndicator.styles.ts # (~30 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useChatList.ts                  # 채팅방 목록 (~55 lines)
│   ├── useChatRoom.ts                  # 채팅방 데이터 (~60 lines)
│   ├── useCreateChatRoom.ts            # 채팅방 생성 (~45 lines)
│   ├── useMessages.ts                  # 메시지 관리 (~60 lines)
│   ├── useMessageSend.ts               # 메시지 전송 (~55 lines)
│   ├── useReadReceipt.ts               # 읽음 처리 (~40 lines)
│   ├── useLeaveChatRoom.ts             # 채팅방 나가기 (~35 lines)
│   └── useFileUpload.ts                # 파일 업로드 (~50 lines)
│
├── types/
│   └── chat.types.ts                   # 채팅 타입 정의 (~55 lines)
│
├── constants/
│   └── chat.constants.ts               # 채팅 상수 (~30 lines)
│
└── utils/
    └── messageUtils.ts                 # 메시지 유틸 (~40 lines)
```

---

## 스크린 상세

### ChatRoomScreen.tsx (~95 lines)

```typescript
import React, { useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, IconButton } from '@components/common';
import {
  MessageBubble,
  MessageDate,
  MessageInput,
  NewMessageIndicator,
} from '../components';
import { useChatRoom, useMessages, useMessageSend } from '../hooks';
import { groupMessagesByDate } from '../utils/messageUtils';
import { styles } from './ChatRoomScreen.styles';

interface RouteParams {
  roomId: string;
}

const ChatRoomScreen = (): JSX.Element => {
  const route = useRoute();
  const { roomId } = route.params as RouteParams;
  const flatListRef = useRef<FlatList>(null);

  const { room, isLoading: roomLoading } = useChatRoom(roomId);
  const { messages, hasNewMessage, markAsRead, loadMore } = useMessages(roomId);
  const { sendMessage, sendFile, isSending } = useMessageSend(roomId);

  const groupedMessages = groupMessagesByDate(messages);

  const handleSendMessage = useCallback(async (text: string) => {
    await sendMessage(text);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [sendMessage]);

  const handleSendFile = useCallback(async (file: File) => {
    await sendFile(file);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [sendFile]);

  const handleScrollToNew = () => {
    markAsRead();
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item, index }) => {
    if (item.type === 'date') {
      return <MessageDate date={item.date} />;
    }

    const isMyMessage = item.senderId === currentUserId;
    const showProfile = !isMyMessage && 
      (index === 0 || messages[index - 1]?.senderId !== item.senderId);

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMyMessage}
        showProfile={showProfile}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={room?.name ?? '채팅'}
        rightElement={
          <IconButton icon="search" onPress={() => {/* 검색 */}} />
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={groupedMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted={false}
          contentContainerStyle={styles.messageList}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />

        {hasNewMessage && (
          <NewMessageIndicator onPress={handleScrollToNew} />
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          isSending={isSending}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatRoomScreen;
```

---

## 컴포넌트 상세

### MessageBubble.tsx (~60 lines)

```typescript
import React from 'react';
import { View } from 'react-native';
import { SentBubble } from './SentBubble';
import { ReceivedBubble } from './ReceivedBubble';
import { ImageMessage } from '../ImageMessage';
import { FileMessage } from '../FileMessage';
import { Message } from '../types/chat.types';
import { styles } from './MessageBubble.styles';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  showProfile: boolean;
}

const MessageBubble = ({
  message,
  isMyMessage,
  showProfile,
}: MessageBubbleProps): JSX.Element => {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <ImageMessage
            uri={message.fileUrl!}
            isMyMessage={isMyMessage}
          />
        );
      case 'file':
        return (
          <FileMessage
            name={message.fileName!}
            size={message.fileSize!}
            type={message.fileType!}
            url={message.fileUrl!}
            isMyMessage={isMyMessage}
          />
        );
      default:
        return isMyMessage ? (
          <SentBubble
            text={message.text}
            time={message.createdAt}
            unreadCount={message.unreadCount}
          />
        ) : (
          <ReceivedBubble
            text={message.text}
            time={message.createdAt}
            unreadCount={message.unreadCount}
            senderName={message.senderName}
            senderImage={message.senderImage}
            showProfile={showProfile}
          />
        );
    }
  };

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.sent : styles.received,
    ]}>
      {renderContent()}
    </View>
  );
};

export default MessageBubble;
```

### MessageInput.tsx (~55 lines)

```typescript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { AttachmentPicker } from '../AttachmentPicker';
import { styles } from './MessageInput.styles';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendFile: (file: any) => void;
  isSending: boolean;
}

const MessageInput = ({
  onSendMessage,
  onSendFile,
  isSending,
}: MessageInputProps): JSX.Element => {
  const [text, setText] = useState('');
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);

  const handleSend = () => {
    if (text.trim() && !isSending) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleSelectFile = (file: any) => {
    onSendFile(file);
    setShowAttachmentPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachButton}
        onPress={() => setShowAttachmentPicker(true)}
      >
        <Text style={styles.attachIcon}>+</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="메시지 입력..."
        multiline
        maxLength={1000}
      />

      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || isSending}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>

      <AttachmentPicker
        visible={showAttachmentPicker}
        onClose={() => setShowAttachmentPicker(false)}
        onSelect={handleSelectFile}
      />
    </View>
  );
};

export default MessageInput;
```

---

## 훅 상세

### useMessages.ts (~55 lines)

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@services/chat/chatService';
import { Message } from '../types/chat.types';

interface UseMessagesReturn {
  messages: Message[];
  hasNewMessage: boolean;
  isLoading: boolean;
  loadMore: () => void;
  markAsRead: () => void;
  addMessage: (message: Message) => void;
}

export const useMessages = (roomId: string): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const data = await chatService.getMessages(roomId, 1);
      setMessages(data);
      setIsLoading(false);
    };

    fetchMessages();

    // WebSocket 연결
    wsRef.current = chatService.connectWebSocket(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      setHasNewMessage(true);
    });

    return () => {
      wsRef.current?.close();
    };
  }, [roomId]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const moreMessages = await chatService.getMessages(roomId, nextPage);
    if (moreMessages.length > 0) {
      setMessages((prev) => [...moreMessages, ...prev]);
      setPage(nextPage);
    }
  }, [roomId, page]);

  const markAsRead = useCallback(() => {
    setHasNewMessage(false);
    chatService.markAsRead(roomId);
  }, [roomId]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    hasNewMessage,
    isLoading,
    loadMore,
    markAsRead,
    addMessage,
  };
};
```

---

## 타입 정의

### chat.types.ts (~55 lines)

```typescript
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';
export type ChatRoomType = 'group' | 'direct';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  type: MessageType;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  unreadCount: number;
}

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  image?: string;
  lastMessage?: Message;
  unreadCount: number;
  memberCount: number;
  updatedAt: Date;
}

export interface ChatMember {
  id: string;
  name: string;
  profileImage?: string;
  role: 'admin' | 'member';
  isOnline: boolean;
}

export interface FileAttachment {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface GroupedMessage {
  id: string;
  type: 'date' | 'message';
  date?: Date;
  message?: Message;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| ChatListScreen.tsx | 75 | 채팅방 목록 |
| ChatRoomScreen.tsx | 95 | 채팅 화면 |
| **Components** | | |
| ChatRoomItem.tsx | 50 | 채팅방 항목 |
| MessageBubble.tsx | 60 | 메시지 버블 |
| SentBubble.tsx | 40 | 보낸 메시지 |
| ReceivedBubble.tsx | 45 | 받은 메시지 |
| MessageInput.tsx | 55 | 메시지 입력창 |
| MessageDate.tsx | 30 | 날짜 구분선 |
| MessageTime.tsx | 30 | 시간 표시 |
| UnreadBadge.tsx | 30 | 안읽은 수 |
| AttachmentPicker.tsx | 55 | 첨부파일 선택 |
| ImageMessage.tsx | 45 | 이미지 메시지 |
| FileMessage.tsx | 45 | 파일 메시지 |
| **Hooks** | | |
| useChatList.ts | 50 | 채팅방 목록 |
| useChatRoom.ts | 60 | 채팅방 데이터 |
| useMessages.ts | 55 | 메시지 관리 |
| useMessageSend.ts | 50 | 메시지 전송 |
| useFileUpload.ts | 50 | 파일 업로드 |

**총 파일 수**: 스크린 4개 + 컴포넌트 26개 + 훅 5개 + 타입/상수/유틸 3개 = **38개 파일**

