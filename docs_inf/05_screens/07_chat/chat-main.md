# 채팅 화면 (ChatScreen) - Production Ready v2.0

## 개요

채팅방에서 실시간 메시지를 주고받는 화면입니다.
카카오톡, 슬랙 등의 메시징 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **실시간 소통**: 메시지 전송/수신의 즉각적인 피드백
- **직관적인 UI**: 카카오톡 친숙한 채팅 버블 스타일
- **읽음 표시**: 누가 읽었는지 명확하게 표시
- **멀티미디어 지원**: 다양한 파일 형식의 미리보기

---

### 채팅방 타입
- **그룹 채팅**: 사업장 전체 직원 참여 (헤더: "전체 채팅")
- **1:1 채팅**: 관리자-직원 개별 대화 (헤더: 상대방 이름)

### 지원 파일 형식
| 타입 | 확장자 | 용량 제한 | 미리보기 |
|-----|-------|---------|---------|
| 이미지 | jpg, jpeg, png, gif, webp, bmp, heic, svg, tiff, ico | 10MB | 썸네일, 전체화면 뷰어 |
| 동영상 | mp4, mov, avi, mkv, wmv, flv, webm, m4v, 3gp | 100MB | 썸네일 + 인라인 재생 + 전체화면 |
| 오디오 | mp3, wav, aac, flac, m4a, ogg, wma | 20MB | 웨이브폼 + 인라인 재생 |
| 문서 | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, hwp, hwpx, rtf, odt, ods, odp | 30MB | PDF/이미지 미리보기, 문서 뷰어 |
| 코드 | js, ts, py, java, c, cpp, cs, html, css, json, xml, yaml, md | 5MB | 구문 강조 미리보기 |
| 압축 | zip, rar, 7z, tar, gz | 50MB | 파일 목록 미리보기 |

