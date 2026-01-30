# 10. 근로계약서 (Contract) TODO

> **Phase**: 2단계  
> **우선순위**: 🟠 중간

## 📊 진행 상황

**진행률**: 100% ✅ 완료

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████ 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ 완료된 항목

#### 화면 구현
- ✅ `ContractListScreen.tsx` - 계약서 목록
- ✅ `ContractDetailScreen.tsx` - 계약서 상세
- ✅ `ContractCreateScreen.tsx` - 계약서 작성
- ✅ `ContractSignScreen.tsx` - 계약서 서명
- ✅ `ContractPreviewScreen.tsx` - 계약서 미리보기

#### 계약서 컴포넌트
- ✅ `ContractCard.tsx` - 계약서 카드
- ✅ `ContractStatusBadge.tsx` - 상태 뱃지
- ✅ `SignatureCanvas.tsx` - 서명 캔버스
- ✅ `IdentityVerification.tsx` - 본인 인증

#### 핵심 기능
- ✅ 계약서 생성 (사업주)
- ✅ 계약서 서명 (직원)
- ✅ PDF 생성 및 다운로드
- ✅ 계약서 상태 관리
- ✅ 본인 인증

### ⏳ 개선 가능 항목 (선택사항)

- [ ] 계약서 템플릿 관리
- [ ] 계약서 만료일 알림
- [ ] 자동 갱신 옵션
- [ ] 계약서 수정 기능

---

## 📱 화면 목록

| 화면 | 파일 | 상태 | 권한 | 설명 |
|------|------|------|------|------|
| 계약서 목록 | `ContractListScreen.tsx` | ✅ 완료 | 공통 | 계약서 조회 |
| 계약서 상세 | `ContractDetailScreen.tsx` | ✅ 완료 | 공통 | 내용 확인 |
| 계약서 작성 | `ContractCreateScreen.tsx` | ✅ 완료 | 사업주 | 신규 작성 |
| 계약서 서명 | `ContractSignScreen.tsx` | ✅ 완료 | 직원 | 서명 |
| 계약서 미리보기 | `ContractPreviewScreen.tsx` | ✅ 완료 | 공통 | PDF 미리보기 |

---

## 💡 참고 사항

- 근로계약서 도메인은 **완전히 구현 완료**
- PDF 생성 및 서명 기능 모두 작동
- 추가 개선 항목은 **선택사항**

---

## 📚 참고 문서

| 문서 | 경로 |
|------|------|
| 계약서 명세 | `docs/05_screens/10_contract/contract-screens.md` |

---

## ⏭️ 다음 단계

1. → [11-payroll.md](./11-payroll.md) (급여)

