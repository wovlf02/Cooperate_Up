// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\02-auth.md
# 인증 도메인 파일 구조 (Auth Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

사용자 인증 관련 화면 및 컴포넌트 파일 구조입니다.
- **로그인**: 아이디 + 비밀번호, 자동 로그인 지원
- **회원가입**: 단계별 진행 (역할선택 → 기본정보 → 계정정보 → 사업자인증 → 프로필 → 약관)
- **비밀번호 재설정**: 이메일 인증번호 방식

---

## 디렉토리 구조

```
src/features/auth/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~5 lines)
│   │
│   ├── LoginScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── LoginScreen.tsx             # 로그인 화면 (~80 lines)
│   │   └── LoginScreen.styles.ts       # (~50 lines)
│   │
│   ├── RegisterScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── RegisterScreen.tsx          # 회원가입 메인 (~70 lines)
│   │   ├── RegisterScreen.styles.ts    # (~40 lines)
│   │   ├── RoleSelectionStep.tsx       # Step 1: 역할 선택 (~50 lines)
│   │   ├── RoleSelectionStep.styles.ts # (~35 lines)
│   │   ├── BasicInfoStep.tsx           # Step 2: 기본 정보 (~55 lines)
│   │   ├── BasicInfoStep.styles.ts     # (~35 lines)
│   │   ├── AccountInfoStep.tsx         # Step 3: 계정 정보 (~55 lines)
│   │   ├── AccountInfoStep.styles.ts   # (~35 lines)
│   │   ├── BusinessInfoStep.tsx        # Step 4: 사업자 인증 (관리자만) (~55 lines)
│   │   ├── BusinessInfoStep.styles.ts  # (~35 lines)
│   │   ├── ProfileSetupStep.tsx        # Step 5: 프로필 설정 (~50 lines)
│   │   ├── ProfileSetupStep.styles.ts  # (~35 lines)
│   │   ├── AgreementStep.tsx           # Step 6: 약관 동의 (~55 lines)
│   │   ├── AgreementStep.styles.ts     # (~40 lines)
│   │   ├── RegisterCompleteStep.tsx    # 완료 화면 (~40 lines)
│   │   └── RegisterCompleteStep.styles.ts # (~30 lines)
│   │
│   └── ForgotPasswordScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── ForgotPasswordScreen.tsx    # 비밀번호 찾기 메인 (~65 lines)
│       ├── ForgotPasswordScreen.styles.ts  # (~40 lines)
│       ├── EmailInputStep.tsx          # Step 1: 이메일 입력 (~50 lines)
│       ├── EmailInputStep.styles.ts    # (~35 lines)
│       ├── VerifyCodeStep.tsx          # Step 2: 인증번호 검증 (~55 lines)
│       ├── VerifyCodeStep.styles.ts    # (~40 lines)
│       ├── NewPasswordStep.tsx         # Step 3: 새 비밀번호 (~55 lines)
│       ├── NewPasswordStep.styles.ts   # (~35 lines)
│       ├── ResetCompleteStep.tsx       # Step 4: 완료 (~35 lines)
│       └── ResetCompleteStep.styles.ts # (~25 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~12 lines)
│   │
│   ├── LogoSection/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── LogoSection.tsx             # 로고 + 슬로건 (~40 lines)
│   │   └── LogoSection.styles.ts       # (~30 lines)
│   │
│   ├── RoleCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── RoleCard.tsx                # 역할 선택 카드 (~45 lines)
│   │   └── RoleCard.styles.ts          # (~40 lines)
│   │
│   ├── VerificationCodeInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── VerificationCodeInput.tsx   # 6자리 인증번호 입력 (~55 lines)
│   │   ├── VerificationCodeInput.styles.ts  # (~45 lines)
│   │   └── CodeDigit.tsx               # 개별 숫자 칸 (~35 lines)
│   │
│   ├── ResendTimer/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ResendTimer.tsx             # 재전송 타이머 (~45 lines)
│   │   └── ResendTimer.styles.ts       # (~30 lines)
│   │
│   ├── PasswordStrengthIndicator/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PasswordStrengthIndicator.tsx   # (~45 lines)
│   │   └── PasswordStrengthIndicator.styles.ts  # (~35 lines)
│   │
│   ├── PasswordConfirmInput/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── PasswordConfirmInput.tsx    # 비밀번호 확인 (~50 lines)
│   │   └── PasswordConfirmInput.styles.ts  # (~35 lines)
│   │
│   ├── AgreementCheckbox/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AgreementCheckbox.tsx       # 약관 동의 체크박스 (~45 lines)
│   │   └── AgreementCheckbox.styles.ts # (~30 lines)
│   │
│   └── ProgressHeader/
│       ├── index.ts                    # (~3 lines)
│       ├── ProgressHeader.tsx          # 진행률 헤더 (~40 lines)
│       └── ProgressHeader.styles.ts    # (~35 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useLogin.ts                     # 로그인 로직 (~55 lines)
│   ├── useRegister.ts                  # 회원가입 로직 (~65 lines)
│   ├── useForgotPassword.ts            # 비밀번호 재설정 (~60 lines)
│   ├── useVerificationCode.ts          # 인증번호 검증 (~55 lines)
│   ├── usePasswordStrength.ts          # 비밀번호 강도 체크 (~40 lines)
│   ├── useCheckUsername.ts             # 아이디 중복 확인 (~40 lines)
│   └── useBusinessVerify.ts            # 사업자등록번호 검증 (~40 lines)
│
├── types/
│   └── auth.types.ts                   # 인증 타입 정의 (~50 lines)
│
├── constants/
│   └── auth.constants.ts               # 인증 상수 (~30 lines)
│
└── utils/
    └── authValidation.ts               # 유효성 검사 유틸 (~45 lines)
```