### 파일 미리보기 상세
| 파일 타입 | 미리보기 기능 |
|----------|-------------|
| 이미지 | 썸네일, 핀치 줌, 전체화면, 회전, 저장 |
| 동영상 | 썸네일, 인라인 재생, 전체화면, 재생속도 조절 |
| 오디오 | 웨이브폼 시각화, 재생/일시정지, 시간 탐색 |
| PDF | 페이지별 미리보기, 확대/축소, 페이지 이동 |
| 문서 (Office) | 읽기 전용 뷰어, 스크롤 |
| 코드 | 구문 강조 (Syntax Highlighting), 줄 번호 |
| 압축 | 내부 파일 목록 표시 |

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   전체 채팅              🔍  ≡   │ │
│ │     fontSize: fs(18), bold 검색 메뉴│ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  (검색 모드 활성화 시)                  │
│  Search Bar                             │
│ ┌─────────────────────────────────────┐ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 🔍 메시지 검색...      취소 │    │ │
│ │  │    height: hp(5)            │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  "안녕" 검색 결과 3건               │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 김철수 • 12/20              │    │ │
│ │  │ [안녕]하세요~               │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Message List (FlatList inverted)       │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │      ──── 2024년 12월 22일 ────     │ │
│ │      fontSize: fs(12), gray400      │ │
│ │                                     │ │
│ │  타인 메시지 (좌측 정렬)            │ │
│ │  ┌────┐                             │ │
│ │  │ 👤 │ 김철수                      │ │
│ │  │wp10│ fontSize: fs(12), gray600   │ │
│ │  │    │                             │ │
│ │  └────┘ ┌─────────────────────┐     │ │
│ │         │ 안녕하세요~         │     │ │
│ │         │                     │     │ │
│ │         │ fontSize: fs(15)    │ 2   │ │
│ │         │ color: black        │20:30│ │
│ │         └─────────────────────┘     │ │
│ │         └── 읽지않은수 + 시간       │ │
│ │                                     │ │
│ │  내 메시지 (우측 정렬)              │ │
│ │                                     │ │
│ │              ┌─────────────────┐    │ │
│ │              │ 네, 안녕하세요! │    │ │
│ │              │                 │    │ │
│ │           1  │ fontSize: fs(15)│    │ │
│ │        20:31 │ color: black    │    │ │
│ │              └─────────────────┘    │ │
│ │              └── 시간 + 읽지않은수  │ │
│ │                                     │ │
│ │  타인 이미지 메시지                 │ │
│ │  ┌────┐                             │ │
│ │  │ 👤 │ 박영희                      │ │
│ │  │    │                             │ │
│ │  └────┘ ┌─────────────────────┐     │ │
│ │         │                     │     │ │
│ │         │    [이미지]         │     │ │
│ │         │    wp(55)           │ 3   │ │
│ │         │                     │20:35│ │
│ │         └─────────────────────┘     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  New Message Indicator (스크롤 시)      │
│  ┌─────────────────────────────────┐    │
│  │      ↓ 새 메시지 3개            │    │
│  │      position: absolute         │    │
│  │      bottom: hp(12)             │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  Message Input                          │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌───┐ ┌─────────────────┐ ┌───┐   │ │
│ │  │ + │ │ 메시지 입력...  │ │ ➤ │   │ │
│ │  │📎 │ │ minH: hp(5)     │ │전송│   │ │
│ │  └───┘ └─────────────────┘ └───┘   │ │
│ │                                     │ │
│ │  paddingBottom: safeArea            │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### MessageBubble - 타인 메시지 (카카오톡 스타일)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌────┐  김철수                                   │
│  │ 👤 │  senderName                               │
│  │    │  fontSize: fs(12)                         │
│  │wp10│  color: gray600                           │
│  │    │  marginBottom: hp(0.5)                    │
│  │    │                                           │
│  │    │  ┌───────────────────────────┐            │
│  │프로│  │                           │            │
│  │필  │  │  안녕하세요~              │            │
│  │    │  │                           │            │
│  │    │  │  fontSize: fs(15)         │    2       │
│  │    │  │  color: black             │   20:30    │
│  │    │  │  lineHeight: fs(22)       │            │
│  │    │  │                           │ unread     │
│  └────┘  └───────────────────────────┘  time      │
│                                                   │
│  프로필:                                          │
│  - size: wp(10) x wp(10)                         │
│  - borderRadius: wp(3.5) (살짝 둥근 사각형)       │
│  - 첫 메시지에만 표시, 연속 메시지는 공백         │
│                                                   │
│  버블:                                            │
│  - backgroundColor: white                         │
│  - borderRadius: ms(8)                           │
│  - borderTopLeftRadius: ms(0) (꼬리)              │
│  - padding: wp(2.5) hp(1.2)                      │
│  - maxWidth: wp(65)                              │
│                                                   │
│  읽지않은수 + 시간 (버블 우측 하단 바깥):         │
│  - alignItems: flex-end                          │
│  - marginLeft: wp(1.5)                           │
│  - unread: fontSize fs(11), color: primary       │
│  - time: fontSize fs(11), color: gray400         │
│  - 0명이면 숫자 숨김                             │
│                                                   │
└───────────────────────────────────────────────────┘
```

### MessageBubble - 내 메시지 (카카오톡 스타일)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│                 (이름, 프로필 없음)               │
│                                                   │
│              ┌───────────────────────────┐        │
│              │                           │        │
│              │  네, 안녕하세요!          │        │
│              │                           │        │
│     1        │  fontSize: fs(15)         │        │
│   20:31      │  color: black             │        │
│              │  lineHeight: fs(22)       │        │
│   unread     │                           │        │
│   time       └───────────────────────────┘        │
│                                                   │
│  버블:                                            │
│  - backgroundColor: #FEE500 (카카오 옐로우)       │
│    또는 primary100 (앱 브랜드 컬러 연한 버전)     │
│  - borderRadius: ms(8)                           │
│  - borderTopRightRadius: ms(0) (꼬리)             │
│  - padding: wp(2.5) hp(1.2)                      │
│  - maxWidth: wp(65)                              │
│  - alignSelf: flex-end                           │
│                                                   │
│  읽지않은수 + 시간 (버블 좌측 하단 바깥):         │
│  - alignItems: flex-end                          │
│  - marginRight: wp(1.5)                          │
│  - unread: fontSize fs(11), color: primary       │
│  - time: fontSize fs(11), color: gray400         │
│  - 0명이면 숫자 숨김                             │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 연속 메시지 처리

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  같은 사람이 연속으로 보낸 메시지:                │
│                                                   │
│  ┌────┐  김철수                                   │
│  │ 👤 │                                           │
│  │    │  ┌───────────────────────────┐            │
│  │    │  │  안녕하세요~              │            │
│  │    │  └───────────────────────────┘            │
│  └────┘                                           │
│          ┌───────────────────────────┐    2       │
│          │  오늘 날씨 좋네요         │   20:30    │
│          └───────────────────────────┘            │
│                                                   │
│  - 첫 메시지: 프로필 + 이름 표시                  │
│  - 연속 메시지: 프로필 영역 빈 공간 유지 (wp10)   │
│  - 시간은 마지막 메시지에만 표시                  │
│                                                   │
│  marginLeft: wp(10) + wp(1.5) = wp(11.5)         │
│  (프로필 너비 + 간격)                             │
│                                                   │
└───────────────────────────────────────────────────┘
```

