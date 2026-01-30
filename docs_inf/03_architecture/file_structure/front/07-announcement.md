// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\07-announcement.md
# 공지사항 도메인 파일 구조 (Announcement Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)
> **변경**: 등록일시 표시 형식 개선 (오늘/올해/작년 이전 구분)

## 개요

공지사항 목록, 상세, 작성 관련 파일 구조입니다.
**모든 시간 정보에 날짜와 시각을 함께 표시**합니다.

---

## 디렉토리 구조

```
src/features/announcement/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~5 lines)
│   │
│   ├── AnnouncementListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AnnouncementListScreen.tsx  # 목록 화면 (~80 lines)
│   │   └── AnnouncementListScreen.styles.ts  # (~45 lines)
│   │
│   ├── AnnouncementDetailScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AnnouncementDetailScreen.tsx    # 상세 화면 (~85 lines)
│   │   ├── AnnouncementDetailScreen.styles.ts  # (~50 lines)
│   │   └── CommentSection.tsx          # 댓글 섹션 (~55 lines)
│   │
│   └── AnnouncementCreateScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── AnnouncementCreateScreen.tsx    # 작성 화면 (~90 lines)
│       └── AnnouncementCreateScreen.styles.ts  # (~50 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~14 lines)
│   │
│   ├── FilterTabs/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── FilterTabs.tsx              # 필터 탭 (~45 lines)
│   │   └── FilterTabs.styles.ts        # (~35 lines)
│   │
│   ├── AnnouncementCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AnnouncementCard.tsx        # 목록 카드 (~55 lines)
│   │   ├── AnnouncementCard.styles.ts  # (~45 lines)
│   │   └── CardDateTime.tsx            # 날짜시간 표시 (~35 lines)
│   │
│   ├── AnnouncementHeader/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AnnouncementHeader.tsx      # 공지 헤더 (~45 lines)
│   │   └── AnnouncementHeader.styles.ts  # (~35 lines)
│   │
│   ├── CommentItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── CommentItem.tsx             # 댓글 아이템 (~50 lines)
│   │   ├── CommentItem.styles.ts       # (~40 lines)
│   │   └── CommentDateTime.tsx         # 댓글 시간 표시 (~30 lines)
│   │
│   ├── ReplyItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ReplyItem.tsx               # 대댓글 아이템 (~45 lines)
│   │   └── ReplyItem.styles.ts         # (~35 lines)
│   │
│   ├── AttachmentItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AttachmentItem.tsx          # 첨부파일 항목 (~45 lines)
│   │   └── AttachmentItem.styles.ts    # (~30 lines)
│   │
│   ├── FileUploadArea/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── FileUploadArea.tsx          # 파일 업로드 영역 (~55 lines)
│   │   └── FileUploadArea.styles.ts    # (~40 lines)
│   │
│   └── OptionToggle/
│       ├── index.ts                    # (~3 lines)
│       ├── OptionToggle.tsx            # 옵션 토글 (~35 lines)
│       └── OptionToggle.styles.ts      # (~25 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~8 lines)
│   ├── useAnnouncementList.ts          # 목록 데이터 (~60 lines)
│   ├── useAnnouncementDetail.ts        # 상세 데이터 (~55 lines)
│   ├── useAnnouncementCreate.ts        # 작성 로직 (~55 lines)
│   ├── useAnnouncementUpdate.ts        # 수정 로직 (~50 lines)
│   ├── useComments.ts                  # 댓글 관리 (~55 lines)
│   ├── useUnreadCount.ts               # 읽지 않은 수 (~35 lines)
│   └── useReaders.ts                   # 읽은 사람 목록 (관리자) (~40 lines)
│
├── types/
│   └── announcement.types.ts           # 타입 정의 (~45 lines)
│
├── constants/
│   └── announcement.constants.ts       # 상수 (~20 lines)
│
└── utils/
    └── dateTimeFormatter.ts            # 시간 포맷팅 유틸 (~45 lines)
```

---

## 스크린 상세

### AnnouncementListScreen.tsx (~80 lines)

