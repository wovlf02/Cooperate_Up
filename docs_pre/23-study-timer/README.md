# ⏱️ Face API 기반 공부 타이머 시스템

## 개요

face-api.js를 활용하여 사용자가 **실제로 집중하고 있는지** 체크하고,
집중 시간만 측정하는 공부 타이머 시스템입니다.

---

## 핵심 목표

> **"사용자가 화면 앞에서 제대로 집중하고 있는가?"**

집중 여부 판단 기준:
1. 얼굴이 화면에 있는가? (자리 이탈 감지)
2. 눈을 뜨고 있는가? (졸음 감지)
3. 화면을 보고 있는가? (딴짓 감지)

---

## 집중 판단 로직

### 집중 상태 정의

| 상태 | 조건 | 타이머 |
|------|------|--------|
| ✅ **집중** | 얼굴 감지 + 눈 뜸 + 정면 응시 | 작동 |
| ⚠️ **경고** | 얼굴 감지 + (눈 감김 OR 딴 곳 응시) | 5초 유예 후 정지 |
| ❌ **이탈** | 얼굴 미감지 | 즉시 정지 |
| 😴 **졸음** | 눈 감김 3초 이상 지속 | 정지 + 알림 |

### 감지 항목

| 항목 | 감지 방법 | face-api.js 지원 |
|------|----------|------------------|
| 얼굴 존재 | `detectAllFaces()` | ✅ 직접 지원 |
| 눈 감김 | EAR(Eye Aspect Ratio) 계산 | ✅ 랜드마크로 계산 |
| 정면 응시 | 얼굴 위치 + 코 위치 분석 | ✅ 랜드마크로 계산 |
| 졸음 | 눈 감김 지속 시간 | ✅ EAR + 시간 체크 |
| 하품 | 입 벌림 비율 | ✅ 랜드마크로 계산 |

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 집중 시간 측정 | 집중 상태일 때만 타이머 작동 |
| 실시간 상태 표시 | 집중/경고/이탈/졸음 상태 표시 |
| 졸음 알림 | 졸음 감지 시 알림음 + 진동 |
| 휴식 알림 | 50분 집중 후 10분 휴식 권장 |
| 통계 대시보드 | 일별/주별/월별 집중 시간 |
| 랭킹 | 스터디/친구 내 집중 시간 순위 |
| 목표 설정 | 일일 목표 시간 설정 및 달성률 |

---

## 기술 스택

### 사용 라이브러리

```bash
npm install face-api.js
```

> ⚠️ face-api.js는 내부적으로 TensorFlow.js를 사용합니다. 별도 설치 불필요.

### 사전 학습 모델 (학습 불필요!)

face-api.js는 **사전 학습된 모델**을 제공합니다.

| 모델 | 용도 | 파일 크기 |
|------|------|----------|
| `tinyFaceDetector` | 빠른 얼굴 감지 | ~190KB |
| `faceLandmark68Net` | 68개 얼굴 특징점 | ~350KB |

> 표정 인식(`faceExpressionNet`)은 집중 체크에 불필요하므로 제외

---

## 모델 설정

### 1. 모델 파일 다운로드

```bash
# public/models 폴더 생성
mkdir -p public/models

# 모델 다운로드 (Windows PowerShell)
cd public/models

# tiny_face_detector 모델
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json" -OutFile "tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1" -OutFile "tiny_face_detector_model-shard1"

# face_landmark_68 모델
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json" -OutFile "face_landmark_68_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1" -OutFile "face_landmark_68_model-shard1"
```

### 2. 프로젝트 구조

```
public/
└── models/
    ├── tiny_face_detector_model-weights_manifest.json
    ├── tiny_face_detector_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    └── face_landmark_68_model-shard1
```

---

## 핵심 구현 코드

### 1. 모델 로드

```javascript
// src/lib/faceDetection.js
import * as faceapi from 'face-api.js'

let isModelLoaded = false

export async function loadFaceModels() {
  if (isModelLoaded) return true
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    ])
    isModelLoaded = true
    return true
  } catch (error) {
    console.error('모델 로드 실패:', error)
    return false
  }
}
```

### 2. 집중 상태 감지

