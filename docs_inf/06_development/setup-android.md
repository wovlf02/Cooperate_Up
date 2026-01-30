# Android 개발 환경 설정 (Windows)

> ⚠️ 이 문서는 Windows 환경에서 Android 개발 시 참고용입니다.
> iOS 개발 완료 후 진행 예정

## 1. 필수 설치 항목

### 1.1 Windows 요구사항
- Windows 10 (64-bit) 이상
- 최소 8GB RAM (16GB 권장)
- 최소 50GB 여유 공간

### 1.2 설치 순서

```powershell
# 1. Chocolatey 설치 (관리자 PowerShell)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# 2. Node.js 설치
choco install nodejs-lts

# 3. JDK 17 설치
choco install openjdk17

# 4. Python 설치 (일부 네이티브 모듈 빌드용)
choco install python
```

---

## 2. Android Studio 설정

### 2.1 Android Studio 설치
1. https://developer.android.com/studio 에서 다운로드
2. 설치 시 다음 항목 체크:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

### 2.2 SDK 설정
1. Android Studio → Settings → Languages & Frameworks → Android SDK
2. SDK Platforms 탭:
   - Android 14.0 (API 34) 체크
3. SDK Tools 탭:
   - Android SDK Build-Tools 34
   - Android Emulator
   - Android SDK Platform-Tools

### 2.3 환경 변수 설정
```powershell
# 시스템 환경 변수 추가
ANDROID_HOME = C:\Users\{username}\AppData\Local\Android\Sdk

# Path에 추가
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
```

---

## 3. 프로젝트 설정

### 3.1 프로젝트 클론 및 의존성 설치
```powershell
# 프로젝트 디렉토리로 이동
cd FantasticManagementApp

# Node 의존성 설치
npm install
```

### 3.2 Firebase 설정

#### google-services.json 배치
1. Firebase Console에서 Android 앱 추가
2. `google-services.json` 다운로드
3. `android/app/` 폴더에 파일 배치

---

## 4. 실행

### 4.1 에뮬레이터 생성
1. Android Studio → Device Manager
2. Create Device → Phone → Pixel 7
3. System Image → API 34 다운로드
4. AVD 생성 완료

### 4.2 Metro Bundler 시작
```powershell
# 터미널 1
npm start
```

### 4.3 Android 에뮬레이터 실행
```powershell
# 터미널 2
npm run android
```

---

## 5. 실제 디바이스 실행

### 5.1 개발자 옵션 활성화
1. 설정 → 휴대전화 정보 → 소프트웨어 정보
2. 빌드번호 7번 탭
3. 설정 → 개발자 옵션 → USB 디버깅 활성화

### 5.2 ADB 연결 확인
```powershell
adb devices
```

### 5.3 앱 실행
```powershell
npm run android
```

---

## 6. 자주 발생하는 문제

### 6.1 JAVA_HOME 오류
```powershell
# 환경 변수 설정
JAVA_HOME = C:\Program Files\OpenJDK\jdk-17
```

### 6.2 Gradle 빌드 오류
```powershell
# android 폴더에서 클린 빌드
cd android
./gradlew clean
cd ..
```

### 6.3 Metro 연결 오류
```powershell
# ADB reverse 설정
adb reverse tcp:8081 tcp:8081
```

---

## 7. 체크리스트

- [ ] Node.js 18+ 설치됨
- [ ] JDK 17 설치됨
- [ ] Android Studio 설치됨
- [ ] Android SDK 설치됨
- [ ] 환경 변수 설정됨
- [ ] npm install 완료
- [ ] google-services.json 배치됨
- [ ] 에뮬레이터 생성됨
- [ ] npm run android 정상 실행

