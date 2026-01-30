# Play Store 배포 가이드

> Android 앱 Google Play Store 배포 가이드 (Windows 환경)

## 1. 사전 준비

### 1.1 필수 항목
- [ ] Google Play Console 계정 등록 ($25 일회성)
- [ ] 서명 키 (Keystore) 생성
- [ ] 앱 등록

### 1.2 앱 정보 준비
| 항목 | 내용 |
|------|------|
| 앱 이름 | 근태매니저 |
| 패키지 이름 | com.bizone.app |
| 버전 | 1.0.0 |
| 버전 코드 | 1 |
| 카테고리 | 비즈니스 |
| 콘텐츠 등급 | 전체 이용가 |

---

## 2. 서명 키 생성

### 2.1 Keystore 생성 (Windows PowerShell)
```powershell
# JDK bin 디렉토리에서 실행 또는 환경변수 설정 후
keytool -genkeypair -v -storetype PKCS12 -keystore workhours-release-key.keystore -alias workhours-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2.2 key.properties 설정
```properties
# android/key.properties (이 파일은 .gitignore에 추가)
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=workhours-key-alias
storeFile=../workhours-release-key.keystore
```

### 2.3 build.gradle 설정
```gradle
// android/app/build.gradle

def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 3. 빌드

### 3.1 Release APK 빌드 (Windows)
```powershell
cd android
.\gradlew assembleRelease
```

### 3.2 Release AAB 빌드 (권장)
```powershell
cd android
.\gradlew bundleRelease
```

### 3.3 빌드 파일 위치
```
APK: android/app/build/outputs/apk/release/app-release.apk
AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### 3.4 빌드 에러 해결
```powershell
# 캐시 클리어
cd android
.\gradlew clean
.\gradlew bundleRelease

# Gradle 데몬 종료
.\gradlew --stop
```

---

## 4. Play Console 설정

### 4.1 앱 생성
1. Google Play Console 로그인 (https://play.google.com/console)
2. "앱 만들기" 클릭
3. 앱 정보 입력
   - 앱 이름: 근태매니저
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료

### 4.2 스토어 등록 정보
| 항목 | 내용 |
|------|------|
| 앱 이름 | 근태매니저 |
| 간단한 설명 | 소상공인을 위한 올인원 근태관리, 급여계산, 전자계약서 앱 |
| 앱 아이콘 | 512 x 512 PNG |
| 그래픽 이미지 | 1024 x 500 PNG |

### 4.3 자세한 설명
```
📌 소상공인을 위한 올인원 근태/급여 관리 앱

근태매니저는 소규모 사업장의 인력 관리를 위한 종합 솔루션입니다.
직원 출퇴근부터 급여 계산, 근로계약서까지 모든 관리를 하나의 앱에서!

🎯 주요 기능

▶ GPS 기반 출퇴근
- 사업장 위치에서만 출퇴근 가능
- 위치 조작 방지로 정확한 근태 관리
- 수동 입력 시 승인 프로세스

▶ 업무 체크리스트
- 사업장별 맞춤 체크리스트 생성
- 실시간 업무 현황 모니터링
- 체크리스트 완료 기록 자동 저장

▶ 자동 급여 계산
- 근무 시간 기반 급여 자동 계산
- 직원별 시급 개별 설정
- 최저시급 미만 경고

▶ 급여 명세서
- 월별 급여 명세서 자동 생성
- PDF 다운로드 및 공유
- 엑셀 추출 지원

▶ 전자근로계약서
- 앱 내 계약서 작성
- 전자서명으로 간편 계약
- 계약서 이력 관리

▶ 근무 캘린더
- 월별 근태/급여 한눈에 확인
- 일별 상세 정보 조회
- 근무 기록 엑셀 추출

▶ 채팅 & 공지
- 사업장 단위 실시간 채팅
- 공지사항 등록 및 푸시 알림

👤 이런 분들께 추천합니다
- 직원 근태 관리가 필요한 소상공인
- 급여 계산을 자동화하고 싶은 사업주
- 근로계약서를 간편하게 관리하고 싶은 분
- 업무 체크리스트로 매장을 효율적으로 운영하고 싶은 분

