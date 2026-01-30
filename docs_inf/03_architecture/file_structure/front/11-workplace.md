// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\11-workplace.md
# 사업장 도메인 파일 구조 (Workplace Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

사업장 생성 및 관리 관련 화면입니다.
- **사업장 생성**: 새 사업장 등록 (관리자)
- **사업장 목록**: 소속 사업장 목록 조회
- **사업장 설정**: 위치, 근무시간 설정

---

## 디렉토리 구조

```
src/features/workplace/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~7 lines)
│   │
│   ├── WorkplaceListScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceListScreen.tsx     # 사업장 목록 (~75 lines)
│   │   └── WorkplaceListScreen.styles.ts # (~45 lines)
│   │
│   ├── WorkplaceCreateScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceCreateScreen.tsx   # 사업장 생성 (~85 lines)
│   │   └── WorkplaceCreateScreen.styles.ts # (~50 lines)
│   │
│   ├── WorkplaceDetailScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceDetailScreen.tsx   # 사업장 상세 (~80 lines)
│   │   └── WorkplaceDetailScreen.styles.ts # (~50 lines)
│   │
│   ├── LocationSettingScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── LocationSettingScreen.tsx   # 위치 설정 (~80 lines)
│   │   └── LocationSettingScreen.styles.ts # (~50 lines)
│   │
│   └── WorkTimeSettingScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── WorkTimeSettingScreen.tsx   # 근무시간 설정 (~75 lines)
│       └── WorkTimeSettingScreen.styles.ts # (~45 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~14 lines)
│   │
│   ├── WorkplaceCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceCard.tsx           # 사업장 카드 (~50 lines)
│   │   └── WorkplaceCard.styles.ts     # (~45 lines)
│   │
│   ├── WorkplaceForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkplaceForm.tsx           # 사업장 폼 (~55 lines)
│   │   └── WorkplaceForm.styles.ts     # (~45 lines)
│   │
│   ├── LocationPicker/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── LocationPicker.tsx          # 위치 선택 (~60 lines)
│   │   ├── LocationPicker.styles.ts    # (~50 lines)
│   │   └── MapView.tsx                 # 지도 뷰 (~45 lines)
│   │
│   ├── AddressSearch/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── AddressSearch.tsx           # 주소 검색 (~55 lines)
│   │   └── AddressSearch.styles.ts     # (~40 lines)
│   │
│   ├── RadiusSetting/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── RadiusSetting.tsx           # 출퇴근 반경 설정 (~45 lines)
│   │   └── RadiusSetting.styles.ts     # (~35 lines)
│   │
│   ├── WorkTimeForm/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── WorkTimeForm.tsx            # 근무시간 폼 (~55 lines)
│   │   └── WorkTimeForm.styles.ts      # (~45 lines)
│   │
│   └── TimePicker/
│       ├── index.ts                    # (~3 lines)
│       ├── TimePicker.tsx              # 시간 선택 (~45 lines)
│       └── TimePicker.styles.ts        # (~35 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~10 lines)
│   ├── useWorkplaceList.ts             # 사업장 목록 (~50 lines)
│   ├── useWorkplaceCreate.ts           # 사업장 생성 (~55 lines)
│   ├── useWorkplaceDetail.ts           # 사업장 상세 (~50 lines)
│   ├── useWorkplaceUpdate.ts           # 사업장 수정 (~45 lines)
│   ├── useLocationSetting.ts           # 위치 설정 (~55 lines)
│   ├── useWorkTimeSetting.ts           # 근무시간 설정 (~45 lines)
│   ├── useInviteEmployee.ts            # 직원 초대 (~45 lines)
│   ├── useMemberList.ts                # 멤버 목록 (~45 lines)
│   └── useMemberManage.ts              # 멤버 수정/삭제 (~50 lines)
│
├── types/
│   └── workplace.types.ts              # 사업장 타입 정의 (~50 lines)
│
└── constants/
    └── workplace.constants.ts          # 사업장 상수 (~25 lines)
```

