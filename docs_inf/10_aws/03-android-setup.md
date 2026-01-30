# 3. Android 앱 설정

> Android 앱에서 AWS SDK를 설정합니다.

## 📝 단계별 가이드

### 3.1 Android 프로젝트 설정

**1. build.gradle (프로젝트 레벨)**

`android/build.gradle`:

```gradle
buildscript {
    ext {
        // ...existing code...
        minSdkVersion = 24
        targetSdkVersion = 34
        compileSdkVersion = 34
    }
    // ...existing code...
}
```

**2. build.gradle (앱 레벨)**

`android/app/build.gradle`:

```gradle
android {
    // ...existing code...
    
    defaultConfig {
        // ...existing code...
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        
        // MultiDex 활성화 (필요시)
        multiDexEnabled true
    }
    
    // ...existing code...
}

dependencies {
    // ...existing code...
    
    // MultiDex (필요시)
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

### 3.2 AndroidManifest.xml 설정

`android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- AWS Pinpoint 푸시 알림 수신 -->
        <service
            android:name="com.amazonaws.mobileconnectors.pinpoint.targeting.notification.PinpointNotificationService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
        
        <!-- 알림 채널 설정 -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="biz_one_channel" />
            
    </application>
</manifest>
```

### 3.3 MainApplication 설정

**MainApplication.kt:**

```kotlin
package com.bizone.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // 커스텀 패키지 추가
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        
        // 알림 채널 생성
        createNotificationChannel()
        
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "biz_one_channel"
            val channelName = "Biz One 알림"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, channelName, importance).apply {
                description = "Biz One 앱 알림"
                enableLights(true)
                enableVibration(true)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
}
```

### 3.4 AWS 설정 파일 복사

iOS와 동일한 설정 파일을 사용합니다:

- `src/config/aws-exports.ts`
- `src/config/amplifyconfiguration.json`

### 3.5 ProGuard 설정 (릴리즈 빌드용)

`android/app/proguard-rules.pro`에 추가:

```proguard
# AWS Amplify
-keep class com.amazonaws.** { *; }
-keep class com.amazon.** { *; }
-dontwarn com.amazonaws.**
-dontwarn com.amazon.**

# React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
```

## ✅ 체크리스트

Android 앱 설정 완료 확인:

- [ ] build.gradle 설정 완료
- [ ] AndroidManifest.xml 권한 추가
- [ ] MainApplication 설정 완료
- [ ] 알림 채널 생성됨
- [ ] ProGuard 규칙 추가됨

## 🧪 테스트

```bash
# Android 빌드 테스트
cd android
./gradlew assembleDebug

# 또는 React Native로 실행
npx react-native run-android
```

## 🎯 다음 단계

Android 앱 설정이 완료되었습니다!

**다음**: [4. Amazon Cognito (인증)](./04-cognito.md)

---

## ❓ 문제 해결

**Q: Gradle 빌드 실패**
- A: `cd android && ./gradlew clean` 실행
- A: JDK 17 버전 확인

**Q: 알림이 수신되지 않음**
- A: Android 13+ 에서는 POST_NOTIFICATIONS 권한 런타임 요청 필요
- A: 알림 채널이 생성되었는지 확인

