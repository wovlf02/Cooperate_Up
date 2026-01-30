# 모바일 앱 보안 (Mobile Security)

## 1. 클라이언트 보안 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React Native App Security                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                         보안 계층                                    │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  Storage        │  │  Network        │  │  Runtime        │    │ │
│  │  │  Security       │  │  Security       │  │  Security       │    │ │
│  │  │                 │  │                 │  │                 │    │ │
│  │  │ - Keychain      │  │ - SSL Pinning   │  │ - Root Detection│    │ │
│  │  │ - Encrypted     │  │ - Cert Pinning  │  │ - Debug Check   │    │ │
│  │  │   Storage       │  │ - HTTPS Only    │  │ - Emulator Check│    │ │
│  │  │ - Secure Keys   │  │                 │  │ - Tampering     │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │  Code           │  │  Data           │  │  Screen         │    │ │
│  │  │  Protection     │  │  Protection     │  │  Protection     │    │ │
│  │  │                 │  │                 │  │                 │    │ │
│  │  │ - Obfuscation   │  │ - Input Mask    │  │ - Screenshot    │    │ │
│  │  │ - Hermes        │  │ - Clipboard     │  │   Prevention    │    │ │
│  │  │                 │  │   Security      │  │ - Screen Record │    │ │
│  │  │                 │  │                 │  │   Block         │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 안전한 저장소

### 2.1 Keychain / Keystore 사용

```javascript
// services/secureStorage.js
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

/**
 * 안전한 저장소 서비스
 * iOS: Keychain
 * Android: Keystore (EncryptedSharedPreferences)
 */
export const SecureStorage = {
  /**
   * 민감 데이터 저장
   */
  async setItem(key, value) {
    try {
      await Keychain.setGenericPassword(
        key,
        value,
        {
          service: `com.bizone.app.${key}`,
          // iOS: Keychain 접근 제한
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          // Android: 생체인증 필요 (선택적)
          // accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          // 보안 레벨
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        }
      );
      return true;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  },

  /**
   * 민감 데이터 조회
   */
  async getItem(key) {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `com.bizone.app.${key}`,
      });
      
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },

  /**
   * 민감 데이터 삭제
   */
  async removeItem(key) {
    try {
      await Keychain.resetGenericPassword({
        service: `com.bizone.app.${key}`,
      });
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      return false;
    }
  },

  /**
   * 모든 저장 데이터 삭제 (로그아웃 시)
   */
  async clear() {
    const keys = ['access_token', 'refresh_token', 'user_data'];
    await Promise.all(keys.map(key => this.removeItem(key)));
  },
};
```

### 2.2 일반 데이터 암호화 저장

```javascript
// services/encryptedStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { SecureStorage } from './secureStorage';

const ENCRYPTION_KEY_NAME = 'encryption_key';

/**
 * 암호화된 AsyncStorage
 * 덜 민감한 데이터용 (Keychain보다 용량 큼)
 */
export const EncryptedStorage = {
  encryptionKey: null,

  /**
   * 암호화 키 초기화
   */
  async init() {
    // Keychain에서 암호화 키 조회
    let key = await SecureStorage.getItem(ENCRYPTION_KEY_NAME);
    
    // 없으면 새로 생성
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      await SecureStorage.setItem(ENCRYPTION_KEY_NAME, key);
    }
    
    this.encryptionKey = key;
  },

  /**
   * 암호화 저장
   */
  async setItem(key, value) {
    if (!this.encryptionKey) await this.init();
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = CryptoJS.AES.encrypt(stringValue, this.encryptionKey).toString();
    
    await AsyncStorage.setItem(key, encrypted);
  },

  /**
   * 복호화 조회
   */
  async getItem(key) {
    if (!this.encryptionKey) await this.init();
    
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  },

  /**
   * 삭제
   */
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
};
```

---

## 3. 네트워크 보안

### 3.1 SSL Pinning

```javascript
// services/api/sslPinning.js
import { Platform } from 'react-native';

/**
 * SSL Certificate Pinning 설정
 */
export const SSL_PINNING_CONFIG = {
  // 서버 인증서의 SHA-256 해시
  // openssl s_client -connect api.bizone.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
  'api.bizone.com': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Primary
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup
  ],
  'socket.bizone.com': [
    'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
    'sha256/DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD=',
  ],
};

// iOS: Info.plist에 추가 설정 필요
// Android: network_security_config.xml 설정 필요
```

**Android: network_security_config.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.bizone.com</domain>
        <domain includeSubdomains="true">socket.bizone.com</domain>
        <pin-set expiration="2025-12-31">
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

**iOS: Info.plist**
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSPinnedDomains</key>
    <dict>
        <key>api.bizone.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSPinnedCAIdentities</key>
            <array>
                <dict>
                    <key>SPKI-SHA256-BASE64</key>
                    <string>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</string>
                </dict>
            </array>
        </dict>
    </dict>
</dict>
```

### 3.2 API 클라이언트 보안 설정

```javascript
// services/api/secureAxios.js
import axios from 'axios';
import { SecureStorage } from '../secureStorage';

