// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\12-contract.md
# 근로계약서 도메인 파일 구조 (Contract Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

근로계약서 작성 및 관리 관련 화면입니다.
- **계약서 목록**: 전체 계약서 조회, 상태별 필터
- **계약서 작성**: 표준 양식 기반 자동 생성 (관리자)
- **계약서 상세**: 내용 확인, PDF 다운로드
- **전자 서명**: 터치 기반 전자서명

---

## 디렉토리 구조

```
src/features/contract/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~7 lines)
│   │
│   ├── ContractListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractListScreen.tsx      # 계약서 목록 (~80 lines)
│   │   └── ContractListScreen.styles.ts # (~50 lines)
│   │
│   ├── ContractDetailScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractDetailScreen.tsx    # 계약서 상세 (~85 lines)
│   │   └── ContractDetailScreen.styles.ts # (~55 lines)
│   │
│   ├── ContractCreateScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractCreateScreen.tsx    # 계약서 작성 (~90 lines)
│   │   └── ContractCreateScreen.styles.ts # (~55 lines)
│   │
│   ├── ContractPreviewScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractPreviewScreen.tsx   # 계약서 미리보기 (~75 lines)
│   │   └── ContractPreviewScreen.styles.ts # (~45 lines)
│   │
│   └── SignatureScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── SignatureScreen.tsx         # 전자서명 화면 (~80 lines)
│       └── SignatureScreen.styles.ts   # (~50 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~18 lines)
│   │
│   ├── ContractFilterTabs/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractFilterTabs.tsx      # 필터 탭 (~45 lines)
│   │   └── ContractFilterTabs.styles.ts # (~35 lines)
│   │
│   ├── ContractCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractCard.tsx            # 계약서 카드 (~55 lines)
│   │   └── ContractCard.styles.ts      # (~45 lines)
│   │
│   ├── ContractForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractForm.tsx            # 계약서 폼 (~60 lines)
│   │   └── ContractForm.styles.ts      # (~50 lines)
│   │
│   ├── EmployeeSelector/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EmployeeSelector.tsx        # 직원 선택 (~50 lines)
│   │   └── EmployeeSelector.styles.ts  # (~40 lines)
│   │
│   ├── ContractPeriodInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractPeriodInput.tsx     # 계약 기간 입력 (~50 lines)
│   │   └── ContractPeriodInput.styles.ts # (~40 lines)
│   │
│   ├── WageInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WageInput.tsx               # 임금 입력 (~55 lines)
│   │   └── WageInput.styles.ts         # (~45 lines)
│   │
│   ├── WorkConditionInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkConditionInput.tsx      # 근로 조건 입력 (~55 lines)
│   │   └── WorkConditionInput.styles.ts # (~45 lines)
│   │
│   ├── ContractViewer/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ContractViewer.tsx          # 계약서 뷰어 (~55 lines)
│   │   └── ContractViewer.styles.ts    # (~45 lines)
│   │
│   ├── SignaturePad/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SignaturePad.tsx            # 서명 패드 (~60 lines)
│   │   └── SignaturePad.styles.ts      # (~50 lines)
│   │
│   ├── SignaturePreview/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SignaturePreview.tsx        # 서명 미리보기 (~40 lines)
│   │   └── SignaturePreview.styles.ts  # (~30 lines)
│   │
│   └── LegalWarning/
│       ├── index.ts                    # (~3 lines)
│       ├── LegalWarning.tsx            # 법규 위반 경고 (~45 lines)
│       └── LegalWarning.styles.ts      # (~35 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useContractList.ts              # 계약서 목록 (~55 lines)
│   ├── useContractDetail.ts            # 계약서 상세 (~50 lines)
│   ├── useContractCreate.ts            # 계약서 생성 (~55 lines)
│   ├── useContractUpdate.ts            # 계약서 수정 (~50 lines)
│   ├── useContractValidation.ts        # 법규 검증 (~50 lines)
│   ├── useContractSend.ts              # 계약서 발송 (~40 lines)
│   ├── useSignature.ts                 # 전자서명 (~55 lines)
│   └── useContractPdf.ts               # PDF 생성/다운로드 (~45 lines)
│
├── types/
│   └── contract.types.ts               # 계약서 타입 정의 (~65 lines)
│
├── constants/
│   └── contract.constants.ts           # 계약서 상수 (~35 lines)
│
└── utils/
    ├── contractGenerator.ts            # 계약서 생성 유틸 (~55 lines)
    └── legalValidator.ts               # 법규 검증 유틸 (~50 lines)
```

---

## 스크린 상세

### ContractCreateScreen.tsx (~90 lines)