---

## 스크린 상세

### LoginScreen.tsx (~80 lines)

```typescript
import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogoSection } from '../components';
import { TextInput, PasswordInput, Checkbox, PrimaryButton, TextButton, Divider } from '@components/common';
import { useLogin } from '../hooks';
import { styles } from './LoginScreen.styles';

const LoginScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { login, isLoading, error } = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const isFormValid = email.length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!isFormValid) return;
    await login({ email, password, rememberMe });
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <LogoSection />
        
        <View style={styles.form}>
          <TextInput
            label="아이디"
            value={email}
            onChangeText={setEmail}
            placeholder="아이디를 입력하세요"
            leftIcon="user"
            autoCapitalize="none"
            error={error?.email}
          />
          
          <PasswordInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            error={error?.password}
          />
          
          <Checkbox
            label="로그인 상태 유지"
            checked={rememberMe}
            onChange={setRememberMe}
          />
        </View>
        
        <PrimaryButton
          title="로그인"
          onPress={handleLogin}
          disabled={!isFormValid}
          loading={isLoading}
        />
        
        <TextButton
          title="비밀번호를 잊으셨나요?"
          onPress={handleForgotPassword}
        />
        
        <Divider />
        
        <TextButton
          title="계정이 없으신가요? 회원가입"
          onPress={handleRegister}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
```

### RegisterScreen.tsx (~70 lines)

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { Header, Stepper, FixedBottomButton } from '@components/common';
import { ProgressHeader } from '../components';
import {
  RoleSelectionStep,
  BasicInfoStep,
  AccountInfoStep,
  BusinessInfoStep,
  ProfileSetupStep,
  AgreementStep,
  RegisterCompleteStep,
} from './';
import { useRegister } from '../hooks';
import { RegisterStep } from '../types/auth.types';
import { styles } from './RegisterScreen.styles';

const STEPS: RegisterStep[] = ['role', 'basic', 'account', 'business', 'profile', 'agreement', 'complete'];

