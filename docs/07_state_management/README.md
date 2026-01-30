# 🔄 상태 관리

> CoUp의 전역 상태 관리 전략을 설명합니다.

---

## 📚 이 섹션의 문서

| 문서 | 설명 |
|------|------|
| [contexts/](./contexts/) | React Context API |
| [hooks/](./hooks/) | 커스텀 훅 |
| [tanstack-query.md](./tanstack-query.md) | 서버 상태 관리 |

---

## 🎯 상태 관리 전략

CoUp은 다음과 같은 상태 관리 전략을 사용합니다:

| 상태 유형 | 도구 | 설명 |
|-----------|------|------|
| **서버 상태** | TanStack Query | API 데이터, 캐싱 |
| **클라이언트 전역** | React Context | 설정, 소켓 연결 |
| **컴포넌트 로컬** | useState, useReducer | 폼 상태, UI 상태 |

---

## 📁 Context 목록

| Context | 파일 | 용도 |
|---------|------|------|
| SettingsContext | `SettingsContext.js` | 사용자 설정 상태 |
| SocketContext | `SocketContext.js` | Socket.io 연결 관리 |

---

## 🪝 커스텀 훅 목록

| Hook | 파일 | 용도 |
|------|------|------|
| useRestriction | `useRestriction.js` | 접근 권한 제어 |
| useSettingsUtils | `useSettingsUtils.js` | 설정 유틸리티 |

---

## 💡 TanStack Query 사용 패턴

```javascript
// Query Keys 구조
const queryKeys = {
  studies: ['studies'],
  study: (id) => ['studies', id],
  myStudies: ['my-studies'],
  tasks: (studyId) => ['tasks', studyId],
};
```

---

## 🔗 관련 문서

- [컴포넌트 구조](../06_components/README.md)
- [API 명세](../04_api/README.md)
- [실시간 통신](../02_architecture/realtime-communication.md)