### DateSeparator (날짜 구분선)

```
┌───────────────────────────────────────┐
│                                       │
│  ────── 2024년 12월 22일 일요일 ──────│
│                                       │
│  fontSize: fs(12)                     │
│  color: gray500                       │
│  backgroundColor: transparent         │
│  alignSelf: center                    │
│  marginVertical: hp(2)                │
│                                       │
└───────────────────────────────────────┘
```

### ImageMessage (이미지 메시지)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  타인 이미지 메시지:                              │
│                                                   │
│  ┌────┐  박영희                                   │
│  │ 👤 │                                           │
│  │    │  ┌─────────────────────────┐              │
│  │    │  │                         │              │
│  │    │  │       [이미지]          │              │
│  │    │  │                         │      3       │
│  │    │  │   width: wp(55)         │    20:35     │
│  │    │  │   maxHeight: hp(30)     │              │
│  │    │  │   borderRadius: ms(8)   │              │
│  │    │  │                         │              │
│  └────┘  └─────────────────────────┘              │
│                                                   │
│  탭 시: 전체화면 이미지 뷰어                      │
│                                                   │
└───────────────────────────────────────────────────┘
```

### FileMessage (파일 메시지)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌────┐  김철수                                   │
│  │ 👤 │                                           │
│  │    │  ┌─────────────────────────┐              │
│  │    │  │ 📄 급여명세서.pdf       │              │
│  │    │  │    2.3MB                │      1       │
│  │    │  │    height: hp(7)        │    20:40     │
│  │    │  │    bg: white            │              │
│  └────┘  └─────────────────────────┘              │
│                                                   │
│  파일 아이콘 by 확장자:                           │
│  - .pdf: 📄                                       │
│  - .jpg/.png: 🖼️                                 │
│  - .doc/.docx: 📝                                 │
│                                                   │
└───────────────────────────────────────────────────┘
```

### MessageInput (메시지 입력)

```
┌───────────────────────────────────────┐
│                                       │
│  ┌───┐  ┌─────────────────────┐ ┌───┐│
│  │ + │  │ 메시지 입력...      │ │ ➤ ││
│  │   │  │                     │ │   ││
│  │📎 │  │ fontSize: fs(16)    │ │전송││
│  │   │  │ minHeight: hp(5)    │ │   ││
│  │wp11│  │ maxHeight: hp(15)   │ │wp11│
│  └───┘  │ multiline: true     │ └───┘│
│         │ bg: gray100         │      │
│         │ borderRadius: ms(20)│      │
│         └─────────────────────┘      │
│                                       │
│  + 버튼 탭 → 파일 첨부 ActionSheet   │
│  ➤ 버튼: 메시지 있을 때 primary색    │
│          없을 때 gray400             │
│                                       │
│  paddingHorizontal: wp(3)             │
│  paddingVertical: hp(1)               │
│  backgroundColor: white               │
│  borderTopWidth: ms(1)                │
│  borderTopColor: gray200              │
│  paddingBottom: safeAreaBottom        │
│                                       │
└───────────────────────────────────────┘
```

### SearchOverlay (검색 오버레이)

```
┌───────────────────────────────────────┐
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 🔍 │ 메시지 검색...       취소  │  │
│  │    │                            │  │
│  │    │ autoFocus: true            │  │
│  │    │ height: hp(5)              │  │
│  └─────────────────────────────────┘  │
│                                       │
│  검색 결과:                           │
│  "안녕" 검색 결과 3건                 │
│  fontSize: fs(13), gray500            │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 김철수 • 12월 20일              │  │
│  │ [안녕]하세요~                   │  │
│  │                                 │  │
│  │ 하이라이트: primary bg          │  │
│  │ height: hp(7)                   │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 박영희 • 12월 21일              │  │
│  │ [안녕]히 가세요                 │  │
│  └─────────────────────────────────┘  │
│                                       │
│  탭 시: 해당 메시지로 스크롤          │
│                                       │
└───────────────────────────────────────┘
```

---

## 읽지 않은 수 표시

### 로직