const RegisterScreen = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('role');
  const { formData, updateFormData, submitRegistration, isLoading } = useRegister();

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isAdminRole = formData.role === 'admin';
  const filteredSteps = isAdminRole ? STEPS : STEPS.filter(s => s !== 'business');

  const handleNext = () => {
    const nextIndex = filteredSteps.indexOf(currentStep) + 1;
    if (nextIndex < filteredSteps.length) {
      setCurrentStep(filteredSteps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = filteredSteps.indexOf(currentStep) - 1;
    if (prevIndex >= 0) {
      setCurrentStep(filteredSteps[prevIndex]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'role':
        return <RoleSelectionStep formData={formData} updateFormData={updateFormData} />;
      case 'basic':
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 'account':
        return <AccountInfoStep formData={formData} updateFormData={updateFormData} />;
      case 'business':
        return <BusinessInfoStep formData={formData} updateFormData={updateFormData} />;
      case 'profile':
        return <ProfileSetupStep formData={formData} updateFormData={updateFormData} />;
      case 'agreement':
        return <AgreementStep formData={formData} updateFormData={updateFormData} />;
      case 'complete':
        return <RegisterCompleteStep />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="회원가입" onBack={handleBack} showBack={currentStep !== 'role'} />
      <ProgressHeader 
        currentStep={filteredSteps.indexOf(currentStep) + 1} 
        totalSteps={filteredSteps.length - 1} 
      />
      {renderStep()}
    </View>
  );
};

export default RegisterScreen;
```

### ForgotPasswordScreen.tsx (~65 lines)

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, Stepper } from '@components/common';
import { EmailInputStep, VerifyCodeStep, NewPasswordStep, ResetCompleteStep } from './';
import { useForgotPassword } from '../hooks';
import { ForgotPasswordStep } from '../types/auth.types';
import { styles } from './ForgotPasswordScreen.styles';

const STEP_LABELS = ['이메일', '인증', '비밀번호', '완료'];

const ForgotPasswordScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const getStepIndex = (): number => {
    const steps: ForgotPasswordStep[] = ['email', 'verify', 'password', 'complete'];
    return steps.indexOf(step);
  };

  const handleNext = () => {
    switch (step) {
      case 'email':
        setStep('verify');
        break;
      case 'verify':
        setStep('password');
        break;
      case 'password':
        setStep('complete');
        break;
      case 'complete':
        navigation.navigate('Login');
        break;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return <EmailInputStep email={email} setEmail={setEmail} onNext={handleNext} {...forgotPassword} />;
      case 'verify':
        return <VerifyCodeStep email={email} onNext={handleNext} {...forgotPassword} />;
      case 'password':
        return <NewPasswordStep onNext={handleNext} {...forgotPassword} />;
      case 'complete':
        return <ResetCompleteStep onComplete={handleNext} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="비밀번호 찾기" />
      {step !== 'complete' && (
        <Stepper steps={STEP_LABELS} currentStep={getStepIndex()} />
      )}
      {renderStep()}
    </View>
  );
};

export default ForgotPasswordScreen;
```

---

## 컴포넌트 상세

### VerificationCodeInput.tsx (~55 lines)

```typescript
import React, { useRef, useEffect } from 'react';
import { View, TextInput, Text } from 'react-native';
import { CodeDigit } from './CodeDigit';
import { styles } from './VerificationCodeInput.styles';

interface VerificationCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
}

const VerificationCodeInput = ({
  value,
  onChange,
  length = 6,
  error,
  autoFocus = true,
}: VerificationCodeInputProps): JSX.Element => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const newCode = value.split('');
    newCode[index] = text.slice(-1); // 마지막 입력 문자만
    const updatedCode = newCode.join('');
    onChange(updatedCode);

    // 다음 입력으로 자동 이동
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // 백스페이스: 이전 입력으로 이동
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        {Array.from({ length }).map((_, index) => (
          <CodeDigit
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
            hasError={!!error}
            isFocused={value.length === index}
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default VerificationCodeInput;
```

### ResendTimer.tsx (~45 lines)

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ResendTimer.styles';

interface ResendTimerProps {
  initialSeconds?: number;
  onResend: () => Promise<void>;
}

const ResendTimer = ({ 
  initialSeconds = 180, 
  onResend 
}: ResendTimerProps): JSX.Element => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);
  
  const canResend = seconds === 0;

  useEffect(() => {
    if (seconds <= 0) return;
    
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
    } finally {
      setIsResending(false);
    }
  }, [onResend, initialSeconds]);

  const formatTime = (): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {canResend ? (
        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text style={[styles.resendText, isResending && styles.resendTextDisabled]}>
            {isResending ? '전송 중...' : '인증번호 재전송'}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.timerText}>재전송 가능 시간: {formatTime()}</Text>
      )}
    </View>
  );
};

