// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\04-attendance.md
# 출퇴근 도메인 파일 구조 (Attendance Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

GPS 기반 출퇴근 체크 및 근태 관리 화면입니다.
- **조기 출근 급여 과지급 방지**: 시업 시간 이전 출근 시 급여는 설정된 시업 시간부터 계산
- **퇴근 제한**: 업무 체크리스트 미완료 시 퇴근 버튼 비활성화
- **미수행 업무 사유**: 안 한 업무는 사유 입력 필수 (3자 이상)

---

## 디렉토리 구조

```
src/features/attendance/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~5 lines)
│   │
│   ├── AttendanceMainScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AttendanceMainScreen.tsx    # 출퇴근 메인 화면 (~90 lines)
│   │   └── AttendanceMainScreen.styles.ts  # (~55 lines)
│   │
│   ├── ManualInputScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ManualInputScreen.tsx       # 수동 근태 입력 화면 (~85 lines)
│   │   └── ManualInputScreen.styles.ts # (~50 lines)
│   │
│   └── EditRequestScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── EditRequestScreen.tsx       # 근태 수정 요청 화면 (~80 lines)
│       └── EditRequestScreen.styles.ts # (~45 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~15 lines)
│   │
│   ├── TimeDisplayCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── TimeDisplayCard.tsx         # 현재 시간 표시 (~45 lines)
│   │   └── TimeDisplayCard.styles.ts   # (~40 lines)
│   │
│   ├── LocationStatusCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── LocationStatusCard.tsx      # 위치 상태 카드 (~50 lines)
│   │   └── LocationStatusCard.styles.ts # (~45 lines)
│   │
│   ├── BigAttendanceButton/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── BigAttendanceButton.tsx     # 대형 출퇴근 버튼 (~55 lines)
│   │   └── BigAttendanceButton.styles.ts # (~55 lines)
│   │
│   ├── EarlyCheckInAlert/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EarlyCheckInAlert.tsx       # 조기 출근 안내 (~40 lines)
│   │   └── EarlyCheckInAlert.styles.ts # (~35 lines)
│   │
│   ├── ChecklistWarning/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ChecklistWarning.tsx        # 체크리스트 미완료 경고 (~45 lines)
│   │   └── ChecklistWarning.styles.ts  # (~40 lines)
│   │
│   ├── TodayWorkInfoCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── TodayWorkInfoCard.tsx       # 오늘 근무 정보 (~50 lines)
│   │   └── TodayWorkInfoCard.styles.ts # (~45 lines)
│   │
│   ├── ManualInputForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ManualInputForm.tsx         # 수동 입력 폼 (~55 lines)
│   │   └── ManualInputForm.styles.ts   # (~45 lines)
│   │
│   ├── EditRequestForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── EditRequestForm.tsx         # 수정 요청 폼 (~55 lines)
│   │   └── EditRequestForm.styles.ts   # (~45 lines)
│   │
│   ├── AttendanceHistoryItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AttendanceHistoryItem.tsx   # 근태 기록 항목 (~45 lines)
│   │   └── AttendanceHistoryItem.styles.ts # (~40 lines)
│   │
│   └── ReasonInputModal/
│       ├── index.ts                    # (~3 lines)
│       ├── ReasonInputModal.tsx        # 사유 입력 모달 (~50 lines)
│       └── ReasonInputModal.styles.ts  # (~40 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useAttendance.ts                # 출퇴근 체크 로직 (~65 lines)
│   ├── useTodayAttendance.ts           # 오늘 출퇴근 조회 (~45 lines)
│   ├── useAttendanceRecords.ts         # 출퇴근 기록 목록 (~50 lines)
│   ├── useLocation.ts                  # GPS 위치 관리 (~55 lines)
│   ├── useManualInput.ts               # 수동 입력 로직 (~50 lines)
│   ├── useEditRequest.ts               # 수정 요청 로직 (~50 lines)
│   └── useChecklistValidation.ts       # 체크리스트 검증 (~40 lines)
│
├── types/
│   └── attendance.types.ts             # 출퇴근 타입 정의 (~50 lines)
│
├── constants/
│   └── attendance.constants.ts         # 출퇴근 상수 (~25 lines)
│
└── utils/
    ├── locationUtils.ts                # 위치 계산 유틸 (~45 lines)
    └── attendanceValidation.ts         # 출퇴근 검증 유틸 (~40 lines)
```

---

## 스크린 상세

### AttendanceMainScreen.tsx (~90 lines)

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, TextButton } from '@components/common';
import {
  TimeDisplayCard,
  LocationStatusCard,
  BigAttendanceButton,
  EarlyCheckInAlert,
  ChecklistWarning,
  TodayWorkInfoCard,
} from '../components';
import { useAttendance, useLocation, useChecklistValidation } from '../hooks';
import { styles } from './AttendanceMainScreen.styles';

const AttendanceMainScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { 
    attendanceStatus, 
    todayRecord,
    checkIn, 
    checkOut, 
    isLoading 
  } = useAttendance();
  const { isInRange, distance, locationError, refreshLocation } = useLocation();
  const { isChecklistComplete, incompleteCount } = useChecklistValidation();

  const isEarlyCheckIn = attendanceStatus === 'not_checked_in' && 
    new Date().getTime() < todayRecord?.scheduledStartTime?.getTime();

  const canCheckOut = attendanceStatus === 'working' && isChecklistComplete;

  const handleAttendancePress = async () => {
    if (attendanceStatus === 'not_checked_in') {
      await checkIn();
    } else if (canCheckOut) {
      await checkOut();
    }
  };

  const handleManualInput = () => {
    navigation.navigate('ManualInput');
  };

  const handleEditRequest = () => {
    navigation.navigate('EditRequest');
  };

  const handleGoToChecklist = () => {
    navigation.navigate('Checklist');
  };

  return (
    <View style={styles.container}>
      <Header title="출퇴근" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <TimeDisplayCard />
        
        <LocationStatusCard
          isInRange={isInRange}
          distance={distance}
          error={locationError}
          onRefresh={refreshLocation}
        />
        
        <BigAttendanceButton
          status={attendanceStatus}
          onPress={handleAttendancePress}
          disabled={!isInRange || (attendanceStatus === 'working' && !canCheckOut)}
          loading={isLoading}
        />
        
        {isEarlyCheckIn && (
          <EarlyCheckInAlert 
            scheduledTime={todayRecord?.scheduledStartTime} 
          />
        )}
        
        {attendanceStatus === 'working' && !isChecklistComplete && (
          <ChecklistWarning
            incompleteCount={incompleteCount}
            onGoToChecklist={handleGoToChecklist}
          />
        )}
        
        <TodayWorkInfoCard
          checkInTime={todayRecord?.checkInTime}
          checkOutTime={todayRecord?.checkOutTime}
          scheduledStartTime={todayRecord?.scheduledStartTime}
        />
        
        <View style={styles.linkContainer}>
          <TextButton title="수동 입력하기" onPress={handleManualInput} />
          <TextButton title="수정 요청하기" onPress={handleEditRequest} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AttendanceMainScreen;
```

### ManualInputScreen.tsx (~85 lines)

```typescript
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Header, FixedBottomButton } from '@components/common';
import { ManualInputForm, ReasonInputModal } from '../components';
import { useManualInput } from '../hooks';
import { styles } from './ManualInputScreen.styles';

const ManualInputScreen = (): JSX.Element => {
  const {
    formData,
    updateFormData,
    isValid,
    submit,
    isLoading,
    showReasonModal,
    setShowReasonModal,
  } = useManualInput();

  const handleSubmit = async () => {
    await submit();
  };

  return (
    <View style={styles.container}>
      <Header title="수동 근태 입력" />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ManualInputForm
            formData={formData}
            onUpdate={updateFormData}
          />
        </ScrollView>
        
        <FixedBottomButton
          title="제출하기"
          onPress={handleSubmit}
          disabled={!isValid}
          loading={isLoading}
        />
      </KeyboardAvoidingView>
      
      <ReasonInputModal
        visible={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSubmit={(reason) => updateFormData({ reason })}
        minLength={3}
      />
    </View>
  );
};

export default ManualInputScreen;
```

---

## 컴포넌트 상세

### BigAttendanceButton.tsx (~55 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AttendanceStatus } from '../types/attendance.types';
import { styles } from './BigAttendanceButton.styles';

interface BigAttendanceButtonProps {
  status: AttendanceStatus;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const BigAttendanceButton = ({
  status,
  onPress,
  disabled = false,
  loading = false,
}: BigAttendanceButtonProps): JSX.Element => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onPress();
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'not_checked_in':
        return { icon: '▶️', label: '출근하기', color: 'primary' };
      case 'working':
        return { icon: '⏹️', label: '퇴근하기', color: 'danger' };
      case 'checked_out':
        return { icon: '✓', label: '퇴근완료', color: 'neutral' };
      default:
        return { icon: '▶️', label: '출근하기', color: 'primary' };
    }
  };

  const config = getButtonConfig();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles[`button_${config.color}`],
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={styles.label}>{config.label}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.hint}>
        {disabled ? '체크리스트를 완료해주세요' : '버튼을 눌러 출퇴근하세요'}
      </Text>
    </View>
  );
};

export default BigAttendanceButton;
```

### LocationStatusCard.tsx (~50 lines)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseCard } from '@components/common';
import { styles } from './LocationStatusCard.styles';

interface LocationStatusCardProps {
  isInRange: boolean;
  distance: number;
  error?: string;
  onRefresh: () => void;
}

const LocationStatusCard = ({
  isInRange,
  distance,
  error,
  onRefresh,
}: LocationStatusCardProps): JSX.Element => {
  const getStatusConfig = () => {
    if (error) {
      return {
        icon: '⚠️',
        title: '위치를 확인할 수 없습니다',
        description: error,
        variant: 'error' as const,
      };
    }
    
    if (isInRange) {
      return {
        icon: '✅',
        title: '출퇴근 가능 구역입니다',
        description: `매장에서 약 ${distance}m 떨어져 있습니다`,
        variant: 'success' as const,
      };
    }
    
    return {
      icon: '❌',
      title: '출퇴근 가능 구역이 아닙니다',
      description: `매장에서 약 ${distance}m 떨어져 있습니다`,
      variant: 'error' as const,
    };
  };

  const config = getStatusConfig();

  return (
    <BaseCard style={[styles.container, styles[`container_${config.variant}`]]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.label}>📍 현재 위치</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>새로고침</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, styles[`title_${config.variant}`]]}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>
    </BaseCard>
  );
};