---

## 스크린 상세

### WorkplaceCreateScreen.tsx (~85 lines)

```typescript
import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, FixedBottomButton } from '@components/common';
import { WorkplaceForm, LocationPicker } from '../components';
import { useWorkplaceCreate } from '../hooks';
import { WorkplaceFormData } from '../types/workplace.types';
import { styles } from './WorkplaceCreateScreen.styles';

const WorkplaceCreateScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { createWorkplace, isLoading, error } = useWorkplaceCreate();
  
  const [formData, setFormData] = useState<WorkplaceFormData>({
    name: '',
    address: '',
    detailAddress: '',
    location: null,
    radius: 100,
    startTime: '09:00',
    endTime: '18:00',
  });

  const updateFormData = (updates: Partial<WorkplaceFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isFormValid = 
    formData.name.length > 0 &&
    formData.address.length > 0 &&
    formData.location !== null;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    const success = await createWorkplace(formData);
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="사업장 등록" />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <WorkplaceForm
            formData={formData}
            onUpdate={updateFormData}
            error={error}
          />
          
          <LocationPicker
            location={formData.location}
            address={formData.address}
            radius={formData.radius}
            onLocationChange={(location) => updateFormData({ location })}
            onAddressChange={(address) => updateFormData({ address })}
            onRadiusChange={(radius) => updateFormData({ radius })}
          />
        </ScrollView>
        
        <FixedBottomButton
          title="사업장 등록"
          onPress={handleSubmit}
          disabled={!isFormValid}
          loading={isLoading}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default WorkplaceCreateScreen;
```

### LocationSettingScreen.tsx (~80 lines)

```typescript
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header, FixedBottomButton, AlertModal } from '@components/common';
import { LocationPicker, AddressSearch, RadiusSetting } from '../components';
import { useLocationSetting } from '../hooks';
import { styles } from './LocationSettingScreen.styles';

interface RouteParams {
  workplaceId: string;
}

const LocationSettingScreen = (): JSX.Element => {
  const route = useRoute();
  const { workplaceId } = route.params as RouteParams;
  
  const {
    currentLocation,
    currentAddress,
    currentRadius,
    updateLocation,
    isLoading,
    hasChanges,
  } = useLocationSetting(workplaceId);

  const [location, setLocation] = useState(currentLocation);
  const [address, setAddress] = useState(currentAddress);
  const [radius, setRadius] = useState(currentRadius);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLocation(currentLocation);
    setAddress(currentAddress);
    setRadius(currentRadius);
  }, [currentLocation, currentAddress, currentRadius]);

  const handleSave = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    await updateLocation({ location, address, radius });
  };

  return (
    <View style={styles.container}>
      <Header title="매장 위치 설정" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <AddressSearch
          value={address}
          onAddressSelect={(newAddress, newLocation) => {
            setAddress(newAddress);
            setLocation(newLocation);
          }}
        />
        
        <LocationPicker
          location={location}
          address={address}
          radius={radius}
          onLocationChange={setLocation}
          showMap
        />
        
        <RadiusSetting
          value={radius}
          onChange={setRadius}
        />
      </ScrollView>
      
      <FixedBottomButton
        title="저장"
        onPress={handleSave}
        disabled={!hasChanges}
        loading={isLoading}
      />
      
      <AlertModal
        visible={showConfirm}
        title="위치 변경"
        message="매장 위치를 변경하시겠습니까? 직원들의 출퇴근 가능 범위가 변경됩니다."
        confirmText="변경"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
};

export default LocationSettingScreen;
```

---

## 컴포넌트 상세

### LocationPicker.tsx (~60 lines)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Coordinates } from '../types/workplace.types';
import { styles } from './LocationPicker.styles';

interface LocationPickerProps {
  location: Coordinates | null;
  address: string;
  radius: number;
  onLocationChange?: (location: Coordinates) => void;
  onAddressChange?: (address: string) => void;
  onRadiusChange?: (radius: number) => void;
  showMap?: boolean;
}