export default ResendTimer;
```

---

## 훅 상세

### useLogin.ts (~50 lines)

```typescript
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@services/auth/authService';
import { setUser, setToken } from '@store/slices/authSlice';
import { LoginCredentials, LoginError } from '../types/auth.types';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: LoginError | null;
}

export const useLogin = (): UseLoginReturn => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      dispatch(setUser(response.user));
      dispatch(setToken(response.token));
      
      if (credentials.rememberMe) {
        await authService.saveCredentials(response.token);
      }
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigation]);

  return { login, isLoading, error };
};
```

### useForgotPassword.ts (~55 lines)

```typescript
import { useState, useCallback } from 'react';
import { authService } from '@services/auth/authService';

interface UseForgotPasswordReturn {
  sendVerificationCode: (email: string) => Promise<boolean>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const sendVerificationCode = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.sendVerificationCode(email);
      return true;
    } catch (err) {
      setError('인증번호 전송에 실패했습니다. 이메일을 확인해주세요.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyCode(email, code);
      setResetToken(response.resetToken);
      return true;
    } catch (err) {
      setError('인증번호가 올바르지 않습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string): Promise<boolean> => {
    if (!resetToken) {
      setError('인증이 필요합니다.');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(resetToken, newPassword);
      return true;
    } catch (err) {
      setError('비밀번호 변경에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [resetToken]);

  return { sendVerificationCode, verifyCode, resetPassword, isLoading, error };
};
```

---

## 타입 정의

### auth.types.ts (~50 lines)

```typescript
export type UserRole = 'admin' | 'worker';

export type RegisterStep = 
  | 'role' 
  | 'basic' 
  | 'account' 
  | 'business' 
  | 'profile' 
  | 'agreement' 
  | 'complete';

export type ForgotPasswordStep = 'email' | 'verify' | 'password' | 'complete';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginError {
  email?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormData {
  role: UserRole | null;
  name: string;
  phone: string;
  birthDate: string;
  email: string;
  password: string;
  passwordConfirm: string;
  businessNumber?: string;
  representativeName?: string;
  profileImage?: string;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedMarketing: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| LoginScreen.tsx | 80 | 로그인 화면 |
| RegisterScreen.tsx | 70 | 회원가입 메인 |
| RoleSelectionStep.tsx | 50 | 역할 선택 |
| BasicInfoStep.tsx | 55 | 기본 정보 |
| AccountInfoStep.tsx | 55 | 계정 정보 |
| BusinessInfoStep.tsx | 55 | 사업자 정보 |
| ProfileSetupStep.tsx | 50 | 프로필 설정 |
| AgreementStep.tsx | 55 | 약관 동의 |
| ForgotPasswordScreen.tsx | 65 | 비밀번호 찾기 메인 |
| EmailInputStep.tsx | 50 | 이메일 입력 |
| VerifyCodeStep.tsx | 55 | 인증번호 검증 |
| NewPasswordStep.tsx | 55 | 새 비밀번호 |
| **Components** | | |
| LogoSection.tsx | 40 | 로고 섹션 |
| RoleCard.tsx | 45 | 역할 카드 |
| VerificationCodeInput.tsx | 55 | 인증번호 입력 |
| ResendTimer.tsx | 45 | 재전송 타이머 |
| PasswordStrengthIndicator.tsx | 45 | 비밀번호 강도 |
| **Hooks** | | |
| useLogin.ts | 50 | 로그인 훅 |
| useRegister.ts | 60 | 회원가입 훅 |
| useForgotPassword.ts | 55 | 비밀번호 재설정 훅 |
| useVerificationCode.ts | 50 | 인증번호 훅 |

**총 파일 수**: 스크린 16개 + 컴포넌트 16개 + 훅 5개 + 타입/상수/유틸 3개 = **40개 파일**

---

## 관련 문서

- [API 서비스 구조](./14-services-api.md) - API 연동 파일 구조
- [인증 API 명세](../../13_api/01-auth.md) - 백엔드 인증 API 규격
- [사용자 API 명세](../../13_api/02-user.md) - 프로필 수정, 비밀번호 변경 API