📧 문의: support@workhours.app
```

### 4.4 스크린샷 요구사항
| 기기 유형 | 최소 개수 | 권장 사이즈 |
|----------|----------|------------|
| 스마트폰 | 2개 이상 | 1080 x 1920 |
| 7인치 태블릿 | (선택) | 1200 x 1920 |
| 10인치 태블릿 | (선택) | 1600 x 2560 |

---

## 5. 앱 콘텐츠

### 5.1 개인정보 처리방침
- 개인정보 처리방침 URL 필수 등록
- 수집 데이터: 이메일, 연락처, 위치 정보
- 사용 목적 명시

### 5.2 데이터 보안 섹션
| 항목 | 내용 |
|------|------|
| 데이터 수집 | 이메일, 이름, 연락처 |
| 위치 정보 | 출퇴근 GPS 인증용 |
| 데이터 공유 | 제3자 공유 없음 |
| 데이터 암호화 | 전송 중 암호화 |

### 5.3 광고
- 광고 없음으로 선택

### 5.4 콘텐츠 등급
- IARC 등급 설문 작성
- 예상 등급: 전체 이용가

---

## 6. 앱 릴리스

### 6.1 내부 테스트 (권장)
1. 내부 테스트 트랙 선택
2. 테스터 이메일 등록
3. AAB 파일 업로드
4. 테스터에게 링크 공유

### 6.2 비공개 테스트
1. 비공개 테스트 트랙 선택
2. 테스터 그룹 생성
3. AAB 파일 업로드

### 6.3 프로덕션 출시
1. 프로덕션 트랙 선택
2. AAB 파일 업로드
3. 출시 노트 작성
4. 심사 제출

### 6.4 출시 노트 예시
```
버전 1.0.0 - 첫 출시

• GPS 기반 출퇴근 체크 기능
• 사업장별 업무 체크리스트
• 자동 급여 계산 및 명세서 PDF 출력
• 전자근로계약서 작성 및 서명
• 근무 캘린더 및 엑셀 추출
• 사업장 단위 채팅 및 공지사항
```

---

## 7. 권한 설명

### 7.1 AndroidManifest.xml 권한
```xml
<!-- 위치 권한 -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- 카메라 권한 -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- 저장소 권한 (PDF/Excel 저장) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- 인터넷 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 푸시 알림 -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 7.2 권한 사용 이유 (Play Console 입력용)
| 권한 | 사용 이유 |
|------|---------|
| 위치 | 사업장 반경 내 출퇴근 GPS 인증 |
| 카메라 | 채팅 이미지 촬영 |
| 저장소 | PDF 급여명세서, 엑셀 파일 저장 |

---

## 8. 체크리스트

### 출시 전 체크리스트
- [ ] Google Play Console 계정 등록
- [ ] 서명 키 생성 (안전하게 백업!)
- [ ] key.properties 설정
- [ ] Release AAB 빌드 성공
- [ ] 앱 아이콘 (512x512) 준비
- [ ] 그래픽 이미지 (1024x500) 준비
- [ ] 스크린샷 최소 2장 준비
- [ ] 앱 설명 작성
- [ ] 개인정보 처리방침 URL 준비
- [ ] 데이터 보안 섹션 작성
- [ ] 콘텐츠 등급 설문 완료
- [ ] 내부 테스트 진행
- [ ] 프로덕션 출시

### 서명 키 백업 필수!
```
⚠️ 중요: workhours-release-key.keystore 파일은 반드시 백업하세요!
키를 분실하면 앱 업데이트가 불가능합니다.

백업 위치 권장:
1. 클라우드 스토리지 (암호화)
2. 외장 드라이브
3. 별도 안전한 장소
```

---

## 9. 업데이트 배포

### 9.1 버전 관리
```gradle
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 2              // 매 업데이트마다 증가
        versionName "1.0.1"        // 사용자에게 표시되는 버전
    }
}
```

### 9.2 업데이트 절차
1. versionCode, versionName 증가
2. AAB 빌드
3. Play Console에 업로드
4. 출시 노트 작성
5. 심사 제출 (보통 몇 시간 ~ 며칠)

---

## 10. 문제 해결

### 10.1 빌드 실패
```powershell
# 클린 빌드
cd android
.\gradlew clean

# 캐시 삭제
Remove-Item -Recurse -Force .gradle
Remove-Item -Recurse -Force app\build

# 재빌드
.\gradlew bundleRelease
```

### 10.2 서명 관련 오류
- key.properties 파일 경로 확인
- keystore 파일 위치 확인
- 비밀번호 확인

### 10.3 심사 거절 대응
- 거절 사유 확인
- 수정 후 재제출
- 필요시 이의 신청