export default LocationStatusCard;
```

---

## 훅 상세

### useAttendance.ts (~60 lines)

```typescript
import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { attendanceService } from '@services/attendance/attendanceService';
import { setTodayRecord } from '@store/slices/attendanceSlice';
import { AttendanceStatus, TodayAttendanceRecord } from '../types/attendance.types';

interface UseAttendanceReturn {
  attendanceStatus: AttendanceStatus;
  todayRecord: TodayAttendanceRecord | null;
  checkIn: () => Promise<boolean>;
  checkOut: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useAttendance = (): UseAttendanceReturn => {
  const dispatch = useAppDispatch();
  const todayRecord = useAppSelector((state) => state.attendance.todayRecord);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attendanceStatus: AttendanceStatus = 
    todayRecord?.checkOutTime ? 'checked_out' :
    todayRecord?.checkInTime ? 'working' :
    'not_checked_in';

  const checkIn = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await attendanceService.checkIn();
      dispatch(setTodayRecord(result));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '출근 체크에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const checkOut = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await attendanceService.checkOut();
      dispatch(setTodayRecord(result));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '퇴근 체크에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  return {
    attendanceStatus,
    todayRecord,
    checkIn,
    checkOut,
    isLoading,
    error,
  };
};
```

### useLocation.ts (~55 lines)

```typescript
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppSelector } from '@store/hooks';
import { calculateDistance } from '../utils/locationUtils';
import { ATTENDANCE_RADIUS } from '../constants/attendance.constants';

interface UseLocationReturn {
  isInRange: boolean;
  distance: number;
  currentLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
  isLoading: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const workplaceLocation = useAppSelector((state) => state.workplace.current?.location);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setLocationError(null);
    
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationError('위치 권한이 필요합니다.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      setLocationError('위치를 가져올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const distance = currentLocation && workplaceLocation
    ? calculateDistance(currentLocation, workplaceLocation)
    : 0;

  const isInRange = distance <= ATTENDANCE_RADIUS;

  return {
    isInRange,
    distance,
    currentLocation,
    locationError,
    refreshLocation: getCurrentLocation,
    isLoading,
  };
};
```

---

## 타입 정의

### attendance.types.ts (~50 lines)

```typescript
export type AttendanceStatus = 'not_checked_in' | 'working' | 'checked_out';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface TodayAttendanceRecord {
  id: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  isEarlyCheckIn: boolean;
  effectiveStartTime?: Date; // 실제 급여 계산 시작 시간
}

export interface ManualInputFormData {
  date: Date;
  checkInTime: Date;
  checkOutTime: Date;
  reason: string;
}

export interface EditRequestFormData {
  originalRecordId: string;
  requestType: 'check_in' | 'check_out' | 'both';
  newCheckInTime?: Date;
  newCheckOutTime?: Date;
  reason: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  workplaceId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  isManualInput: boolean;
  approvalStatus?: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| AttendanceMainScreen.tsx | 90 | 출퇴근 메인 |
| ManualInputScreen.tsx | 85 | 수동 입력 |
| EditRequestScreen.tsx | 80 | 수정 요청 |
| **Components** | | |
| TimeDisplayCard.tsx | 45 | 시간 표시 |
| LocationStatusCard.tsx | 50 | 위치 상태 |
| BigAttendanceButton.tsx | 55 | 대형 버튼 |
| EarlyCheckInAlert.tsx | 40 | 조기 출근 안내 |
| ChecklistWarning.tsx | 45 | 체크리스트 경고 |
| TodayWorkInfoCard.tsx | 50 | 오늘 근무 정보 |
| ManualInputForm.tsx | 55 | 수동 입력 폼 |
| EditRequestForm.tsx | 55 | 수정 요청 폼 |
| **Hooks** | | |
| useAttendance.ts | 60 | 출퇴근 체크 |
| useLocation.ts | 55 | GPS 위치 |
| useManualInput.ts | 50 | 수동 입력 |
| useEditRequest.ts | 50 | 수정 요청 |

**총 파일 수**: 스크린 6개 + 컴포넌트 20개 + 훅 5개 + 타입/상수/유틸 4개 = **35개 파일**

