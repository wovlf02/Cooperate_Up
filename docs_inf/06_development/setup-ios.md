# iOS 개발 환경 설정
- [ ] npm run ios 정상 실행
- [ ] npm start 정상 실행
- [ ] GoogleService-Info.plist 배치됨
- [ ] pod install 완료
- [ ] npm install 완료
- [ ] iOS Simulator 다운로드됨
- [ ] Command Line Tools 설치됨
- [ ] Xcode 15+ 설치됨
- [ ] CocoaPods 설치됨
- [ ] Watchman 설치됨
- [ ] Node.js 18+ 설치됨
- [ ] Homebrew 설치됨

## 9. 체크리스트

---

| GitLens | Git 히스토리 |
| React Native Tools | 디버깅 |
| TypeScript Importer | 자동 import |
| Prettier | 포맷팅 |
| ESLint | 린팅 |
| ES7+ React/Redux/React-Native snippets | 스니펫 |
|------|------|
| 확장 | 용도 |

## 8. 권장 VSCode 확장

---

```
source ~/.zshrc
```bash
### 7.2 설정 적용

```
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export NVM_DIR="$HOME/.nvm"
# Node 경로 (nvm 사용 시)

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export ANDROID_HOME=$HOME/Library/Android/sdk
# ~/.zshrc에 추가
```bash
### 7.1 .zshrc 설정

## 7. 환경 변수 설정

---

```
xcrun simctl boot "iPhone 15 Pro"
# 특정 시뮬레이터 부팅

xcrun simctl list devices
# Simulator 디바이스 리스트

killall Simulator
# 시뮬레이터 종료
```bash
### 6.4 시뮬레이터 부팅 실패

```
rm -rf ~/Library/Developer/Xcode/DerivedData
# DerivedData 삭제

cd ..
xcodebuild clean
cd ios
# 클린 빌드
```bash
### 6.3 빌드 오류

```
npx react-native start --reset-cache
# Metro 캐시 삭제
```bash
### 6.2 Metro 캐시 오류

```
cd ..
pod install
pod cache clean --all
pod deintegrate
cd ios
# Pod 캐시 삭제 후 재설치
```bash
### 6.1 Pod 설치 오류

## 6. 자주 발생하는 문제

---

- `Cmd + R`: 리로드
- `Cmd + D`: 디버그 메뉴 열기
### 5.3 시뮬레이터 디버그 메뉴

```
brew install --cask flipper
# 설치
```bash
### 5.2 Flipper

```
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
# 실행

brew install --cask react-native-debugger
# 설치
```bash
### 5.1 React Native Debugger

## 5. 디버깅

---

5. Run 버튼 클릭
4. Team 설정 (Signing & Capabilities)
3. 상단에서 디바이스 선택
2. Xcode에서 프로젝트 열기 (`ios/fantastic_management_app.xcworkspace`)
1. iPhone을 Mac에 USB 연결
### 4.3 실제 디바이스 실행

```
npx react-native run-ios --simulator="iPhone 15 Pro"
# 특정 시뮬레이터 지정

npx react-native run-ios
# 또는
npm run ios
# 터미널 2
```bash
### 4.2 iOS 시뮬레이터 실행

```
npx react-native start
# 또는
npm start
# 터미널 1
```bash
### 4.1 Metro Bundler 시작

## 4. 실행

---

4. Target에 체크
3. "Copy items if needed" 체크
2. `GoogleService-Info.plist`를 프로젝트에 드래그
1. Xcode에서 프로젝트 열기
#### Xcode에서 파일 추가

```
ls ios/GoogleService-Info.plist
# 파일 위치 확인
```bash

3. `ios/` 폴더에 파일 배치
2. `GoogleService-Info.plist` 다운로드
1. Firebase Console에서 iOS 앱 추가
#### GoogleService-Info.plist 배치

### 3.2 Firebase 설정

```bash
### 3.1 프로젝트 클론 및 의존성 설치

## 3. 프로젝트 설정

---

2. iOS 17.0 이상 시뮬레이터 다운로드
1. Xcode → Settings → Platforms
### 2.3 iOS Simulator

```
xcode-select --install
```bash
### 2.2 Command Line Tools

2. Xcode 실행 후 추가 컴포넌트 설치
1. App Store에서 Xcode 설치 (15.0 이상)
### 2.1 Xcode 설치

## 2. Xcode 설정

---

```
ruby --version
# 5. Ruby 버전 확인 (2.7.6 이상)

brew install cocoapods
# 또는 Homebrew로
sudo gem install cocoapods
# 4. CocoaPods 설치

brew install watchman
# 3. Watchman 설치 (파일 변경 감지)

nvm use 18
nvm install 18
brew install nvm
# 또는 nvm 사용
brew install node@18
# 2. Node.js 설치 (18 LTS)

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# 1. Homebrew 설치 (없는 경우)
```bash

### 1.2 설치 순서

- 최소 50GB 여유 공간
- 최소 8GB RAM (16GB 권장)
- macOS Ventura (13.0) 이상
### 1.1 macOS 요구사항

## 1. 필수 설치 항목