```typescript
import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, IconButton, EmptyState, FloatingActionButton } from '@components/common';
import { FilterTabs, AnnouncementCard } from '../components';
import { useAnnouncementList } from '../hooks';
import { useAppSelector } from '@store/hooks';
import { selectUser } from '@store/slices/authSlice';
import { styles } from './AnnouncementListScreen.styles';

const AnnouncementListScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const user = useAppSelector(selectUser);
  const isAdmin = user?.role === 'admin';

  const {
    filter,
    setFilter,
    announcements,
    counts,
    isLoading,
    refresh,
    isRefreshing,
  } = useAnnouncementList();

  const handleCreate = () => {
    navigation.navigate('AnnouncementCreate');
  };

  const handleDetail = (id: string) => {
    navigation.navigate('AnnouncementDetail', { id });
  };

  const filterTabs = [
    { label: '전체', value: 'all', badge: counts.all },
    { label: '안읽음', value: 'unread', badge: counts.unread },
    { label: '📌 중요', value: 'important', badge: counts.important },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="공지사항"
        rightElement={
          isAdmin && <IconButton icon="plus" onPress={handleCreate} />
        }
      />
      
      <FilterTabs
        tabs={filterTabs}
        selectedTab={filter}
        onSelectTab={setFilter}
      />
      
      <FlatList
        data={announcements}
        renderItem={({ item }) => (
          <AnnouncementCard
            id={item.id}
            title={item.title}
            content={item.content}
            isImportant={item.isImportant}
            isRead={item.isRead}
            createdAt={item.createdAt}
            attachmentCount={item.attachmentCount}
            onPress={() => handleDetail(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <EmptyState icon="📢" title="공지사항이 없습니다" />
        }
      />
      
      {isAdmin && (
        <FloatingActionButton
          icon="plus"
          label="새 공지"
          onPress={handleCreate}
        />
      )}
    </View>
  );
};

export default AnnouncementListScreen;
```

### AnnouncementDetailScreen.tsx (~85 lines)

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, BaseCard, IconButton } from '@components/common';
import { AnnouncementHeader, AttachmentItem, CommentSection } from '../components';
import { useAnnouncementDetail, useComments } from '../hooks';
import { styles } from './AnnouncementDetailScreen.styles';

interface RouteParams {
  id: string;
}

const AnnouncementDetailScreen = (): JSX.Element => {
  const route = useRoute();
  const { id } = route.params as RouteParams;
  
  const { announcement, markAsRead, isLoading } = useAnnouncementDetail(id);
  const comments = useComments(id);

  useEffect(() => {
    if (announcement && !announcement.isRead) {
      markAsRead();
    }
  }, [announcement, markAsRead]);

  const handleDownloadPdf = () => {
    // PDF 다운로드 로직
  };

  if (!announcement) {
    return (
      <View style={styles.container}>
        <Header title="공지사항" />
        <View style={styles.loadingContainer}>
          <Text>로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="공지사항"
        rightElement={
          <IconButton icon="download" onPress={handleDownloadPdf} />
        }
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* 공지 헤더: 제목 + 등록일시 */}
        <AnnouncementHeader
          title={announcement.title}
          isImportant={announcement.isImportant}
          createdAt={announcement.createdAt}
          authorName={announcement.authorName}
        />
        
        {/* 본문 */}
        <BaseCard style={styles.bodyCard}>
          <Text style={styles.body}>{announcement.content}</Text>
        </BaseCard>

        {/* 첨부파일 */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <BaseCard style={styles.attachmentCard}>
            <Text style={styles.sectionTitle}>📎 첨부파일</Text>
            {announcement.attachments.map((file) => (
              <AttachmentItem
                key={file.id}
                name={file.name}
                size={file.size}
                type={file.type}
                url={file.url}
              />
            ))}
          </BaseCard>
        )}

        {/* 댓글 섹션 */}
        <CommentSection
          comments={comments.items}
          onAddComment={comments.add}
          onAddReply={comments.addReply}
          isLoading={comments.isLoading}
        />
      </ScrollView>
    </View>
  );
};

export default AnnouncementDetailScreen;
```

---

## 컴포넌트 상세

### AnnouncementCard.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Badge } from '@components/common';
import { CardDateTime } from './CardDateTime';
import { styles } from './AnnouncementCard.styles';

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  isRead: boolean;
  createdAt: Date;
  attachmentCount: number;
  onPress: () => void;
}

const AnnouncementCard = ({
  title,
  content,
  isImportant,
  isRead,
  createdAt,
  attachmentCount,
  onPress,
}: AnnouncementCardProps): JSX.Element => {
  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {isImportant && <Badge text="📌" variant="warning" />}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!isRead && <View style={styles.unreadDot} />}
      </View>
      
      <Text style={styles.preview} numberOfLines={2}>
        {content}
      </Text>
      
      <View style={styles.footer}>
        {/* 등록일시 상세 표시: 오늘 14:30 / 12/20 14:30 / 2023/12/20 */}
        <CardDateTime date={createdAt} />
        
        {attachmentCount > 0 && (
          <Text style={styles.attachment}>📎 {attachmentCount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AnnouncementCard;
```

### CardDateTime.tsx (~35 lines)

