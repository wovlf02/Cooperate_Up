# 🧩 화상통화 컴포넌트

## 개요

화상통화 UI를 구성하는 컴포넌트들입니다.

**파일 위치**: `src/components/video-call/`

---

## 컴포넌트 목록

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| VideoTile | VideoTile.jsx | 개별 비디오 화면 |
| ControlBar | ControlBar.jsx | 하단 컨트롤 바 |
| SettingsModal | SettingsModal.jsx | 설정 모달 |

---

## VideoTile

개별 참여자의 비디오를 표시하는 컴포넌트입니다.

### Props

```typescript
interface VideoTileProps {
  stream: MediaStream | null;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  isSelf?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSharingScreen?: boolean;
  isSpeaking?: boolean;
}
```

### 구조

```jsx
<div className={styles.tile}>
  {isVideoOff ? (
    <div className={styles.avatar}>
      <img src={user.avatar} alt={user.name} />
    </div>
  ) : (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isSelf}
    />
  )}
  
  <div className={styles.overlay}>
    <span className={styles.name}>{user.name}</span>
    {isMuted && <span className={styles.mutedIcon}>🔇</span>}
  </div>
  
  {isSpeaking && <div className={styles.speakingIndicator} />}
</div>
```

### 스타일

```css
.tile {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--gray-900);
  border-radius: 12px;
  overflow: hidden;
}

.tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.speakingIndicator {
  position: absolute;
  inset: 0;
  border: 3px solid var(--primary-500);
  border-radius: 12px;
}
```

---

## ControlBar

화상통화 컨트롤 버튼을 표시하는 컴포넌트입니다.

### Props

```typescript
interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
}
```

### 구조

```jsx
<div className={styles.controlBar}>
  <button
    className={`${styles.button} ${isMuted ? styles.off : ''}`}
    onClick={onToggleMute}
  >
    {isMuted ? '🔇' : '🎤'}
  </button>
  
  <button
    className={`${styles.button} ${isVideoOff ? styles.off : ''}`}
    onClick={onToggleVideo}
  >
    {isVideoOff ? '📷' : '📹'}
  </button>
  
  <button
    className={`${styles.button} ${isSharingScreen ? styles.active : ''}`}
    onClick={onToggleScreenShare}
  >
    🖥️
  </button>
  
  <button
    className={styles.button}
    onClick={onOpenSettings}
  >
    ⚙️
  </button>
  
  <button
    className={`${styles.button} ${styles.leave}`}
    onClick={onLeave}
  >
    📞
  </button>
</div>
```

### 버튼

| 버튼 | 아이콘 | 기능 |
|------|--------|------|
| 마이크 | 🎤/🔇 | 음소거 토글 |
| 카메라 | 📹/📷 | 비디오 토글 |
| 화면공유 | 🖥️ | 화면 공유 토글 |
| 설정 | ⚙️ | 설정 모달 열기 |
| 종료 | 📞 | 통화 종료 |

---

## SettingsModal

미디어 장치 설정을 위한 모달입니다.

### Props

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: {
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
  };
  selectedDevices: {
    audioInput: string;
    audioOutput: string;
    videoInput: string;
  };
  onDeviceChange: (type: string, deviceId: string) => void;
}
```

### 구조

```jsx
<Modal isOpen={isOpen} onClose={onClose}>
  <h2>설정</h2>
  
  <div className={styles.section}>
    <label>마이크</label>
    <select
      value={selectedDevices.audioInput}
      onChange={(e) => onDeviceChange('audioInput', e.target.value)}
    >
      {devices.audioInputs.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label}
        </option>
      ))}
    </select>
  </div>
  
  <div className={styles.section}>
    <label>스피커</label>
    <select
      value={selectedDevices.audioOutput}
      onChange={(e) => onDeviceChange('audioOutput', e.target.value)}
    >
      {devices.audioOutputs.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label}
        </option>
      ))}
    </select>
  </div>
  
  <div className={styles.section}>
    <label>카메라</label>
    <select
      value={selectedDevices.videoInput}
      onChange={(e) => onDeviceChange('videoInput', e.target.value)}
    >
      {devices.videoInputs.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label}
        </option>
      ))}
    </select>
  </div>
  
  <div className={styles.preview}>
    <video ref={previewRef} autoPlay muted />
  </div>
</Modal>
```

---

## VideoCallPage

화상통화 메인 페이지입니다.

### 상태 관리

```jsx
const [localStream, setLocalStream] = useState(null);
const [peers, setPeers] = useState(new Map());  // socketId -> { stream, user }
const [isMuted, setIsMuted] = useState(false);
const [isVideoOff, setIsVideoOff] = useState(false);
const [isSharingScreen, setIsSharingScreen] = useState(false);
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
```

### 레이아웃

```jsx
<div className={styles.container}>
  <div className={styles.videoGrid}>
    {/* 자신의 비디오 */}
    <VideoTile
      stream={localStream}
      user={currentUser}
      isSelf
      isMuted={isMuted}
      isVideoOff={isVideoOff}
    />
    
    {/* 다른 참여자들 */}
    {Array.from(peers.values()).map(peer => (
      <VideoTile
        key={peer.socketId}
        stream={peer.stream}
        user={peer.user}
        isMuted={peer.isMuted}
        isVideoOff={peer.isVideoOff}
      />
    ))}
  </div>
  
  <ControlBar
    isMuted={isMuted}
    isVideoOff={isVideoOff}
    isSharingScreen={isSharingScreen}
    onToggleMute={handleToggleMute}
    onToggleVideo={handleToggleVideo}
    onToggleScreenShare={handleToggleScreenShare}
    onOpenSettings={() => setIsSettingsOpen(true)}
    onLeave={handleLeave}
  />
  
  <SettingsModal
    isOpen={isSettingsOpen}
    onClose={() => setIsSettingsOpen(false)}
    devices={devices}
    selectedDevices={selectedDevices}
    onDeviceChange={handleDeviceChange}
  />
</div>
```

---

## 관련 문서

- [README](./README.md)
- [시그널링 서버](./signaling-server.md)
- [WebRTC 가이드](./webrtc.md)