```javascript
// src/lib/focusDetection.js
import * as faceapi from 'face-api.js'

// 설정값
const CONFIG = {
  EAR_THRESHOLD: 0.2,        // 눈 감김 판단 임계값
  DROWSY_DURATION: 3000,     // 졸음 판단 시간 (3초)
  WARNING_DURATION: 5000,    // 경고 후 정지까지 시간 (5초)
  FACE_CENTER_TOLERANCE: 0.3, // 정면 응시 허용 범위 (30%)
  DETECTION_INTERVAL: 500,   // 감지 간격 (0.5초)
}

// 상태 타입
export const FocusState = {
  FOCUSED: 'FOCUSED',       // 집중 중
  WARNING: 'WARNING',       // 경고 (곧 이탈)
  AWAY: 'AWAY',             // 자리 이탈
  DROWSY: 'DROWSY',         // 졸음
}

/**
 * 두 점 사이 거리 계산
 */
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

/**
 * EAR (Eye Aspect Ratio) 계산
 * 눈이 감기면 값이 낮아짐
 */
function calculateEAR(eye) {
  // eye: 6개의 점 [p0, p1, p2, p3, p4, p5]
  //       p1  p2
  //    p0        p3
  //       p5  p4
  const vertical1 = distance(eye[1], eye[5])
  const vertical2 = distance(eye[2], eye[4])
  const horizontal = distance(eye[0], eye[3])
  
  return (vertical1 + vertical2) / (2 * horizontal)
}

/**
 * 양쪽 눈 EAR 평균
 */
function getAverageEAR(landmarks) {
  const leftEye = landmarks.getLeftEye()
  const rightEye = landmarks.getRightEye()
  
  const leftEAR = calculateEAR(leftEye)
  const rightEAR = calculateEAR(rightEye)
  
  return (leftEAR + rightEAR) / 2
}

/**
 * 정면 응시 여부 판단
 * 코의 위치가 얼굴 중앙에 있는지 확인
 */
function isFacingForward(detection, videoWidth) {
  const { box } = detection.detection
  const nose = detection.landmarks.getNose()
  const noseTip = nose[3] // 코끝
  
  // 얼굴 박스 중앙
  const faceCenterX = box.x + box.width / 2
  
  // 코끝이 얼굴 중앙 근처에 있는지
  const deviation = Math.abs(noseTip.x - faceCenterX) / box.width
  
  return deviation < CONFIG.FACE_CENTER_TOLERANCE
}

/**
 * 입 벌림 비율 (하품 감지용)
 */
function getMouthOpenRatio(landmarks) {
  const mouth = landmarks.getMouth()
  // 입술 상하 거리 / 좌우 거리
  const vertical = distance(mouth[14], mouth[18])
  const horizontal = distance(mouth[0], mouth[6])
  return vertical / horizontal
}

/**
 * 메인 집중 상태 분석 클래스
 */
export class FocusAnalyzer {
  constructor() {
    this.eyeClosedStartTime = null
    this.warningStartTime = null
    this.lastState = FocusState.AWAY
  }
  
  /**
   * 단일 프레임 분석
   * @param {HTMLVideoElement} video 
   * @returns {Promise<{state: string, details: object}>}
   */
  async analyze(video) {
    // 얼굴 감지
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
    
    // 1. 얼굴 미감지 → 이탈
    if (!detection) {
      this.reset()
      return {
        state: FocusState.AWAY,
        details: { reason: '얼굴이 감지되지 않습니다' }
      }
    }
    
    const landmarks = detection.landmarks
    const ear = getAverageEAR(landmarks)
    const isEyeOpen = ear > CONFIG.EAR_THRESHOLD
    const isFacing = isFacingForward(detection, video.videoWidth)
    const mouthRatio = getMouthOpenRatio(landmarks)
    const isYawning = mouthRatio > 0.6
    
    // 2. 눈 감김 체크
    if (!isEyeOpen) {
      if (!this.eyeClosedStartTime) {
        this.eyeClosedStartTime = Date.now()
      }
      
      const eyeClosedDuration = Date.now() - this.eyeClosedStartTime
      
      // 3초 이상 눈 감음 → 졸음
      if (eyeClosedDuration >= CONFIG.DROWSY_DURATION) {
        return {
          state: FocusState.DROWSY,
          details: { 
            reason: '졸음이 감지되었습니다',
            ear,
            duration: eyeClosedDuration
          }
        }
      }
      
      // 눈 감김 경고
      return {
        state: FocusState.WARNING,
        details: { 
          reason: '눈을 감고 있습니다',
          ear,
          remainingTime: CONFIG.DROWSY_DURATION - eyeClosedDuration
        }
      }
    } else {
      this.eyeClosedStartTime = null
    }
    
    // 3. 정면 응시 체크
    if (!isFacing) {
      if (!this.warningStartTime) {
        this.warningStartTime = Date.now()
      }
      
      const warningDuration = Date.now() - this.warningStartTime
      
      // 5초 이상 딴 곳 응시 → 이탈 처리
      if (warningDuration >= CONFIG.WARNING_DURATION) {
        return {
          state: FocusState.AWAY,
          details: { reason: '화면을 보고 있지 않습니다' }
        }
      }
      
      return {
        state: FocusState.WARNING,
        details: { 
          reason: '화면을 바라봐주세요',
          remainingTime: CONFIG.WARNING_DURATION - warningDuration
        }
      }
    } else {
      this.warningStartTime = null
    }
    
    // 4. 하품 감지 (경고만)
    if (isYawning) {
      return {
        state: FocusState.WARNING,
        details: { reason: '하품이 감지되었습니다', mouthRatio }
      }
    }
    
    // 5. 모든 조건 통과 → 집중
    return {
      state: FocusState.FOCUSED,
      details: { ear, isFacing, mouthRatio }
    }
  }
  
  reset() {
    this.eyeClosedStartTime = null
    this.warningStartTime = null
  }
}
```

