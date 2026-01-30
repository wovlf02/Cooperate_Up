# App Store 배포 가이드

> iOS 앱 App Store 배포 가이드

## 1. 사전 준비

### 1.1 필수 항목
- [ ] Apple Developer Program 등록 ($99/년)
- [ ] 배포용 인증서 (Distribution Certificate)
- [ ] Provisioning Profile (Distribution)
- [ ] App Store Connect 앱 등록

### 1.2 앱 정보 준비
| 항목 | 내용 |
|------|------|
| 앱 이름 | 근태매니저 |
| 부제목 | 소상공인 올인원 근태/급여 관리 |
| 번들 ID | com.bizone.app |
| 버전 | 1.0.0 |
| 빌드 번호 | 1 |
| 카테고리 | 비즈니스 |
| 연령 등급 | 4+ |

---

## 2. 인증서 및 프로비저닝

### 2.1 인증서 생성
1. Apple Developer → Certificates, IDs & Profiles
2. Certificates → + 버튼
3. "Apple Distribution" 선택
4. CSR 파일 업로드 (키체인 접근에서 생성)
5. 인증서 다운로드 및 설치

### 2.2 App ID 등록
1. Identifiers → + 버튼
2. App IDs 선택
3. Bundle ID: `com.bizone.app`
4. Capabilities 설정:
   - Push Notifications ✓
   - Associated Domains (필요시)

### 2.3 Provisioning Profile
1. Profiles → + 버튼
2. "App Store" 선택
3. App ID 선택
4. 인증서 선택
5. 프로파일 다운로드 및 설치

---

## 3. Xcode 설정

### 3.1 프로젝트 설정
```
Xcode → Target → Signing & Capabilities

Team: {Apple Developer Team}
Bundle Identifier: com.bizone.app
Signing Certificate: Apple Distribution
Provisioning Profile: {App Store Profile}
```

### 3.2 빌드 설정
```
Build Settings:

Code Signing Identity (Release): Apple Distribution
Provisioning Profile (Release): {App Store Profile}
```

### 3.3 Info.plist 권한 설명
```xml
<!-- 위치 권한 -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>출퇴근 GPS 인증을 위해 위치 정보가 필요합니다.</string>

<!-- 카메라 권한 -->
<key>NSCameraUsageDescription</key>
<string>채팅 사진 촬영을 위해 카메라 접근이 필요합니다.</string>

<!-- 사진 라이브러리 권한 -->
<key>NSPhotoLibraryUsageDescription</key>
<string>채팅 이미지 첨부를 위해 사진 접근이 필요합니다.</string>

<!-- 푸시 알림 -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

---

## 4. 빌드 및 업로드

### 4.1 Release 빌드
```bash
# 프로젝트 디렉토리에서
cd ios

# 클린 빌드
xcodebuild clean -workspace BizOne.xcworkspace -scheme BizOne

# Release 빌드
xcodebuild -workspace BizOne.xcworkspace -scheme BizOne -configuration Release -archivePath build/BizOne.xcarchive archive
```

### 4.2 IPA 추출 및 업로드
1. Xcode → Product → Archive
2. Distribute App → App Store Connect
3. Upload

또는 Transporter 앱 사용

---

## 5. App Store Connect 설정

### 5.1 앱 정보
| 항목 | 내용 |
|------|------|
| 앱 이름 | 근태매니저 |
| 부제목 | 소상공인 올인원 근태/급여 관리 |
| 프로모션 텍스트 | GPS 출퇴근, 자동 급여 계산, 전자계약서까지 한 번에! |

### 5.2 앱 설명
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

문의: support@workhours.app
```

### 5.3 스크린샷 요구사항
| 기기 | 사이즈 | 필수 |
|------|--------|------|
| iPhone 6.5" | 1284 x 2778 | ✓ |
| iPhone 5.5" | 1242 x 2208 | ✓ |
| iPad Pro 12.9" | 2048 x 2732 | (선택) |

### 5.4 키워드 (100자 이내)
```
근태관리,출퇴근,급여계산,급여명세서,전자계약서,알바관리,직원관리,소상공인,사업장관리,시급
```

### 5.5 개인정보 처리방침
- 위치 정보: 출퇴근 GPS 인증용
- 연락처 정보: 계정 생성 및 알림용
- 사용자 콘텐츠: 채팅 메시지, 첨부파일
- 개인정보 처리방침 URL 필요

---

## 6. 심사 준비

### 6.1 심사 노트
```
[테스트 계정]
- 사업주 계정: test_admin@workhours.app / Test1234!
- 직원 계정: test_employee@workhours.app / Test1234!

[테스트 방법]
1. 사업주 계정으로 로그인
2. 테스트 사업장이 이미 등록되어 있음
3. 출퇴근 테스트: 테스트 모드로 GPS 제한 해제됨
4. 급여 확인: 캘린더에서 지난 달 급여 확인 가능
5. 계약서: 샘플 계약서 생성되어 있음

[위치 권한 설명]
- 출퇴근 시 GPS 인증을 위해 위치 정보 필요
- 사업장 등록 시 위치 설정을 위해 필요
- 위치 정보는 출퇴근 기록에만 사용

[푸시 알림 설명]
- 근태 승인/거부 알림
- 새 공지사항 알림
- 근로계약서 서명 요청 알림
```

### 6.2 주의사항
- 결제 기능 없음 (무료 앱)
- 개인정보 처리방침 URL 필수
- 위치 권한 사용 이유 명시
- 테스트 계정 제공 필수

---

## 7. 심사 후 배포

### 7.1 배포 옵션
- 수동 배포: 심사 완료 후 직접 배포
- 자동 배포: 심사 완료 즉시 자동 배포

### 7.2 버전 관리
- 버전 번호: 1.0.0 → 1.0.1 → 1.1.0
- 빌드 번호: 매 업로드마다 증가

---

## 8. 체크리스트

### 출시 전 체크리스트
- [ ] Apple Developer Program 등록
- [ ] 인증서 및 프로비저닝 프로파일 생성
- [ ] App Store Connect 앱 등록
- [ ] 앱 정보 입력 (설명, 스크린샷, 키워드)
- [ ] 개인정보 처리방침 URL 등록
- [ ] 심사 테스트 계정 준비
- [ ] 위치 권한 사용 이유 작성
- [ ] Release 빌드 및 업로드
- [ ] 심사 제출
