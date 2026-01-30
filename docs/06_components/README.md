# 🎨 UI 컴포넌트

> CoUp의 React 컴포넌트 구조와 Props를 상세히 문서화합니다.

---

## 📚 컴포넌트 카테고리

| 카테고리 | 설명 | 문서 |
|----------|------|------|
| 👑 **Admin** | 관리자 전용 컴포넌트 | [admin/](./admin/) |
| 💬 **Chat** | 채팅 관련 컴포넌트 | [chat/](./chat/) |
| 🔧 **Common** | 공통 컴포넌트 | [common/](./common/) |
| 📊 **Dashboard** | 대시보드 위젯 | [dashboard/](./dashboard/) |
| 🏠 **Landing** | 랜딩 페이지 | [landing/](./landing/) |
| 📐 **Layout** | 레이아웃 컴포넌트 | [layout/](./layout/) |
| 👤 **My-page** | 마이페이지 | [my-page/](./my-page/) |
| 🔔 **Notifications** | 알림 컴포넌트 | [notifications/](./notifications/) |
| 📖 **Studies** | 스터디 목록 | [studies/](./studies/) |
| 📚 **Study** | 스터디 상세 | [study/](./study/) |
| ✅ **Tasks** | 태스크 컴포넌트 | [tasks/](./tasks/) |
| 🎯 **UI** | 기본 UI 요소 | [ui/](./ui/) |
| 📹 **Video-call** | 화상 통화 | [video-call/](./video-call/) |

---

## 🏗️ 컴포넌트 분류 체계

### 1. 프레젠테이셔널 컴포넌트
- UI 표시만 담당
- Props로 데이터 수신
- 상태 관리 없음

### 2. 컨테이너 컴포넌트
- 데이터 페칭 담당
- 상태 관리
- 프레젠테이셔널 컴포넌트에 데이터 전달

### 3. 페이지 컴포넌트
- 라우트 단위
- 레이아웃 구성
- 서버/클라이언트 컴포넌트 분리

---

## 📋 컴포넌트 문서 형식

각 컴포넌트 문서는 다음을 포함합니다:

1. **개요**: 컴포넌트 역할
2. **Props**: 타입, 필수 여부, 기본값
3. **사용 예시**: 코드 예제
4. **의존성**: 사용하는 훅, 컨텍스트
5. **관련 컴포넌트**: 연관된 컴포넌트 링크

---

## 🔗 관련 문서

- [페이지 라우트](../05_pages/README.md)
- [상태 관리](../07_state_management/README.md)
- [스타일링 가이드](../01_overview/tech-stack.md)