const secureApi = axios.create({
  baseURL: 'https://api.bizone.com/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
secureApi.interceptors.request.use(
  async (config) => {
    // 토큰 첨부
    const accessToken = await SecureStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // 요청 ID 추가 (로깅/추적용)
    config.headers['X-Request-ID'] = generateUUID();
    
    // 앱 버전 추가
    config.headers['X-App-Version'] = APP_VERSION;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
secureApi.interceptors.response.use(
  (response) => {
    // 민감 정보 로깅 방지
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        // data는 로깅하지 않음
      });
    }
    return response;
  },
  async (error) => {
    // 401: 토큰 만료 시 갱신 시도
    if (error.response?.status === 401) {
      // ... 토큰 갱신 로직
    }
    
    // 에러 로깅 (민감 정보 제외)
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      code: error.response?.data?.code,
    });
    
    return Promise.reject(error);
  }
);

export default secureApi;
```

---

## 4. 런타임 보안

### 4.1 Root/Jailbreak 탐지

```javascript
// services/security/integrityCheck.js
import JailMonkey from 'jail-monkey';
import { Platform, Alert } from 'react-native';

/**
 * 디바이스 무결성 검사
 */
export const IntegrityCheck = {
  /**
   * 전체 보안 검사 실행
   */
  async runAllChecks() {
    const results = {
      isRooted: false,
      isDebugMode: false,
      isEmulator: false,
      hookDetected: false,
    };

    try {
      // Root/Jailbreak 탐지
      results.isRooted = JailMonkey.isJailBroken();
      
      // 디버그 모드 탐지
      results.isDebugMode = JailMonkey.isDebuggedMode();
      
      // 에뮬레이터 탐지
      results.isEmulator = await JailMonkey.isOnExternalStorage();
      
      // Frida 등 훅 탐지
      results.hookDetected = this.checkForHooks();
      
    } catch (error) {
      console.error('Integrity check error:', error);
    }

    return results;
  },

  /**
   * 훅/인젝션 탐지
   */
  checkForHooks() {
    if (Platform.OS === 'android') {
      // Frida, Xposed 등 탐지
      try {
        // 특정 라이브러리 로드 확인
        // Native 모듈 필요
        return false;
      } catch {
        return false;
      }
    }
    return false;
  },

  /**
   * 보안 위협 발견 시 처리
   */
  handleSecurityThreat(results) {
    if (results.isRooted) {
      Alert.alert(
        '보안 경고',
        '루팅/탈옥된 기기에서는 앱을 사용할 수 없습니다.',
        [{ text: '확인', onPress: () => BackHandler.exitApp() }],
        { cancelable: false }
      );
      return true;
    }

    if (results.isDebugMode && !__DEV__) {
      // 프로덕션에서 디버그 모드 탐지
      Alert.alert(
        '보안 경고',
        '비정상적인 실행 환경이 감지되었습니다.',
        [{ text: '확인', onPress: () => BackHandler.exitApp() }],
        { cancelable: false }
      );
      return true;
    }

    return false;
  },
};
```

### 4.2 앱 시작 시 보안 검사

```javascript
// App.js
import { useEffect, useState } from 'react';
import { IntegrityCheck } from './services/security/integrityCheck';

function App() {
  const [securityChecked, setSecurityChecked] = useState(false);
  const [securityPassed, setSecurityPassed] = useState(false);

  useEffect(() => {
    async function checkSecurity() {
      const results = await IntegrityCheck.runAllChecks();
      const threatDetected = IntegrityCheck.handleSecurityThreat(results);
      
      setSecurityPassed(!threatDetected);
      setSecurityChecked(true);
      
      // 서버에 보안 상태 보고 (선택적)
      if (!threatDetected) {
        await reportSecurityStatus(results);
      }
    }
    
    // 프로덕션에서만 실행
    if (!__DEV__) {
      checkSecurity();
    } else {
      setSecurityChecked(true);
      setSecurityPassed(true);
    }
  }, []);

  if (!securityChecked) {
    return <SplashScreen />;
  }

  if (!securityPassed) {
    return <SecurityBlockedScreen />;
  }

  return <MainApp />;
}
```

---

## 5. 화면 보안

### 5.1 스크린샷 방지

```javascript
// services/security/screenProtection.js
import { Platform, NativeModules } from 'react-native';
import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

const { ScreenProtection } = NativeModules;

/**
 * 민감한 화면에서 스크린샷/녹화 방지
 */
export function useScreenProtection(enabled = true) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (enabled && isFocused) {
      enableProtection();
    } else {
      disableProtection();
    }

    return () => {
      disableProtection();
    };
  }, [enabled, isFocused]);
}

function enableProtection() {
  if (Platform.OS === 'android') {
    // Android: FLAG_SECURE 설정
    ScreenProtection?.enableSecureScreen();
  } else if (Platform.OS === 'ios') {
    // iOS: 캡처 감지 (완전 방지는 어려움)
    ScreenProtection?.enableProtection();
  }
}

