// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\09-settings.md
# 설정 도메인 파일 구조 (Settings Domain)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)

## 개요

앱 설정 및 사용자 정보 관리 화면입니다.
- **설정 메인**: 프로필 카드, 메뉴 그룹별 정리
- **프로필 수정**: 이름, 연락처, 프로필 이미지 변경
- **알림 설정**: 푸시 알림 ON/OFF
- **비밀번호 변경**: 현재 비밀번호 확인 후 변경

---

## 디렉토리 구조

```
src/features/settings/
├── index.ts                            # 모듈 export (~10 lines)
│
├── screens/
│   ├── index.ts                        # 스크린 export (~6 lines)
│   │
│   ├── SettingsMainScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SettingsMainScreen.tsx      # 설정 메인 화면 (~90 lines)
│   │   └── SettingsMainScreen.styles.ts # (~55 lines)
│   │
│   ├── ProfileEditScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ProfileEditScreen.tsx       # 프로필 수정 화면 (~85 lines)
│   │   └── ProfileEditScreen.styles.ts # (~50 lines)
│   │
│   ├── NotificationSettingsScreen/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── NotificationSettingsScreen.tsx  # 알림 설정 화면 (~70 lines)
│   │   └── NotificationSettingsScreen.styles.ts # (~40 lines)
│   │
│   └── ChangePasswordScreen/
│       ├── index.ts                    # (~3 lines)
│       ├── ChangePasswordScreen.tsx    # 비밀번호 변경 화면 (~80 lines)
│       └── ChangePasswordScreen.styles.ts # (~45 lines)
│
├── components/
│   ├── index.ts                        # 컴포넌트 export (~12 lines)
│   │
│   ├── ProfileCard/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ProfileCard.tsx             # 프로필 카드 (~50 lines)
│   │   └── ProfileCard.styles.ts       # (~45 lines)
│   │
│   ├── SettingsGroup/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SettingsGroup.tsx           # 설정 그룹 (~40 lines)
│   │   └── SettingsGroup.styles.ts     # (~35 lines)
│   │
│   ├── SettingsItem/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── SettingsItem.tsx            # 설정 항목 (~45 lines)
│   │   └── SettingsItem.styles.ts      # (~40 lines)
│   │
│   ├── ProfileImagePicker/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── ProfileImagePicker.tsx      # 프로필 이미지 선택 (~55 lines)
│   │   └── ProfileImagePicker.styles.ts # (~45 lines)
│   │
│   ├── NotificationSwitch/
│   │   ├── index.ts                    # (~3 lines)
│   │   ├── NotificationSwitch.tsx      # 알림 스위치 (~40 lines)
│   │   └── NotificationSwitch.styles.ts # (~30 lines)
│   │
│   └── LogoutButton/
│       ├── index.ts                    # (~3 lines)
│       ├── LogoutButton.tsx            # 로그아웃 버튼 (~40 lines)
│       └── LogoutButton.styles.ts      # (~30 lines)
│
├── hooks/
│   ├── index.ts                        # 훅 export (~8 lines)
│   ├── useProfile.ts                   # 프로필 조회/수정 (~55 lines)
│   ├── useNotificationSettings.ts      # 알림 설정 (~45 lines)
│   ├── useChangePassword.ts            # 비밀번호 변경 (~55 lines)
│   ├── useLogout.ts                    # 로그아웃 (~40 lines)
│   ├── useProfileImage.ts              # 프로필 이미지 업로드 (~45 lines)
│   └── useFcmToken.ts                  # FCM 토큰 관리 (~40 lines)
│
├── types/
│   └── settings.types.ts               # 설정 타입 정의 (~35 lines)
│
└── constants/
    └── settings.constants.ts           # 설정 상수 (~25 lines)
```

---

## 스크린 상세

### SettingsMainScreen.tsx (~90 lines)

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@components/common';
import { ProfileCard, SettingsGroup, SettingsItem, LogoutButton } from '../components';
import { useProfile, useLogout } from '../hooks';
import { useAppSelector } from '@store/hooks';
import { selectUser } from '@store/slices/authSlice';
import { styles } from './SettingsMainScreen.styles';

const SettingsMainScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const user = useAppSelector(selectUser);
  const { profile } = useProfile();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const isAdmin = user?.role === 'admin';

  const handleProfileEdit = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleEmployeeManagement = () => {
    navigation.navigate('EmployeeList');
  };

  const handleApprovalManagement = () => {
    navigation.navigate('ApprovalList');
  };

  const handlePayrollManagement = () => {
    navigation.navigate('PayrollMain');
  };

  return (
    <View style={styles.container}>
      <Header title="설정" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileCard
          name={profile?.name ?? ''}
          email={profile?.email ?? ''}
          profileImage={profile?.profileImage}
          role={user?.role}
          onEdit={handleProfileEdit}
        />

        <SettingsGroup title="🔔 알림">
          <SettingsItem
            icon="🔔"
            label="알림 설정"
            onPress={handleNotificationSettings}
            showChevron
          />
        </SettingsGroup>

        <SettingsGroup title="👤 계정">
          <SettingsItem
            icon="🔐"
            label="비밀번호 변경"
            onPress={handleChangePassword}
            showChevron
          />
        </SettingsGroup>

        {isAdmin && (
          <SettingsGroup title="⚙️ 관리자 설정">
            <SettingsItem
              icon="👥"
              label="근무자 관리"
              onPress={handleEmployeeManagement}
              showChevron
            />
            <SettingsItem
              icon="✅"
              label="승인 요청 관리"
              onPress={handleApprovalManagement}
              showChevron
              badge={3}
            />
            <SettingsItem
              icon="💰"
              label="급여 관리"
              onPress={handlePayrollManagement}
              showChevron
            />
          </SettingsGroup>
        )}

        <SettingsGroup title="ℹ️ 앱 정보">
          <SettingsItem icon="📄" label="이용약관" onPress={() => {}} showChevron />
          <SettingsItem icon="🔒" label="개인정보처리방침" onPress={() => {}} showChevron />
          <SettingsItem icon="📱" label="앱 버전" rightText="v1.0.0" />
        </SettingsGroup>

        <LogoutButton onPress={logout} isLoading={isLoggingOut} />
      </ScrollView>
    </View>
  );
};