### 3. 타이머 훅

```javascript
// src/hooks/useStudyTimer.js
import { useState, useRef, useCallback, useEffect } from 'react'
import { loadFaceModels } from '@/lib/faceDetection'
import { FocusAnalyzer, FocusState } from '@/lib/focusDetection'

export function useStudyTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [totalTime, setTotalTime] = useState(0)       // 총 경과 시간
  const [focusedTime, setFocusedTime] = useState(0)   // 실제 집중 시간
  const [focusState, setFocusState] = useState(FocusState.AWAY)
  const [focusDetails, setFocusDetails] = useState({})
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  
  const videoRef = useRef(null)
  const analyzerRef = useRef(null)
  const intervalRef = useRef(null)
  const lastTickRef = useRef(null)
  
  // 모델 로드
  useEffect(() => {
    loadFaceModels().then(setIsModelLoaded)
    analyzerRef.current = new FocusAnalyzer()
  }, [])
  
  // 웹캠 시작
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      return true
    } catch (error) {
      console.error('카메라 접근 실패:', error)
      return false
    }
  }, [])
  
  // 타이머 시작
  const start = useCallback(async () => {
    if (!isModelLoaded) {
      alert('모델을 로드하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    
    const cameraStarted = await startCamera()
    if (!cameraStarted) {
      alert('카메라를 시작할 수 없습니다.')
      return
    }
    
    setIsRunning(true)
    lastTickRef.current = Date.now()
    
    // 0.5초마다 집중 상태 체크
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return
      
      const now = Date.now()
      const elapsed = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      
      // 총 시간 증가
      setTotalTime(prev => prev + elapsed)
      
      // 집중 상태 분석
      const result = await analyzerRef.current.analyze(videoRef.current)
      setFocusState(result.state)
      setFocusDetails(result.details)
      
      // 집중 중일 때만 집중 시간 증가
      if (result.state === FocusState.FOCUSED) {
        setFocusedTime(prev => prev + elapsed)
      }
      
      // 졸음 감지 시 알림
      if (result.state === FocusState.DROWSY) {
        playDrowsyAlert()
      }
    }, 500)
  }, [isModelLoaded, startCamera])
  
  // 타이머 정지
  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }, [])
  
  // 일시정지
  const pause = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])
  
  // 재개
  const resume = useCallback(() => {
    if (!videoRef.current?.srcObject) return
    
    setIsRunning(true)
    lastTickRef.current = Date.now()
    
    intervalRef.current = setInterval(async () => {
      // ... (start와 동일한 로직)
    }, 500)
  }, [])
  
  // 리셋
  const reset = useCallback(() => {
    stop()
    setTotalTime(0)
    setFocusedTime(0)
    setFocusState(FocusState.AWAY)
  }, [stop])
  
  return {
    videoRef,
    isRunning,
    isModelLoaded,
    totalTime,
    focusedTime,
    focusState,
    focusDetails,
    focusRate: totalTime > 0 ? (focusedTime / totalTime) * 100 : 0,
    start,
    stop,
    pause,
    resume,
    reset,
  }
}

// 졸음 알림 (소리 + 진동)
function playDrowsyAlert() {
  // 진동 (모바일)
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200])
  }
  
  // 알림음
  const audio = new Audio('/sounds/alert.mp3')
  audio.play().catch(() => {})
}
```