```typescript
// 읽지 않은 유저 수 계산
const getUnreadCount = (message: Message, totalParticipants: number) => {
  const readCount = message.readBy.length;
  return totalParticipants - readCount;
};
```

### 표시 규칙

| 조건 | 표시 |
|------|------|
| 읽지 않은 사람 있음 | 숫자 표시 (예: 3) |
| 모두 읽음 | 숫자 숨김 |
| 내 메시지 | 버블 좌측에 표시 |
| 타인 메시지 | 버블 우측에 표시 |

---

## 파일 첨부 ActionSheet

```
┌─────────────────────────────────────┐
│                                     │
│  📷 사진 촬영                       │
│                                     │
│  🖼️ 갤러리에서 선택                 │
│                                     │
│  📁 파일 선택                       │
│                                     │
│  취소                               │
│                                     │
└─────────────────────────────────────┘
```

---

## 상태 관리

```typescript
interface ChatState {
  roomId: string;
  roomType: 'group' | 'direct';
  roomName: string;
  participants: User[];
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  inputText: string;
  isSearchMode: boolean;
  searchQuery: string;
  searchResults: Message[];
  hasNewMessages: boolean;
  newMessageCount: number;
}

interface Message {
  id: string;
  type: 'text' | 'image' | 'file';
  content: string;
  sender: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  createdAt: Date;
  readBy: string[];  // 읽은 유저 ID 배열
}
```

---

## 실시간 동기화

- Firestore 실시간 구독
- 새 메시지 시 자동 스크롤 (하단에 있을 때)
- 스크롤 중일 때는 "새 메시지" 인디케이터 표시
- 읽음 상태 실시간 업데이트

---

## 메시지 색상 옵션

| 옵션 | 내 메시지 배경 | 설명 |
|------|---------------|------|
| 카카오톡 스타일 | #FEE500 | 노란색 |
| 앱 브랜드 컬러 | primary100 | 연한 파란색 |
| 그린 | #DCF8C6 | 연한 초록색 |

선택한 옵션: **primary100** (앱 브랜드 컬러)

---

## Production Ready 컴포넌트 스타일

### 1. Chat Header

```typescript
const chatHeaderStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
    ...shadows.xs,
  },
  
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  participantCount: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: spacing.space0_5,
  },
  
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space1,
  },
  
  iconButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconButtonPressed: {
    backgroundColor: colors.neutral100,
  },
};
```

### 2. Message Input (Production Ready)

```typescript
const messageInputStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.space3,
    paddingTop: spacing.space2,
    paddingBottom: spacing.space2, // + safeAreaBottom
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  
  attachButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
  },
  
  attachButtonPressed: {
    backgroundColor: colors.neutral200,
  },
  
  attachIcon: {
    size: ms(22),
    color: colors.textSecondary,
  },
  
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    minHeight: ms(44),
    maxHeight: ms(120),
  },
  
  inputWrapperFocused: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brand500,
  },
  
  input: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingVertical: 0, // Reset default padding
    maxHeight: ms(100),
  },
  
  sendButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.space2,
  },
  
  sendButtonActive: {
    backgroundColor: colors.brand500,
  },
  
  sendButtonInactive: {
    backgroundColor: colors.neutral200,
  },
};
```

### 3. New Message Indicator

```typescript
const newMessageIndicatorStyles = {
  container: {
    position: 'absolute',
    bottom: ms(80), // inputHeight + margin
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  
  icon: {
    size: ms(16),
    color: colors.white,
    marginRight: spacing.space2,
  },
  
  text: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: '600',
  },
  
  // 애니메이션
  animation: {
    entering: FadeInDown.duration(200).springify(),
    exiting: FadeOutDown.duration(150),
  },
};
```

### 4. Search Overlay (Production Ready)

```typescript
const searchOverlayStyles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    zIndex: 100,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.space3,
    height: ms(44),
  },
  
  searchIcon: {
    size: ms(18),
    color: colors.textTertiary,
    marginRight: spacing.space2,
  },
  
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  
  cancelButton: {
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
  },
  
  cancelText: {
    ...typography.labelMedium,
    color: colors.brand500,
    fontWeight: '600',
  },
  
  resultCount: {
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    backgroundColor: colors.neutral50,
  },
  
  resultCountText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  resultContent: {
    flex: 1,
  },
  
  resultSender: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  resultMessage: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginTop: spacing.space1,
  },
  
  highlightText: {
    backgroundColor: colors.brand100,
    color: colors.brand700,
    fontWeight: '600',
  },
};
```