```typescript
import React, { useState, useCallback } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, FixedBottomButton, AlertModal } from '@components/common';
import {
  ContractForm,
  EmployeeSelector,
  ContractPeriodInput,
  WageInput,
  WorkConditionInput,
  LegalWarning,
} from '../components';
import { useContractCreate, useContractValidation } from '../hooks';
import { ContractFormData } from '../types/contract.types';
import { styles } from './ContractCreateScreen.styles';

const ContractCreateScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { createContract, isLoading, error } = useContractCreate();
  const { validate, warnings } = useContractValidation();

  const [formData, setFormData] = useState<ContractFormData>({
    employeeId: '',
    startDate: new Date(),
    endDate: null,
    isIndefinite: false,
    hourlyWage: 0,
    workDays: [],
    workStartTime: '09:00',
    workEndTime: '18:00',
    breakTime: 60,
    specialConditions: '',
  });

  const updateFormData = useCallback((updates: Partial<ContractFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      validate(updated);
      return updated;
    });
  }, [validate]);

  const isFormValid = 
    formData.employeeId !== '' &&
    formData.hourlyWage > 0 &&
    formData.workDays.length > 0 &&
    warnings.length === 0;

  const handlePreview = () => {
    navigation.navigate('ContractPreview', { formData });
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    const success = await createContract(formData);
    if (success) {
      navigation.navigate('ContractDetail', { id: success.id });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="근로계약서 작성" />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <EmployeeSelector
            selectedId={formData.employeeId}
            onSelect={(id) => updateFormData({ employeeId: id })}
          />
          
          <ContractPeriodInput
            startDate={formData.startDate}
            endDate={formData.endDate}
            isIndefinite={formData.isIndefinite}
            onUpdate={updateFormData}
          />
          
          <WageInput
            hourlyWage={formData.hourlyWage}
            onUpdate={updateFormData}
          />
          
          <WorkConditionInput
            workDays={formData.workDays}
            workStartTime={formData.workStartTime}
            workEndTime={formData.workEndTime}
            breakTime={formData.breakTime}
            onUpdate={updateFormData}
          />
          
          {warnings.length > 0 && (
            <LegalWarning warnings={warnings} />
          )}
        </ScrollView>
        
        <View style={styles.buttonRow}>
          <FixedBottomButton
            title="미리보기"
            onPress={handlePreview}
            variant="secondary"
          />
          <FixedBottomButton
            title="생성하기"
            onPress={handleSubmit}
            disabled={!isFormValid}
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ContractCreateScreen;
```

### SignatureScreen.tsx (~80 lines)

```typescript
import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header, PrimaryButton, SecondaryButton, AlertModal } from '@components/common';
import { SignaturePad, SignaturePreview } from '../components';
import { useSignature } from '../hooks';
import { styles } from './SignatureScreen.styles';

interface RouteParams {
  contractId: string;
}

const SignatureScreen = (): JSX.Element => {
  const route = useRoute();
  const navigation = useNavigation();
  const { contractId } = route.params as RouteParams;
  
  const signaturePadRef = useRef<any>(null);
  const { submitSignature, isLoading, error } = useSignature(contractId);
  
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setSignatureData(null);
  };

  const handleEnd = () => {
    const data = signaturePadRef.current?.toDataURL();
    setSignatureData(data);
  };

  const handleSubmit = () => {
    if (!signatureData) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    if (!signatureData) return;
    
    const success = await submitSignature(signatureData);
    if (success) {
      navigation.navigate('ContractDetail', { id: contractId });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="전자 서명" />
      
      <View style={styles.content}>
        <Text style={styles.instruction}>
          아래 영역에 서명해 주세요
        </Text>
        
        <SignaturePad
          ref={signaturePadRef}
          onEnd={handleEnd}
          style={styles.signaturePad}
        />
        
        {signatureData && (
          <SignaturePreview data={signatureData} />
        )}
        
        <Text style={styles.notice}>
          서명을 제출하면 법적 효력이 발생합니다.
        </Text>
      </View>
      
      <View style={styles.buttonRow}>
        <SecondaryButton
          title="다시 그리기"
          onPress={handleClear}
          style={styles.clearButton}
        />
        <PrimaryButton
          title="서명 제출"
          onPress={handleSubmit}
          disabled={!signatureData}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
      
      <AlertModal
        visible={showConfirmModal}
        title="서명 제출"
        message="서명을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다."
        confirmText="제출"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  );
};

export default SignatureScreen;
```

---

## 컴포넌트 상세

### ContractCard.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Badge } from '@components/common';
import { RelativeTime } from '@components/shared';
import { Contract, ContractStatus } from '../types/contract.types';
import { styles } from './ContractCard.styles';

interface ContractCardProps {
  contract: Contract;
  onPress: () => void;
}