### 4. 타이머 컴포넌트

```jsx
// src/components/study-timer/StudyTimer.jsx
'use client'

import { useStudyTimer } from '@/hooks/useStudyTimer'
import { FocusState } from '@/lib/focusDetection'
import { formatTime } from '@/utils/time'

export default function StudyTimer() {
  const {
    videoRef,
    isRunning,
    isModelLoaded,
    totalTime,
    focusedTime,
    focusState,
    focusDetails,
    focusRate,
    start,
    stop,
    pause,
    reset,
  } = useStudyTimer()
  
  const stateConfig = {
    [FocusState.FOCUSED]: { 
      color: 'bg-green-500', 
      text: '집중 중 ✅', 
      icon: '😊' 
    },
    [FocusState.WARNING]: { 
      color: 'bg-yellow-500', 
      text: '경고 ⚠️', 
      icon: '😐' 
    },
    [FocusState.AWAY]: { 
      color: 'bg-red-500', 
      text: '이탈 ❌', 
      icon: '👻' 
    },
    [FocusState.DROWSY]: { 
      color: 'bg-purple-500', 
      text: '졸음 😴', 
      icon: '😴' 
    },
  }
  
  const currentState = stateConfig[focusState]
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* 웹캠 영역 */}
      <div className="relative mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg bg-gray-900"
        />
        
        {/* 상태 오버레이 */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm ${currentState.color}`}>
          {currentState.icon} {currentState.text}
        </div>
        
        {/* 상세 정보 */}
        {focusDetails.reason && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-sm p-2 rounded">
            {focusDetails.reason}
          </div>
        )}
      </div>
      
      {/* 시간 표시 */}
      <div className="text-center mb-6">
        <div className="text-5xl font-mono font-bold text-gray-800">
          {formatTime(focusedTime)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          집중 시간 (총 {formatTime(totalTime)})
        </div>
        <div className="text-sm text-gray-500">
          집중률: {focusRate.toFixed(1)}%
        </div>
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={start}
            disabled={!isModelLoaded}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isModelLoaded ? '시작' : '로딩 중...'}
          </button>
        ) : (
          <>
            <button
              onClick={pause}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              일시정지
            </button>
            <button
              onClick={stop}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              종료
            </button>
          </>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          리셋
        </button>
      </div>
    </div>
  )
}
```

---

## 데이터 모델

### StudySession (공부 세션)

```prisma
model StudySession {
  id       String @id @default(cuid())
  userId   String
  studyId  String?
  
  // 시간 정보
  startTime    DateTime
  endTime      DateTime?
  totalTime    Int       @default(0)  // 총 경과 시간 (초)
  focusedTime  Int       @default(0)  // 실제 집중 시간 (초)
  
  // 집중도 분석
  focusRate       Float  @default(0)   // 집중률 (%)
  drowsinessCount Int    @default(0)   // 졸음 감지 횟수
  awayCount       Int    @default(0)   // 이탈 횟수
  
  // 메타
  note     String?
  category String?
  
  createdAt DateTime @default(now())
  
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  study Study? @relation(fields: [studyId], references: [id], onDelete: SetNull)
  
  @@index([userId, createdAt])
  @@index([studyId, createdAt])
}
```

### DailyStudyStat (일일 통계)

```prisma
model DailyStudyStat {
  id     String   @id @default(cuid())
  userId String
  date   DateTime @db.Date
  
  totalTime      Int   @default(0)  // 총 시간 (초)
  focusedTime    Int   @default(0)  // 집중 시간 (초)
  sessionCount   Int   @default(0)  // 세션 수
  avgFocusRate   Float @default(0)  // 평균 집중률
  
  // 목표
  goalTime      Int?     // 목표 시간 (초)
  goalAchieved  Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
  @@index([date])
}
```

### StudyRanking (랭킹)

```prisma
model StudyRanking {
  id       String     @id @default(cuid())
  userId   String
  studyId  String?
  period   RankPeriod
  
  focusedTime Int       // 집중 시간
  rank        Int       // 순위
  periodStart DateTime
  periodEnd   DateTime
  
  createdAt DateTime @default(now())
  
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  study Study? @relation(fields: [studyId], references: [id], onDelete: Cascade)
  
  @@unique([userId, studyId, period, periodStart])
  @@index([studyId, period, rank])
}