---

## 애니메이션

### 메시지 전송

```typescript
const sendMessageAnimation = {
  // 버튼 프레스
  sendButton: {
    scale: { to: 0.9, duration: 50 },
    release: { to: 1, duration: 100 },
  },
  
  // 메시지 등장
  message: {
    entering: SlideInRight.duration(200).springify(),
  },
  
  // 전송 완료 체크마크
  sentIndicator: {
    scale: { from: 0, to: 1 },
    opacity: { from: 0, to: 1 },
    duration: 200,
  },
  
  haptic: 'light',
};
```

### 새 메시지 도착

```typescript
const newMessageAnimation = {
  // 타인 메시지 등장
  message: {
    entering: SlideInLeft.duration(200).springify(),
  },
  
  // 이미지 로딩
  imagePlaceholder: {
    shimmer: {
      colors: [colors.neutral100, colors.neutral200, colors.neutral100],
      duration: 1500,
      loop: true,
    },
  },
  
  haptic: 'light',
};
```

### 입력 영역

```typescript
const inputAnimation = {
  // 포커스
  focus: {
    borderColor: { to: colors.brand500, duration: 150 },
    backgroundColor: { to: colors.white, duration: 150 },
  },
  
  // 블러
  blur: {
    borderColor: { to: 'transparent', duration: 150 },
    backgroundColor: { to: colors.neutral100, duration: 150 },
  },
  
  // 전송 버튼 활성화
  sendEnabled: {
    backgroundColor: { to: colors.brand500, duration: 150 },
    scale: { from: 0.9, to: 1 },
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  header: {
    backButton: {
      accessibilityRole: 'button',
      accessibilityLabel: '뒤로 가기',
    },
    searchButton: {
      accessibilityRole: 'button',
      accessibilityLabel: '메시지 검색',
    },
    menuButton: {
      accessibilityRole: 'button',
      accessibilityLabel: '채팅방 메뉴',
    },
  },
  
  messageInput: {
    attachButton: {
      accessibilityRole: 'button',
      accessibilityLabel: '파일 첨부',
      accessibilityHint: '사진, 동영상, 파일을 첨부합니다',
    },
    input: {
      accessibilityLabel: '메시지 입력',
      accessibilityHint: '메시지를 입력하세요',
    },
    sendButton: {
      accessibilityRole: 'button',
      accessibilityLabel: (hasText) => 
        hasText ? '메시지 전송' : '전송할 메시지 없음',
      accessibilityState: {
        disabled: !hasText,
      },
    },
  },
  
  messageBubble: {
    accessibilityRole: 'text',
    accessibilityLabel: (sender, content, time, isRead) => 
      `${sender}님이 ${time}에 보낸 메시지: ${content}${isRead ? ', 읽음' : ', 안읽음'}`,
  },
  
  newMessageIndicator: {
    accessibilityRole: 'button',
    accessibilityLabel: (count) => `새 메시지 ${count}개`,
    accessibilityHint: '탭하여 새 메시지로 이동',
  },
};
```

---

## 전체 코드 예시