function disableProtection() {
  if (Platform.OS === 'android') {
    ScreenProtection?.disableSecureScreen();
  } else if (Platform.OS === 'ios') {
    ScreenProtection?.disableProtection();
  }
}

// 사용 예시
function ContractSignScreen() {
  // 계약서 서명 화면에서 스크린샷 방지
  useScreenProtection(true);
  
  return (
    <View>
      {/* 전자서명 UI */}
    </View>
  );
}
```

**Android Native Module:**
```java
// android/app/src/main/java/com/bizone/ScreenProtectionModule.java
package com.bizone;

import android.view.WindowManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenProtectionModule extends ReactContextBaseJavaModule {
    
    public ScreenProtectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ScreenProtection";
    }

    @ReactMethod
    public void enableSecureScreen() {
        getCurrentActivity().runOnUiThread(() -> {
            getCurrentActivity().getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SECURE
            );
        });
    }

    @ReactMethod
    public void disableSecureScreen() {
        getCurrentActivity().runOnUiThread(() -> {
            getCurrentActivity().getWindow().clearFlags(
                WindowManager.LayoutParams.FLAG_SECURE
            );
        });
    }
}
```

### 5.2 백그라운드 블러 처리

```javascript
// services/security/backgroundBlur.js
import { AppState, Platform } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * 앱이 백그라운드로 갈 때 화면 블러 처리
 * 앱 스위처에서 민감 정보 숨김
 */
export function useBackgroundBlur() {
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsBackground(true);
      } else {
        setIsBackground(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return isBackground;
}

// 사용 예시
function SecureScreen() {
  const isBackground = useBackgroundBlur();

  return (
    <View style={styles.container}>
      {isBackground ? (
        <BlurOverlay />
      ) : (
        <SensitiveContent />
      )}
    </View>
  );
}
```

---

## 6. 입력 보안

### 6.1 민감 입력 보호

```javascript
// components/SecureTextInput.js
import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * 보안 텍스트 입력 컴포넌트
 * - 자동완성 비활성화
 * - 클립보드 복사 방지
 * - 키보드 학습 비활성화
 */
export function SecureTextInput({ 
  value, 
  onChangeText, 
  placeholder,
  isPassword = false,
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={isPassword && !showPassword}
        
        // 자동완성 비활성화
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        
        // 키보드 학습 비활성화 (iOS)
        spellCheck={false}
        textContentType="none"
        
        // 클립보드 비활성화
        contextMenuHidden={true}
        selectTextOnFocus={false}
        
        // Android: 키보드 캐싱 비활성화
        keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
        
        {...props}
      />
      
      {isPassword && (
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Icon 
            name={showPassword ? 'visibility' : 'visibility-off'} 
            size={24} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 6.2 클립보드 보안

```javascript
// services/security/clipboardSecurity.js
import Clipboard from '@react-native-clipboard/clipboard';

/**
 * 클립보드 보안 유틸리티
 */
export const ClipboardSecurity = {
  /**
   * 민감 데이터 복사 후 자동 삭제
   */
  async copyWithAutoDelete(text, deleteAfterMs = 60000) {
    Clipboard.setString(text);
    
    // 1분 후 클립보드 자동 삭제
    setTimeout(() => {
      Clipboard.setString('');
    }, deleteAfterMs);
  },

  /**
   * 클립보드 즉시 삭제
   */
  clear() {
    Clipboard.setString('');
  },

  /**
   * 앱 종료/백그라운드 시 클립보드 삭제
   */
  clearOnBackground() {
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        Clipboard.setString('');
      }
    });
  },
};
```

---

## 7. 코드 보호

### 7.1 Hermes 엔진 사용 (React Native)

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // Hermes 엔진 활성화 (바이트코드 컴파일)
]

// 난독화 설정
def enableProguardInReleaseBuilds = true
```

### 7.2 ProGuard 설정 (Android)

```proguard
# proguard-rules.pro

# React Native
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# 앱 코드 난독화
-keepclassmembers class com.bizone.** {
    public <methods>;
}

# 리플렉션 사용 클래스 유지
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses

# 보안 관련 클래스
-keep class com.bizone.security.** { *; }
```

---

## 8. 보안 체크리스트

### 8.1 모바일 앱 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| 토큰 안전 저장 | ✅ | Keychain / Keystore |
| 일반 데이터 암호화 | ✅ | AES 암호화 AsyncStorage |
| SSL Pinning | ✅ | 인증서 고정 |
| Root/Jailbreak 탐지 | ✅ | JailMonkey 사용 |
| 디버그 모드 탐지 | ✅ | 프로덕션에서 차단 |
| 에뮬레이터 탐지 | ⚠️ | 선택적 차단 |
| 스크린샷 방지 | ✅ | 민감 화면 적용 |
| 백그라운드 블러 | ✅ | 앱 스위처 보호 |
| 입력 필드 보안 | ✅ | 자동완성/클립보드 비활성화 |
| 코드 난독화 | ✅ | Hermes + ProGuard |
| API 통신 암호화 | ✅ | HTTPS Only |
| 로그 보안 | ✅ | 프로덕션 로그 제거 |

