# 렌더링 최적화 가이드

대규모 트래픽 환경에서 React Native 앱의 성능을 최적화하기 위한 전략 문서입니다.

## 📚 문서 목록

| 문서 | 설명 |
|------|------|
| [01-overview.md](./01-overview.md) | 최적화 개요 및 성능 목표 |
| [02-component-optimization.md](./02-component-optimization.md) | 컴포넌트 최적화 전략 |
| [03-list-optimization.md](./03-list-optimization.md) | 대용량 리스트 최적화 |
| [04-image-optimization.md](./04-image-optimization.md) | 이미지 최적화 |
| [05-state-management.md](./05-state-management.md) | 상태 관리 최적화 |
| [06-network-optimization.md](./06-network-optimization.md) | 네트워크 요청 최적화 |
| [07-memory-optimization.md](./07-memory-optimization.md) | 메모리 관리 최적화 |
| [08-navigation-optimization.md](./08-navigation-optimization.md) | 네비게이션 최적화 |
| [09-bundle-optimization.md](./09-bundle-optimization.md) | 번들 사이즈 최적화 |
| [10-monitoring.md](./10-monitoring.md) | 성능 모니터링 |

## 🎯 성능 목표

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 앱 시작 시간 | < 2초 | Cold Start 기준 |
| 화면 전환 시간 | < 300ms | 네비게이션 완료 기준 |
| FPS | ≥ 60fps | 스크롤/애니메이션 중 |
| 메모리 사용량 | < 150MB | 일반 사용 기준 |
| 번들 사이즈 | < 10MB | JavaScript 번들 기준 |
| API 응답 시간 | < 200ms | 95th percentile |

## 🔧 최적화 우선순위

1. **P0 (Critical)**: 리스트 렌더링, 메모리 누수 방지
2. **P1 (High)**: 컴포넌트 리렌더링, 이미지 최적화
3. **P2 (Medium)**: 번들 사이즈, 네트워크 캐싱
4. **P3 (Low)**: 애니메이션, 코드 스플리팅

