# 📱 채팅 화면

## 개요

스터디 채팅 화면 구성입니다.

**파일 위치**: `src/app/my-studies/[studyId]/chat/page.jsx`

---

## URL

`/my-studies/[studyId]/chat`

---

## 레이아웃

```
┌──────────────────────────────────────────────────┐
│ [StudyTabs]                                      │
├──────────────────────────────────────────────────┤
│ 📚 스터디 이름                    온라인: 3명    │
├──────────────────────────────────────────────────┤
│                                                  │
│ [메시지 목록]                                    │
│                                                  │
│ ┌─────────────────────────────────────────────┐  │
│ │ 👤 홍길동                      10:00        │  │
│ │ 안녕하세요!                                 │  │
│ └─────────────────────────────────────────────┘  │
│                                                  │
│ ┌─────────────────────────────────────────────┐  │
│ │ 👤 김철수                      10:01        │  │
│ │ 반갑습니다                                  │  │
│ │ 📎 document.pdf (125KB)                     │  │
│ └─────────────────────────────────────────────┘  │
│                                                  │
│ 김철수님이 입력 중...                           │
├──────────────────────────────────────────────────┤
│ [📎] [메시지 입력창]                  [전송] │
└──────────────────────────────────────────────────┘
```

---

## 상태 관리

```javascript
const [content, setContent] = useState('');
const [typingUsers, setTypingUsers] = useState([]);
const [selectedFile, setSelectedFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);
const [contextMenu, setContextMenu] = useState(null);
const [editingMessage, setEditingMessage] = useState(null);
const [realtimeMessages, setRealtimeMessages] = useState([]);
```

---

## API 호출

```javascript
// 스터디 정보
const { data: studyData } = useStudy(studyId);

// 멤버 목록
const { data: membersData } = useStudyMembers(studyId);

// 메시지 목록
const { data: messagesData, refetch: refetchMessages } = useMessages(studyId);

// 메시지 전송
const sendMessageMutation = useSendMessage();

// 메시지 삭제
const deleteMessageMutation = useDeleteMessage();
```

---

## Socket.IO 연결

```javascript
const { socket, isConnected } = useSocket();

// 채팅방 입장
useEffect(() => {
  if (!socket || !studyId) return;
  
  socket.emit('study:join', { studyId });
  
  return () => {
    socket.emit('study:leave', { studyId });
  };
}, [socket, studyId]);

// 실시간 메시지 수신
useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (message) => {
    if (message.senderId === currentUser.id) return;
    setRealtimeMessages(prev => [...prev, message]);
  };

  socket.on('message:new', handleNewMessage);
  
  return () => {
    socket.off('message:new', handleNewMessage);
  };
}, [socket, currentUser]);
```

---

## 메시지 병합

API 메시지와 실시간 메시지를 병합합니다.

```javascript
// API 메시지 정규화
const apiMessages = (messagesData?.data || []).map(msg => ({
  ...msg,
  sender: msg.user || msg.sender,
  senderId: msg.userId || msg.senderId
}));

// 중복 제거
const apiMessageIds = new Set(apiMessages.map(m => m.id));
const uniqueRealtimeMessages = realtimeMessages.filter(
  m => !apiMessageIds.has(m.id) && !m.id?.startsWith('temp-')
);

// 최종 메시지 목록
const allMessages = [...apiMessages, ...uniqueRealtimeMessages];
```

---

## 주요 기능

### 메시지 전송

```javascript
const handleSendMessage = async () => {
  if (!content.trim() && !selectedFile) return;

  try {
    // 낙관적 업데이트
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender: currentUser,
      createdAt: new Date().toISOString()
    };
    setRealtimeMessages(prev => [...prev, tempMessage]);
    
    // API 호출
    await sendMessageMutation.mutateAsync({
      studyId,
      content,
      fileId: selectedFile?.id
    });
    
    setContent('');
    setSelectedFile(null);
  } catch (error) {
    // 실패 시 롤백
  }
};
```

### 파일 첨부

```javascript
const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/studies/${studyId}/files`, formData);
    setSelectedFile(response.data.data);
  } catch (error) {
    alert('파일 업로드 실패');
  } finally {
    setIsUploading(false);
  }
};
```

### 컨텍스트 메뉴

우클릭 시 수정/삭제 옵션 표시:

```javascript
const handleContextMenu = (e, message) => {
  e.preventDefault();
  
  // 본인 메시지이거나 관리자인 경우만
  if (message.senderId !== currentUser.id && !isAdmin) return;
  
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    message
  });
};
```

### 메시지 수정

```javascript
const handleEditMessage = async () => {
  try {
    await api.patch(`/studies/${studyId}/chat/${editingMessage.id}`, {
      content: editingMessage.content
    });
    refetchMessages();
    setEditingMessage(null);
  } catch (error) {
    alert('메시지 수정 실패');
  }
};
```

### 메시지 삭제

```javascript
const handleDeleteMessage = async (messageId) => {
  if (!confirm('메시지를 삭제하시겠습니까?')) return;
  
  try {
    await deleteMessageMutation.mutateAsync({ studyId, messageId });
    setRealtimeMessages(prev => prev.filter(m => m.id !== messageId));
  } catch (error) {
    alert('메시지 삭제 실패');
  }
};
```

### 자동 스크롤

```javascript
const messagesEndRef = useRef(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [allMessages]);
```

---

## 타이핑 표시

```javascript
// 타이핑 시작
const handleTypingStart = () => {
  socket?.emit('typing:start', { studyId, userId: currentUser.id });
};

// 타이핑 종료
const handleTypingStop = () => {
  socket?.emit('typing:stop', { studyId, userId: currentUser.id });
};

// 타이핑 수신
useEffect(() => {
  if (!socket) return;
  
  socket.on('user:typing', ({ userId, userName }) => {
    setTypingUsers(prev => [...prev, { userId, userName }]);
  });
  
  socket.on('user:stopTyping', ({ userId }) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
  });
}, [socket]);
```

---

## 스타일

| 파일 | 설명 |
|------|------|
| `page.module.css` | 채팅 페이지 스타일 |

---

## 관련 문서

- [API](./api.md)
- [예외](./exceptions.md)
- [README](./README.md)