const ContractCard = ({ contract, onPress }: ContractCardProps): JSX.Element => {
  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'pending':
        return <Badge text="서명대기" variant="warning" />;
      case 'signed':
        return <Badge text="서명완료" variant="success" />;
      case 'expired':
        return <Badge text="만료" variant="neutral" />;
    }
  };

  const formatPeriod = () => {
    const start = contract.startDate.toLocaleDateString('ko-KR');
    if (contract.isIndefinite) {
      return `${start} ~`;
    }
    const end = contract.endDate?.toLocaleDateString('ko-KR');
    return `${start} ~ ${end}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>📄</Text>
        <Text style={styles.title}>{contract.title}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.employeeName}>👤 {contract.employeeName}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.period}>📅 {formatPeriod()}</Text>
      </View>
      
      <View style={styles.footer}>
        {getStatusBadge(contract.status)}
        <RelativeTime date={contract.createdAt} style={styles.createdAt} />
      </View>
    </TouchableOpacity>
  );
};

export default ContractCard;
```

### SignaturePad.tsx (~60 lines)

```typescript
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, ViewStyle } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { styles } from './SignaturePad.styles';

interface SignaturePadProps {
  onEnd?: () => void;
  onBegin?: () => void;
  style?: ViewStyle;
}

interface SignaturePadRef {
  clear: () => void;
  toDataURL: () => string;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onEnd, onBegin, style }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clearSignature();
      },
      toDataURL: () => {
        return signatureRef.current?.toDataURL('image/png') ?? '';
      },
    }));

    const handleEnd = () => {
      onEnd?.();
    };

    const handleBegin = () => {
      onBegin?.();
    };

    return (
      <View style={[styles.container, style]}>
        <SignatureCanvas
          ref={signatureRef}
          onEnd={handleEnd}
          onBegin={handleBegin}
          descriptionText=""
          clearText=""
          confirmText=""
          webStyle={`
            .m-signature-pad { border: none; box-shadow: none; }
            .m-signature-pad--body { border: 2px dashed #D4D4D8; border-radius: 12px; }
            .m-signature-pad--footer { display: none; }
          `}
          backgroundColor="white"
          penColor="#18181B"
          minWidth={2}
          maxWidth={4}
        />
      </View>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
```

---

## 타입 정의

### contract.types.ts (~65 lines)

```typescript
export type ContractStatus = 'pending' | 'signed' | 'expired';
export type ContractFilterType = 'all' | 'pending' | 'signed' | 'expired';

export interface Contract {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  startDate: Date;
  endDate?: Date;
  isIndefinite: boolean;
  hourlyWage: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  specialConditions?: string;
  status: ContractStatus;
  employeeSignature?: string;
  employerSignature?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractFormData {
  employeeId: string;
  startDate: Date;
  endDate: Date | null;
  isIndefinite: boolean;
  hourlyWage: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  specialConditions?: string;
}

export interface LegalWarning {
  type: 'error' | 'warning';
  field: string;
  message: string;
  suggestion?: string;
}

export interface ContractCounts {
  all: number;
  pending: number;
  signed: number;
  expired: number;
}

export interface ContractPdfData {
  contractId: string;
  pdfUrl: string;
  generatedAt: Date;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| ContractListScreen.tsx | 80 | 계약서 목록 |
| ContractDetailScreen.tsx | 85 | 계약서 상세 |
| ContractCreateScreen.tsx | 90 | 계약서 작성 |
| ContractPreviewScreen.tsx | 75 | 계약서 미리보기 |
| SignatureScreen.tsx | 80 | 전자서명 |
| **Components** | | |
| ContractFilterTabs.tsx | 45 | 필터 탭 |
| ContractCard.tsx | 55 | 계약서 카드 |
| ContractForm.tsx | 60 | 계약서 폼 |
| EmployeeSelector.tsx | 50 | 직원 선택 |
| ContractPeriodInput.tsx | 50 | 계약 기간 |
| WageInput.tsx | 55 | 임금 입력 |
| WorkConditionInput.tsx | 55 | 근로 조건 |
| ContractViewer.tsx | 55 | 계약서 뷰어 |
| SignaturePad.tsx | 60 | 서명 패드 |
| SignaturePreview.tsx | 40 | 서명 미리보기 |
| LegalWarning.tsx | 45 | 법규 경고 |
| **Hooks** | | |
| useContractList.ts | 50 | 계약서 목록 |
| useContractCreate.ts | 55 | 계약서 생성 |
| useContractValidation.ts | 50 | 법규 검증 |
| useSignature.ts | 50 | 서명 관리 |
| useContractPdf.ts | 45 | PDF 생성 |

**총 파일 수**: 스크린 10개 + 컴포넌트 22개 + 훅 6개 + 타입/상수/유틸 4개 = **42개 파일**