export default SettingsMainScreen;
```

### ProfileEditScreen.tsx (~85 lines)

```typescript
import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Header, TextInput, FixedBottomButton } from '@components/common';
import { ProfileImagePicker } from '../components';
import { useProfile } from '../hooks';
import { styles } from './ProfileEditScreen.styles';

const ProfileEditScreen = (): JSX.Element => {
  const { profile, updateProfile, isLoading, error } = useProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? '');
      setProfileImage(profile.profileImage);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const changed = 
        name !== profile.name ||
        phone !== (profile.phone ?? '') ||
        profileImage !== profile.profileImage;
      setHasChanges(changed);
    }
  }, [name, phone, profileImage, profile]);

  const handleSave = async () => {
    await updateProfile({
      name,
      phone,
      profileImage,
    });
  };

  const handleImageChange = (uri: string) => {
    setProfileImage(uri);
  };

  return (
    <View style={styles.container}>
      <Header title="프로필 수정" />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileImagePicker
            currentImage={profileImage}
            onImageChange={handleImageChange}
          />

          <TextInput
            label="이름"
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력하세요"
          />

          <TextInput
            label="연락처"
            value={phone}
            onChangeText={setPhone}
            placeholder="010-0000-0000"
            keyboardType="phone-pad"
          />

          <TextInput
            label="이메일"
            value={profile?.email ?? ''}
            editable={false}
            style={styles.disabledInput}
          />
        </ScrollView>

        <FixedBottomButton
          title="저장"
          onPress={handleSave}
          disabled={!hasChanges}
          loading={isLoading}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfileEditScreen;
```

---

## 컴포넌트 상세

### ProfileCard.tsx (~50 lines)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProfileImage, RoleBadge } from '@components/shared';
import { SecondaryButton } from '@components/common';
import { UserRole } from '@types/user.types';
import { styles } from './ProfileCard.styles';

interface ProfileCardProps {
  name: string;
  email: string;
  profileImage?: string;
  role?: UserRole;
  onEdit: () => void;
}

const ProfileCard = ({
  name,
  email,
  profileImage,
  role,
  onEdit,
}: ProfileCardProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <ProfileImage uri={profileImage} size={72} />
        
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          {role && (
            <RoleBadge role={role} style={styles.roleBadge} />
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <SecondaryButton
        title="프로필 수정"
        onPress={onEdit}
        style={styles.editButton}
      />
    </View>
  );
};

export default ProfileCard;
```

### SettingsItem.tsx (~45 lines)

```typescript
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Badge } from '@components/common';
import { styles } from './SettingsItem.styles';

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightText?: string;
  badge?: number;
}

const SettingsItem = ({
  icon,
  label,
  onPress,
  showChevron = false,
  rightText,
  badge,
}: SettingsItemProps): JSX.Element => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.rightContent}>
        {badge !== undefined && badge > 0 && (
          <Badge count={badge} variant="error" style={styles.badge} />
        )}
        {rightText && (
          <Text style={styles.rightText}>{rightText}</Text>
        )}
        {showChevron && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </Container>
  );
};

export default SettingsItem;
```

---

## 훅 상세

### useProfile.ts (~50 lines)

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { selectUser, setUser } from '@store/slices/authSlice';
import { profileService } from '@services/profile/profileService';
import { Profile, UpdateProfileData } from '../types/settings.types';

interface UseProfileReturn {
  profile: Profile | null;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useProfile = (): UseProfileReturn => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    }
  }, [user]);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      dispatch(setUser({ ...user!, ...updatedProfile }));
      return true;
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  return {
    profile,
    updateProfile,
    isLoading,
    error,
  };
};
```

---

## 타입 정의

### settings.types.ts (~35 lines)

```typescript
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  announcementEnabled: boolean;
  chatEnabled: boolean;
  attendanceEnabled: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsMenuItem {
  id: string;
  icon: string;
  label: string;
  route?: string;
  badge?: number;
  rightText?: string;
}
```

---

## 파일별 라인 수 요약

| 파일 | 라인 | 설명 |
|------|------|------|
| **Screens** | | |
| SettingsMainScreen.tsx | 90 | 설정 메인 |
| ProfileEditScreen.tsx | 85 | 프로필 수정 |
| NotificationSettingsScreen.tsx | 70 | 알림 설정 |
| ChangePasswordScreen.tsx | 80 | 비밀번호 변경 |
| **Components** | | |
| ProfileCard.tsx | 50 | 프로필 카드 |
| SettingsGroup.tsx | 40 | 설정 그룹 |
| SettingsItem.tsx | 45 | 설정 항목 |
| ProfileImagePicker.tsx | 55 | 이미지 선택 |
| NotificationSwitch.tsx | 40 | 알림 스위치 |
| LogoutButton.tsx | 40 | 로그아웃 버튼 |
| **Hooks** | | |
| useProfile.ts | 50 | 프로필 관리 |
| useNotificationSettings.ts | 45 | 알림 설정 |
| useChangePassword.ts | 50 | 비밀번호 변경 |
| useLogout.ts | 35 | 로그아웃 |

**총 파일 수**: 스크린 8개 + 컴포넌트 12개 + 훅 4개 + 타입/상수 2개 = **26개 파일**

