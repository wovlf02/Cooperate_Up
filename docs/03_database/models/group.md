# 👥 Group 모델

## 📋 개요

`Group` 모델은 스터디와 별개로 독립적인 그룹을 관리합니다. 그룹 생성, 멤버 관리, 초대 기능을 제공합니다.

---

## 📊 스키마 정의

### Group (그룹)

```prisma
model Group {
  id          String  @id @default(cuid())
  name        String
  description String? @db.Text
  category    String  @default("etc")
  imageUrl    String?

  isPublic     Boolean @default(true)
  maxMembers   Int     @default(50)
  isRecruiting Boolean @default(true)

  createdBy String
  deletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  creator User          @relation("GroupCreator", fields: [createdBy], references: [id])
  members GroupMember[]
  invites GroupInvite[]

  @@index([category])
  @@index([isPublic, isRecruiting])
  @@index([createdBy])
}
```

### GroupMember (그룹 멤버)

```prisma
model GroupMember {
  id      String            @id @default(cuid())
  groupId String
  userId  String
  role    GroupMemberRole   @default(MEMBER)
  status  GroupMemberStatus @default(ACTIVE)

  joinedAt DateTime  @default(now())
  leftAt   DateTime?

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([userId])
  @@index([status])
  @@index([groupId, status])
}
```

### GroupInvite (그룹 초대)

```prisma
model GroupInvite {
  id        String            @id @default(cuid())
  groupId   String
  invitedBy String
  email     String?
  code      String            @unique @default(cuid())
  status    GroupInviteStatus @default(PENDING)

  createdAt DateTime  @default(now())
  expiresAt DateTime?
  usedAt    DateTime?
  usedBy    String?

  group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  inviter User  @relation("GroupInviter", fields: [invitedBy], references: [id])
  user    User? @relation("GroupInvitee", fields: [usedBy], references: [id])

  @@index([groupId])
  @@index([invitedBy])
  @@index([status])
  @@index([code])
}
```

---

## 🏷️ Group 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `name` | String | ✅ | - | 그룹 이름 |
| `description` | String | ❌ | null | 그룹 설명 |
| `category` | String | ✅ | "etc" | 카테고리 |
| `imageUrl` | String | ❌ | null | 그룹 이미지 URL |
| `isPublic` | Boolean | ✅ | true | 공개 여부 |
| `maxMembers` | Int | ✅ | 50 | 최대 멤버 수 |
| `isRecruiting` | Boolean | ✅ | true | 모집 중 여부 |
| `createdBy` | String | ✅ | - | 생성자 ID |
| `deletedAt` | DateTime | ❌ | null | 삭제 일시 (Soft Delete) |

---

## 📌 Enum 타입

### GroupMemberRole (멤버 역할)

| 값 | 설명 | 권한 |
|----|------|------|
| `OWNER` | 그룹장 | 모든 권한 |
| `ADMIN` | 관리자 | 멤버 관리 |
| `MEMBER` | 일반 멤버 | 참여 |

### GroupMemberStatus (멤버 상태)

| 값 | 설명 |
|----|------|
| `PENDING` | 가입 대기 중 |
| `ACTIVE` | 활성 멤버 |
| `LEFT` | 탈퇴 |
| `KICKED` | 강퇴됨 |

### GroupInviteStatus (초대 상태)

| 값 | 설명 |
|----|------|
| `PENDING` | 대기 중 |
| `ACCEPTED` | 수락됨 |
| `EXPIRED` | 만료됨 |
| `CANCELLED` | 취소됨 |

---

## 🔍 인덱스

### Group 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([category])` | category | 카테고리별 조회 |
| `@@index([isPublic, isRecruiting])` | isPublic, isRecruiting | 공개 모집 중 그룹 |
| `@@index([createdBy])` | createdBy | 생성자별 조회 |

### GroupMember 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@unique([groupId, userId])` | groupId, userId | 중복 가입 방지 |
| `@@index([userId])` | userId | 사용자 그룹 목록 |
| `@@index([status])` | status | 상태별 필터링 |
| `@@index([groupId, status])` | groupId, status | 그룹별 상태 조회 |

---

## 💡 사용 예시

### 그룹 생성
```javascript
const group = await prisma.group.create({
  data: {
    name: '프론트엔드 개발자 모임',
    description: 'React, Vue, Angular 개발자들의 모임',
    category: 'programming',
    createdBy: userId,
    members: {
      create: {
        userId: userId,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    }
  }
});
```

### 그룹 초대 링크 생성
```javascript
const invite = await prisma.groupInvite.create({
  data: {
    groupId: 'group-id',
    invitedBy: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 만료
  }
});

const inviteLink = `https://coup.app/groups/invite/${invite.code}`;
```

### 초대 수락
```javascript
const invite = await prisma.groupInvite.findUnique({
  where: { code: 'invite-code' }
});

if (invite && invite.status === 'PENDING') {
  await prisma.$transaction([
    prisma.groupMember.create({
      data: {
        groupId: invite.groupId,
        userId: newUserId,
        status: 'ACTIVE'
      }
    }),
    prisma.groupInvite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        usedAt: new Date(),
        usedBy: newUserId
      }
    })
  ]);
}
```

---

## 🔗 관련 문서

- [사용자 모델](./user.md)
- [스터디 멤버 모델](./study-member.md)