```typescript
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatRelativeDateTime } from '../utils/dateTimeFormatter';
import { styles } from './AnnouncementCard.styles';

interface CardDateTimeProps {
  date: Date | string;
  style?: TextStyle;
}

const CardDateTime = ({ date, style }: CardDateTimeProps): JSX.Element => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 오늘: 14:30
  // 올해: 12/20 14:30
  // 작년 이전: 2023/12/20
  const formattedDate = formatRelativeDateTime(dateObj);

  return (
    <Text style={[styles.dateTime, style]}>
      {formattedDate}
    </Text>
  );
};

export default CardDateTime;
```

### CommentItem.tsx (~50 lines)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProfileImage } from '@components/shared';
import { CommentDateTime } from './CommentDateTime';
import { ReplyItem } from '../ReplyItem';
import { Comment, Reply } from '../types/announcement.types';
import { styles } from './CommentItem.styles';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
}

const CommentItem = ({ comment, onReply }: CommentItemProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProfileImage uri={comment.authorImage} size={32} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{comment.authorName}</Text>
          {/* 등록일시 표시 */}
          <CommentDateTime date={comment.createdAt} />
        </View>
      </View>
      
      <Text style={styles.content}>{comment.content}</Text>
      
      <TouchableOpacity 
        onPress={() => onReply(comment.id)}
        style={styles.replyButton}
      >
        <Text style={styles.replyButtonText}>답글</Text>
      </TouchableOpacity>
      
      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </View>
      )}
    </View>
  );
};

export default CommentItem;
```

---

## 유틸리티 상세

### dateTimeFormatter.ts (~45 lines)

```typescript
import { format, isToday, isThisYear, differenceInMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 상대적 날짜/시간 포맷
 * - 오늘: 14:30
 * - 올해: 12/20 14:30
 * - 작년 이전: 2023/12/20
 */
export const formatRelativeDateTime = (date: Date): string => {
  const now = new Date();
  
  // 1분 이내: 방금
  if (differenceInMinutes(now, date) < 1) {
    return '방금';
  }
  
  // 오늘: 시간만 표시
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  // 올해: 월/일 시간
  if (isThisYear(date)) {
    return format(date, 'M/d HH:mm');
  }
  
  // 작년 이전: 년/월/일
  return format(date, 'yyyy/M/d');
};

/**
 * 상세 날짜/시간 포맷 (공지 헤더용)
 * 예: 2024년 12월 20일 14:30
 */
export const formatFullDateTime = (date: Date): string => {
  return format(date, 'yyyy년 M월 d일 HH:mm', { locale: ko });
};

/**
 * 날짜만 포맷
 * 예: 2024년 12월 20일 금요일
 */
export const formatDateOnly = (date: Date): string => {
  return format(date, 'yyyy년 M월 d일 EEEE', { locale: ko });
};
```

---

## 타입 정의

### announcement.types.ts (~45 lines)

```typescript
export type FilterType = 'all' | 'unread' | 'important';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: Date;
  replies: Reply[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  isRead: boolean;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  attachmentCount: number;
  commentCount: number;
}

export interface AnnouncementCounts {
  all: number;
  unread: number;
  important: number;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| AnnouncementListScreen.tsx | 80 | 목록 화면 |
| AnnouncementDetailScreen.tsx | 85 | 상세 화면 |
| CommentSection.tsx | 55 | 댓글 섹션 |
| AnnouncementCreateScreen.tsx | 90 | 작성 화면 |
| **Components** | | |
| FilterTabs.tsx | 45 | 필터 탭 |
| AnnouncementCard.tsx | 55 | 목록 카드 |
| CardDateTime.tsx | 35 | 카드 날짜시간 |
| AnnouncementHeader.tsx | 45 | 공지 헤더 |
| CommentItem.tsx | 50 | 댓글 아이템 |
| CommentDateTime.tsx | 30 | 댓글 시간 |
| ReplyItem.tsx | 45 | 대댓글 |
| AttachmentItem.tsx | 45 | 첨부파일 |
| FileUploadArea.tsx | 55 | 파일 업로드 |
| **Hooks** | | |
| useAnnouncementList.ts | 55 | 목록 데이터 |
| useAnnouncementDetail.ts | 50 | 상세 데이터 |
| useAnnouncementCreate.ts | 55 | 작성 로직 |
| useComments.ts | 50 | 댓글 관리 |
| **Utils** | | |
| dateTimeFormatter.ts | 45 | 시간 포맷팅 |

**총 파일 수**: 스크린 7개 + 컴포넌트 18개 + 훅 4개 + 타입/상수/유틸 3개 = **32개 파일**

