// 화상 회의 설정 모달
'use client';

import { useState, useEffect } from 'react';
import styles from './SettingsModal.module.css';

export default function SettingsModal({ isOpen, onClose, currentSettings, onSave }) {
  const [settings, setSettings] = useState({
    audioInputDevice: 'default',
    videoInputDevice: 'default',
    audioOutputDevice: 'default',
    videoQuality: 'high',
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    ...currentSettings
  });

  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });

  // 미디어 디바이스 목록 가져오기 함수
  const loadDevices = async () => {
    try {
      // 권한 요청
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const deviceList = await navigator.mediaDevices.enumerateDevices();

      setDevices({
        audioInputs: deviceList.filter(device => device.kind === 'audioinput'),
        videoInputs: deviceList.filter(device => device.kind === 'videoinput'),
        audioOutputs: deviceList.filter(device => device.kind === 'audiooutput')
      });
    } catch (error) {
      console.error('디바이스 목록을 가져오는데 실패했습니다:', error);
    }
  };

  // 미디어 디바이스 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      audioInputDevice: 'default',
      videoInputDevice: 'default',
      audioOutputDevice: 'default',
      videoQuality: 'high',
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>⚙️ 설정</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.modalBody}>
          {/* 오디오 입력 장치 */}
          <div className={styles.settingSection}>
            <label className={styles.settingLabel}>
              🎤 마이크
            </label>
            <select
              className={styles.settingSelect}
              value={settings.audioInputDevice}
              onChange={(e) => setSettings({ ...settings, audioInputDevice: e.target.value })}
            >
              <option value="default">기본 마이크</option>
              {devices.audioInputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `마이크 ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* 비디오 입력 장치 */}
          <div className={styles.settingSection}>
            <label className={styles.settingLabel}>
              📹 카메라
            </label>
            <select
              className={styles.settingSelect}
              value={settings.videoInputDevice}
              onChange={(e) => setSettings({ ...settings, videoInputDevice: e.target.value })}
            >
              <option value="default">기본 카메라</option>
              {devices.videoInputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `카메라 ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* 오디오 출력 장치 */}
          <div className={styles.settingSection}>
            <label className={styles.settingLabel}>
              🔊 스피커
            </label>
            <select
              className={styles.settingSelect}
              value={settings.audioOutputDevice}
              onChange={(e) => setSettings({ ...settings, audioOutputDevice: e.target.value })}
            >
              <option value="default">기본 스피커</option>
              {devices.audioOutputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `스피커 ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.divider} />

          {/* 비디오 품질 */}
          <div className={styles.settingSection}>
            <label className={styles.settingLabel}>
              📊 비디오 품질
            </label>
            <select
              className={styles.settingSelect}
              value={settings.videoQuality}
              onChange={(e) => setSettings({ ...settings, videoQuality: e.target.value })}
            >
              <option value="low">낮음 (360p)</option>
              <option value="medium">보통 (480p)</option>
              <option value="high">높음 (720p)</option>
              <option value="ultra">매우 높음 (1080p)</option>
            </select>
            <p className={styles.settingHint}>
              낮은 품질은 네트워크 대역폭을 절약합니다.
            </p>
          </div>

          <div className={styles.divider} />

          {/* 오디오 향상 옵션 */}
          <div className={styles.settingSection}>
            <label className={styles.settingLabel}>
              🎵 오디오 향상
            </label>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.echoCancellation}
                  onChange={(e) => setSettings({ ...settings, echoCancellation: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>에코 제거</span>
              </label>
              <p className={styles.checkboxHint}>스피커에서 나오는 소리가 마이크로 다시 들어가는 것을 방지합니다.</p>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.noiseSuppression}
                  onChange={(e) => setSettings({ ...settings, noiseSuppression: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>노이즈 제거</span>
              </label>
              <p className={styles.checkboxHint}>배경 소음을 줄여 음질을 향상시킵니다.</p>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.autoGainControl}
                  onChange={(e) => setSettings({ ...settings, autoGainControl: e.target.checked })}
                  className={styles.checkbox}
                />
                <span>자동 볼륨 조절</span>
              </label>
              <p className={styles.checkboxHint}>마이크 볼륨을 자동으로 조절하여 일정한 음량을 유지합니다.</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <button className={styles.resetButton} onClick={handleReset}>
            초기화
          </button>
          <div className={styles.footerButtons}>
            <button className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

