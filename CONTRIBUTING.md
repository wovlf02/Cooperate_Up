# CoUp 기여 가이드라인 (Contributing Guidelines)

Copyright © 2025 CoUp (코업). All Rights Reserved.

---

CoUp 프로젝트에 기여해주셔서 감사합니다! 🎉

본 문서는 CoUp에 기여하기 위한 가이드라인을 제공합니다.

---

## ⚠️ 중요: 라이선스 및 저작권 고지

**본 프로젝트에 기여하기 전에 반드시 아래 내용을 읽고 동의해야 합니다.**

### 저작권 양도

CoUp 프로젝트에 기여(Pull Request 제출, 코드 기여 등)함으로써, 귀하는 다음 사항에 동의합니다:

1. **저작권 양도**: 귀하가 기여한 모든 코드, 문서, 디자인의 저작권은 CoUp 프로젝트 저작권자에게 양도됩니다.

2. **라이선스 적용**: 귀하의 기여는 본 프로젝트의 라이선스(LICENSE 파일 참조)에 따라 배포됩니다.

3. **상업적 사용 권한**: 저작권자는 귀하의 기여를 포함한 소프트웨어를 상업적으로 사용할 권리를 갖습니다.

4. **원저작자 표시**: 기여자로서의 크레딧은 CONTRIBUTORS.md 또는 적절한 방식으로 인정됩니다.

### 기여자 라이선스 동의 (CLA)

Pull Request를 제출함으로써, 귀하는 다음을 확인합니다:

- [ ] 기여한 코드는 귀하가 직접 작성했거나, 적법한 권리를 보유하고 있습니다.
- [ ] 기여에 포함된 제3자 코드는 호환 가능한 라이선스(MIT, Apache 2.0, BSD 등)입니다.
- [ ] 저작권 양도 및 라이선스 조건에 동의합니다.

---

## 🚀 기여 방법

### 1. Issue 확인

기여하기 전에 먼저 [Issues](https://github.com/wovlf02/CoUp/issues)를 확인하세요:

- 🐛 **버그 리포트**: 버그를 발견했다면 이슈를 등록하세요
- 💡 **기능 제안**: 새로운 기능 아이디어가 있다면 제안하세요
- ❓ **질문**: 궁금한 점이 있다면 질문하세요

### 2. 개발 환경 설정

```bash
# 저장소 Fork 및 Clone
git clone https://github.com/YOUR_USERNAME/CoUp.git
cd CoUp

# 개발 환경 설정
cd coup
npm install

# 데이터베이스 설정
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 3. 브랜치 생성

```bash
# 최신 코드로 업데이트
git checkout main
git pull origin main

# 새 브랜치 생성
git checkout -b feature/your-feature-name
```

### 4. 코드 작성

아래 코딩 컨벤션을 따라 코드를 작성하세요.

### 5. 테스트

```bash
# 테스트 실행
npm test

# 린트 검사
npm run lint
```

### 6. 커밋 및 Push

```bash
git add .
git commit -m "feat: Add your feature"
git push origin feature/your-feature-name
```

### 7. Pull Request 생성

GitHub에서 Pull Request를 생성하고, 아래 체크리스트를 확인하세요.

---

## 📝 코딩 컨벤션

### 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `user-profile.jsx` |
| 컴포넌트명 | PascalCase | `UserProfile` |
| 함수/변수명 | camelCase | `getUserData` |
| 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

### 코드 스타일

- ESLint 규칙을 따릅니다
- 들여쓰기: 2 spaces
- 세미콜론: 사용
- 문자열: 작은따옴표 (`'`) 또는 템플릿 리터럴

### 컴포넌트 구조

```jsx
// 1. imports
import { useState } from 'react';

// 2. 컴포넌트 정의
export default function MyComponent({ prop1, prop2 }) {
  // 3. hooks
  const [state, setState] = useState(null);
  
  // 4. 이벤트 핸들러
  const handleClick = () => {
    // ...
  };
  
  // 5. 렌더링
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## 📋 커밋 메시지 규칙

```
<type>: <subject>

[optional body]

[optional footer]
```

### 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅 (기능 변경 없음) |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 설정 변경 |

### 예시

```bash
feat: 스터디 검색 기능 추가

- 키워드 기반 검색 구현
- 카테고리 필터 추가
- 페이지네이션 적용

Closes #123
```

---

## ✅ Pull Request 체크리스트

PR을 제출하기 전에 다음을 확인하세요:

- [ ] 코드가 ESLint 규칙을 통과합니다
- [ ] 모든 테스트가 통과합니다
- [ ] 새로운 기능에 대한 테스트를 작성했습니다
- [ ] 문서를 업데이트했습니다 (필요한 경우)
- [ ] 커밋 메시지가 규칙을 따릅니다
- [ ] **기여자 라이선스 동의(CLA)에 동의합니다**

---

## 🔍 코드 리뷰

### 리뷰 프로세스

1. PR 제출 후 1-3일 내에 리뷰가 진행됩니다
2. 수정 요청이 있으면 해당 내용을 반영합니다
3. 승인되면 main 브랜치에 병합됩니다

### 리뷰 기준

- 코드 품질 및 가독성
- 테스트 커버리지
- 보안 고려사항
- 성능 영향
- 기존 코드와의 일관성

---

## 🏆 기여자 인정

모든 기여자는 다음 방식으로 인정됩니다:

- CONTRIBUTORS.md에 이름 등재
- GitHub 기여자 목록에 표시
- 릴리스 노트에 감사 인사

---

## 📞 문의

기여 관련 질문이 있으시면:

- **GitHub Issues**: https://github.com/wovlf02/CoUp/issues
- **이메일**: nskfn02@gmail.com

---

## 📜 관련 문서

- [LICENSE](LICENSE) - 프로젝트 라이선스
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - 행동 강령
- [README.md](README.md) - 프로젝트 소개

---

Copyright © 2026 CoUp (이재필). All Rights Reserved.