```typescript
// screens/Chat/ChatScreen.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  FadeOutDown,
  SlideInRight,
  SlideInLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { Icon } from '@/components/Icon';
import { MessageBubble } from './components/MessageBubble';
import { DateSeparator } from './components/DateSeparator';

import { useChat } from '@/hooks/useChat';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

export const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();
  const flatListRef = useRef<FlatList>(null);
  
  const {
    room,
    messages,
    sendMessage,
    isLoading,
    hasNewMessages,
    newMessageCount,
  } = useChat();
  
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 전송 버튼 애니메이션
  const sendButtonScale = useSharedValue(1);
  
  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));
  
  const handleAttachPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    showActionSheetWithOptions(
      {
        options: ['📷 사진 촬영', '🖼️ 갤러리에서 선택', '📁 파일 선택', '취소'],
        cancelButtonIndex: 3,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // 사진 촬영
        } else if (buttonIndex === 1) {
          // 갤러리 선택
        } else if (buttonIndex === 2) {
          // 파일 선택
        }
      }
    );
  };
  
  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    sendButtonScale.value = withTiming(0.9, { duration: 50 }, () => {
      sendButtonScale.value = withTiming(1, { duration: 100 });
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const text = inputText.trim();
    setInputText('');
    
    await sendMessage({ type: 'text', content: text });
  };
  
  const handleNewMessagePress = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  
  const renderMessage = useCallback(({ item, index }) => {
    const prevMessage = messages[index + 1];
    const nextMessage = messages[index - 1];
    
    return (
      <MessageBubble
        message={item}
        prevMessage={prevMessage}
        nextMessage={nextMessage}
        isMyMessage={item.sender.id === currentUserId}
      />
    );
  }, [messages]);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={ms(24)} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{room.name}</Text>
            {room.type === 'group' && (
              <Text style={styles.participantCount}>
                {room.participants.length}명 참여
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSearchMode(true)}
          >
            <Icon name="search" size={ms(22)} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="menu" size={ms(22)} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
      
      {/* New Message Indicator */}
      {hasNewMessages && (
        <Animated.View
          style={styles.newMessageIndicator}
          entering={FadeInDown.duration(200).springify()}
          exiting={FadeOutDown.duration(150)}
        >
          <TouchableOpacity
            style={styles.newMessageButton}
            onPress={handleNewMessagePress}
          >
            <Icon name="chevron-down" size={ms(16)} color={colors.white} />
            <Text style={styles.newMessageText}>
              새 메시지 {newMessageCount}개
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.space2 }]}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachPress}
        >
          <Icon name="plus" size={ms(22)} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지 입력..."
            placeholderTextColor={colors.textTertiary}
            multiline
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        
        <Animated.View style={sendButtonStyle}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon
              name="send"
              size={ms(20)}
              color={inputText.trim() ? colors.white : colors.neutral400}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Search Overlay */}
      {isSearchMode && (
        <SearchOverlay
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => setIsSearchMode(false)}
          messages={messages}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  participantCount: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: spacing.space0_5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space1,
  },
  iconButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
  },
  newMessageIndicator: {
    position: 'absolute',
    bottom: ms(80),
    alignSelf: 'center',
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  newMessageText: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.space2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.space3,
    paddingTop: spacing.space2,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  attachButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    minHeight: ms(44),
    maxHeight: ms(120),
  },
  inputWrapperFocused: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brand500,
  },
  input: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingVertical: 0,
    maxHeight: ms(100),
  },
  sendButton: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.space2,
  },
  sendButtonActive: {
    backgroundColor: colors.brand500,
  },
  sendButtonInactive: {
    backgroundColor: colors.neutral200,
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 메시지 전송 실패
  sendError: {
    message: '메시지를 전송할 수 없습니다',
    action: 'retry',
    showRetryButton: true,
  },
  
  // 파일 업로드 실패
  uploadError: {
    message: '파일 업로드에 실패했습니다',
    action: 'retry',
  },
  
  // 파일 크기 초과
  fileSizeError: {
    image: '이미지는 10MB 이하만 전송 가능합니다',
    video: '동영상은 100MB 이하만 전송 가능합니다',
    file: '파일은 50MB 이하만 전송 가능합니다',
  },
  
  // 연결 오류
  connectionError: {
    message: '네트워크 연결을 확인해주세요',
    action: 'reconnect',
  },
  
  // 빈 상태
  emptyStates: {
    noMessages: {
      icon: '💬',
      title: '첫 메시지를 보내보세요',
      subtitle: '대화를 시작해보세요',
    },
    noSearchResults: {
      icon: '🔍',
      title: '검색 결과가 없습니다',
      subtitle: '다른 검색어로 시도해보세요',
    },
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  // 메모이제이션
  memoizedComponents: [
    'MessageBubble',
    'DateSeparator',
    'MessageInput',
    'SearchResultItem',
  ],
  
  // 가상화
  virtualization: {
    initialNumToRender: 20,
    maxToRenderPerBatch: 10,
    windowSize: 21,
    removeClippedSubviews: true,
  },
  
  // 이미지 최적화
  imageOptimization: {
    thumbnailSize: { width: 200, height: 200 },
    fullSize: { maxWidth: 1080, maxHeight: 1920 },
    caching: 'disk',
    compression: 0.8,
  },
  
  // 메시지 페이지네이션
  pagination: {
    pageSize: 50,
    loadMoreThreshold: 10, // 스크롤 시 10개 남았을 때 추가 로드
  },
  
  // 실시간 동기화
  realTimeSync: {
    enabled: true,
    batchInterval: 100, // 메시지 배치 처리
    optimisticUpdate: true,
  },
  
  // 키보드 최적화
  keyboard: {
    avoidingBehavior: 'padding',
    dismissOnScroll: false,
  },
};
```