const LocationPicker = ({
  location,
  address,
  radius,
  onLocationChange,
  showMap = true,
}: LocationPickerProps): JSX.Element => {
  const handleMapPress = (event: any) => {
    if (onLocationChange) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationChange({ latitude, longitude });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📍 매장 위치</Text>
      
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude ?? 37.5665,
              longitude: location?.longitude ?? 126.9780,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onPress={handleMapPress}
          >
            {location && (
              <>
                <Marker coordinate={location} />
                <Circle
                  center={location}
                  radius={radius}
                  fillColor="rgba(14, 165, 233, 0.2)"
                  strokeColor="rgba(14, 165, 233, 0.8)"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>
        </View>
      )}
      
      {address && (
        <View style={styles.addressContainer}>
          <Text style={styles.address}>{address}</Text>
        </View>
      )}
    </View>
  );
};

export default LocationPicker;
```

### WorkplaceCard.tsx (~50 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Badge } from '@components/common';
import { Workplace } from '../types/workplace.types';
import { styles } from './WorkplaceCard.styles';

interface WorkplaceCardProps {
  workplace: Workplace;
  isSelected: boolean;
  onPress: () => void;
}

const WorkplaceCard = ({
  workplace,
  isSelected,
  onPress,
}: WorkplaceCardProps): JSX.Element => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>🏢</Text>
        <Text style={styles.name}>{workplace.name}</Text>
        {isSelected && <Badge text="현재" variant="success" />}
      </View>
      
      <Text style={styles.address} numberOfLines={1}>
        {workplace.address}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.info}>
          👥 {workplace.employeeCount}명
        </Text>
        <Text style={styles.info}>
          ⏰ {workplace.startTime} - {workplace.endTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WorkplaceCard;
```

---

## 타입 정의

### workplace.types.ts (~50 lines)

```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Workplace {
  id: string;
  name: string;
  address: string;
  detailAddress?: string;
  location: Coordinates;
  radius: number;
  startTime: string;
  endTime: string;
  employeeCount: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkplaceFormData {
  name: string;
  address: string;
  detailAddress?: string;
  location: Coordinates | null;
  radius: number;
  startTime: string;
  endTime: string;
}

export interface LocationSettingData {
  location: Coordinates;
  address: string;
  radius: number;
}

export interface WorkTimeSettingData {
  defaultStartTime: string;
  defaultEndTime: string;
  individualSettings: IndividualWorkTime[];
}

export interface IndividualWorkTime {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| WorkplaceListScreen.tsx | 75 | 사업장 목록 |
| WorkplaceCreateScreen.tsx | 85 | 사업장 생성 |
| WorkplaceDetailScreen.tsx | 80 | 사업장 상세 |
| LocationSettingScreen.tsx | 80 | 위치 설정 |
| WorkTimeSettingScreen.tsx | 75 | 근무시간 설정 |
| **Components** | | |
| WorkplaceCard.tsx | 50 | 사업장 카드 |
| WorkplaceForm.tsx | 55 | 사업장 폼 |
| LocationPicker.tsx | 60 | 위치 선택 |
| MapView.tsx | 45 | 지도 뷰 |
| AddressSearch.tsx | 55 | 주소 검색 |
| RadiusSetting.tsx | 45 | 반경 설정 |
| WorkTimeForm.tsx | 55 | 근무시간 폼 |
| TimePicker.tsx | 45 | 시간 선택 |
| **Hooks** | | |
| useWorkplaceList.ts | 45 | 사업장 목록 |
| useWorkplaceCreate.ts | 50 | 사업장 생성 |
| useLocationSetting.ts | 55 | 위치 설정 |
| useWorkTimeSetting.ts | 45 | 근무시간 설정 |

**총 파일 수**: 스크린 10개 + 컴포넌트 16개 + 훅 5개 + 타입/상수 2개 = **33개 파일**