enum RankPeriod {
  DAILY
  WEEKLY
  MONTHLY
  ALL_TIME
}
```

---

## API 엔드포인트

### 세션 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/study-timer/start` | 세션 시작 |
| POST | `/api/study-timer/heartbeat` | 상태 업데이트 (30초마다) |
| POST | `/api/study-timer/stop` | 세션 종료 |
| GET | `/api/study-timer/current` | 현재 세션 조회 |
| GET | `/api/study-timer/sessions` | 세션 기록 조회 |

### 통계

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/study-timer/stats` | 개인 통계 |
| GET | `/api/study-timer/stats/daily` | 일별 통계 |
| GET | `/api/study-timer/goal` | 목표 조회 |
| PUT | `/api/study-timer/goal` | 목표 설정 |

### 랭킹

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/study-timer/ranking` | 전체 랭킹 |
| GET | `/api/study-timer/ranking/study/[id]` | 스터디 내 랭킹 |
| GET | `/api/study-timer/ranking/friends` | 친구 랭킹 |

---

## 컴포넌트 구조

```
src/components/study-timer/
├── StudyTimer.jsx         # 메인 타이머
├── FocusIndicator.jsx     # 집중 상태 표시
├── TimerDisplay.jsx       # 시간 표시
├── TimerControls.jsx      # 컨트롤 버튼
├── SessionSummary.jsx     # 세션 완료 요약
├── DailyGoal.jsx          # 일일 목표
├── WeeklyChart.jsx        # 주간 차트
├── RankingList.jsx        # 랭킹 리스트
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/study-timer/page.jsx` | `/study-timer` | 타이머 메인 |
| `src/app/study-timer/stats/page.jsx` | `/study-timer/stats` | 통계 |
| `src/app/study-timer/ranking/page.jsx` | `/study-timer/ranking` | 랭킹 |
| `src/app/my-studies/[id]/timer/page.jsx` | `/my-studies/[id]/timer` | 스터디 내 타이머 |

---

## UI 설계

### 타이머 화면

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐│
│  │         📹 웹캠 미리보기              ││
│  │                                     ││
│  │  [😊 집중 중 ✅]                    ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│            ⏱️ 01:23:45                   │
│            집중 시간                     │
│                                         │
│     총 시간: 01:30:00  |  집중률: 82%    │
│                                         │
│     목표: 4시간  ████████░░  41%        │
│                                         │
│     [⏸️ 일시정지]  [⏹️ 종료]  [🔄 리셋]  │
└─────────────────────────────────────────┘
```

### 상태별 표시

| 상태 | 색상 | 아이콘 | 메시지 |
|------|------|--------|--------|
| 집중 | 🟢 초록 | 😊 | "집중 중 ✅" |
| 경고 | 🟡 노랑 | 😐 | "화면을 바라봐주세요" |
| 이탈 | 🔴 빨강 | 👻 | "얼굴이 감지되지 않습니다" |
| 졸음 | 🟣 보라 | 😴 | "졸음이 감지되었습니다" |

---

## 프라이버시

1. **클라이언트 처리**: 모든 얼굴 분석은 브라우저에서 처리
2. **전송 없음**: 웹캠 영상/이미지는 서버로 전송되지 않음
3. **저장 없음**: 얼굴 데이터는 저장되지 않음
4. **선택적 사용**: 일반 타이머로도 사용 가능 (얼굴 인식 OFF)
5. **명시적 동의**: 카메라 사용 전 권한 요청

---

## 구현 우선순위

| Phase | 기능 | 설명 |
|-------|------|------|
| 1 | 기본 타이머 | 얼굴 인식 없이 수동 타이머 |
| 2 | 얼굴 감지 | face-api.js 연동, 기본 감지 |
| 3 | 집중 분석 | EAR, 정면 응시, 졸음 감지 |
| 4 | 통계 | 일별/주별/월별 통계 |
| 5 | 랭킹 | 스터디/친구 랭킹 |
| 6 | 연동 | 게이미피케이션 연동 (뱃지, XP) |

---

## 관련 문서

- [13-dashboard](../13-dashboard/README.md) - 대시보드
- [27-gamification](../27-gamification/README.md) - 게이미피케이션
- [21-friends](../21-friends/README.md) - 친구 랭킹

