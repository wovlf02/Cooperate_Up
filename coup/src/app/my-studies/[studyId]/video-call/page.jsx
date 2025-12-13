// 내 스터디 화상회의 페이지 (3단 레이아웃: 참여자 | 비디오 | 채팅)
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useStudy } from '@/lib/hooks/useApi';
import { useSocket } from '@/lib/hooks/useSocket';
import { useVideoCall } from '@/lib/hooks/useVideoCall';
import VideoTile from '@/components/video-call/VideoTile';
import ControlBar from '@/components/video-call/ControlBar';
import SettingsModal from '@/components/video-call/SettingsModal';
import StudyTabs from '@/components/study/StudyTabs';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import api from '@/lib/api';
import styles from './page.module.css';

export default function MyStudyVideoCallPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const roomId = `study-${studyId}-main`;


  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedVideoSocketId, setExpandedVideoSocketId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    audioInputDevice: 'default',
    videoInputDevice: 'default',
    audioOutputDevice: 'default',
    videoQuality: 'high',
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  });
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Session - 현재 로그인한 사용자 정보
  const { data: session } = useSession();
  const currentUser = session?.user;

  // 사용자 정보 디버깅
  useEffect(() => {
    console.log('[VideoCall] Current user:', currentUser);
  }, [currentUser]);

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const study = studyData?.data;

  // Socket
  const { socket, isConnected } = useSocket();
  const [socketConnected, setSocketConnected] = useState(false);

  // 실시간 소켓 연결 상태 확인
  useEffect(() => {
    if (!socket) return;

    const checkConnection = () => {
      setSocketConnected(socket.connected);
    };

    // 초기 확인
    checkConnection();

    // 주기적으로 확인 (100ms)
    const interval = setInterval(checkConnection, 100);

    // 소켓 이벤트 리스너
    socket.on('connect', checkConnection);
    socket.on('disconnect', checkConnection);

    return () => {
      clearInterval(interval);
      socket.off('connect', checkConnection);
      socket.off('disconnect', checkConnection);
    };
  }, [socket]);

  // 소켓 상태 디버깅
  useEffect(() => {
    console.log('[VideoCall Page] Socket state changed:', {
      socket: !!socket,
      isConnected,
      socketConnected,
      socketId: socket?.id,
      actuallyConnected: socket?.connected
    });
  }, [socket, isConnected, socketConnected]);

  // 화상통화 훅
  const {
    localStream,
    remoteStreams,
    participants,
    isMuted,
    isVideoOff,
    isSharingScreen,
    someoneSharingScreen,
    speakingUsers,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    shareScreen,
    stopScreenShare,
  } = useVideoCall(studyId, roomId);

  // 채팅 이벤트 리스너
  useEffect(() => {
    if (!socket || !isInCall || !currentUser) return;

    // 화상 통화 중 채팅 메시지 수신
    socket.on('chat:video-message-received', (message) => {
      console.log('[VideoCall] Received chat message:', message);

      // 자신이 보낸 메시지는 이미 화면에 표시했으므로 무시
      if (message.userId === currentUser.id && message.socketId === socket.id) {
        return;
      }

      // 다른 사람이 보낸 메시지만 추가
      setChatMessages((prev) => [...prev, { ...message, isMe: false }]);

      // 자동 스크롤
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // 파일 메시지 수신
    socket.on('chat:video-file-received', (fileMessage) => {
      console.log('[VideoCall] Received file message:', fileMessage);

      // 자신이 보낸 파일은 무시
      if (fileMessage.userId === currentUser.id && fileMessage.socketId === socket.id) {
        return;
      }

      // 다른 사람이 보낸 파일 추가
      setChatMessages((prev) => [...prev, { ...fileMessage, isMe: false, type: 'file' }]);

      // 자동 스크롤
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      socket.off('chat:video-message-received');
      socket.off('chat:video-file-received');
    };
  }, [socket, isInCall, currentUser]);

  // 통화 시간 카운터
  useEffect(() => {
    if (!isInCall) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInCall]);

  // 통화 시간 포맷팅
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      // 이미지
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
      // 문서
      pdf: '📄', doc: '📝', docx: '📝', txt: '📝',
      // 스프레드시트
      xls: '📊', xlsx: '📊', csv: '📊',
      // 프레젠테이션
      ppt: '📊', pptx: '📊',
      // 압축
      zip: '📦', rar: '📦', '7z': '📦',
      // 코드
      js: '💻', jsx: '💻', ts: '💻', tsx: '💻', py: '💻', java: '💻',
      html: '💻', css: '💻', json: '💻',
      // 비디오
      mp4: '🎬', avi: '🎬', mov: '🎬', wmv: '🎬',
      // 오디오
      mp3: '🎵', wav: '🎵', flac: '🎵',
    };
    return iconMap[ext] || '📎';
  };

  // 이미지 파일인지 확인
  const isImageFile = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  // 그리드 레이아웃 계산 (참여자 수에 따라 유동적으로)
  const getGridLayout = () => {
    const totalCount = participants.length + (localStream ? 1 : 0);
    if (totalCount === 1) return styles.grid1;
    if (totalCount === 2) return styles.grid2x2;
    if (totalCount <= 4) return styles.grid3x3; // 3~4명: 2x2
    if (totalCount <= 6) return styles.grid4x3; // 5~6명: 3x2
    if (totalCount <= 9) return styles.grid3x3Large; // 7~9명: 3x3
    return styles.gridLarge; // 10명 이상: 4xN (스크롤)
  };

  const handleJoinCall = async () => {
    // 실제 소켓 연결 상태 확인 (React 상태가 아닌)
    if (!socket || !socket.connected) {
      console.warn('[VideoCall] Socket not ready:', {
        socket: !!socket,
        isConnected,
        actuallyConnected: socket?.connected
      });
      alert('시그널링 서버에 연결 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      console.log('[VideoCall] ✅ Attempting to join room...');
      await joinRoom(true, true);
      setIsInCall(true);
      setCallDuration(0);
      setChatMessages([]); // 채팅 초기화
    } catch (err) {
      console.error('[VideoCall] Join failed:', err);
      alert(err.message || error || '화상회의 입장에 실패했습니다.');
    }
  };

  const handleLeaveCall = () => {
    if (confirm('정말 통화를 종료하시겠습니까?')) {
      leaveRoom();
      setIsInCall(false);
      setCallDuration(0);
      router.push(`/my-studies/${studyId}`);
    }
  };

  const handleShareScreen = () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      // 다른 사람이 화면 공유 중인지 확인
      if (someoneSharingScreen) {
        alert('다른 참여자가 이미 화면을 공유하고 있습니다.');
        return;
      }

      shareScreen().catch((err) => {
        // 사용자가 취소한 경우(NotAllowedError, AbortError)는 alert 표시 안 함
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
          alert('화면 공유에 실패했습니다.');
        }
      });
    }
  };

  // 설정 저장
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    // 실제로 디바이스를 변경하려면 미디어 스트림을 다시 가져와야 함
    console.log('새로운 설정:', newSettings);
  };

  // 비디오 확대
  const handleExpandVideo = (socketId) => {
    setExpandedVideoSocketId(socketId);
  };

  // 비디오 축소
  const handleCollapseVideo = () => {
    setExpandedVideoSocketId(null);
  };

  // 채팅 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socket || !currentUser) return;

    const newMessage = {
      id: `msg_${Date.now()}_${socket.id}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      message: chatMessage.trim(),
      timestamp: new Date(),
      socketId: socket.id,
      isMe: true // 자신이 보낸 메시지 표시
    };

    // 즉시 화면에 표시
    setChatMessages((prev) => [...prev, newMessage]);

    // 서버로 전송
    socket.emit('chat:video-message', {
      roomId,
      message: chatMessage.trim()
    });

    setChatMessage('');

    // 자동 스크롤
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // 파일 선택
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 제한 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
  };

  // 파일 전송
  const handleSendFile = async () => {
    if (!selectedFile || !socket || !currentUser) return;

    setIsUploading(true);

    try {
      // FormData로 파일 준비
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // 파일 타입에 따른 카테고리 결정
      const getFileCategory = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'IMAGE';
        if (mimeType.startsWith('video/')) return 'VIDEO';
        if (mimeType.startsWith('audio/')) return 'AUDIO';
        if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip', 'application/x-tar'].includes(mimeType)) return 'ARCHIVE';
        if (['text/javascript', 'text/css', 'text/html', 'application/json', 'application/xml', 'text/x-python', 'text/x-java'].includes(mimeType)) return 'CODE';
        return 'DOCUMENT';
      };
      
      const category = getFileCategory(selectedFile.type);
      formData.append('category', category);

      // 파일 업로드 API 호출 (올바른 경로)
      const result = await api.post(`/api/studies/${studyId}/files`, formData, {
        headers: {} // FormData는 헤더를 비워야 Content-Type이 자동 설정됨
      });

      // 파일 메시지 생성
      const fileMessage = {
        id: `msg_${Date.now()}_${socket.id}`,
        roomId,
        userId: currentUser.id,
        user: currentUser,
        type: 'file',
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          url: result.data.url,
          id: result.data.id,
        },
        timestamp: new Date(),
        socketId: socket.id,
        isMe: true
      };

      // 즉시 화면에 표시
      setChatMessages((prev) => [...prev, fileMessage]);

      // 서버로 전송
      socket.emit('chat:video-file', {
        roomId,
        file: fileMessage.file
      });

      // 초기화
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // 자동 스크롤
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    } catch (error) {
      console.error('File upload error:', error);
      alert(`파일 전송에 실패했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 취소
  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 다운로드
  const handleDownloadFile = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (studyLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.error}>스터디를 찾을 수 없습니다.</div>;
  }

  const headerStyle = getStudyHeaderStyle(study.category);

  // 대기실 화면 (참여 전)
  if (!isInCall) {
    return (
      <div className={styles.waitingContainer}>
        {/* 헤더 */}
        <div className={styles.header}>
          <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
            ← 내 스터디 목록
          </button>

          <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
            <div className={styles.studyInfo}>
              <span className={styles.emoji}>{study.emoji}</span>
              <div>
                <h1 className={styles.studyName}>{study.name}</h1>
                <p className={styles.studyMeta}>
                  👥 {study.currentMembers}/{study.maxMembers}명
                </p>
              </div>
            </div>
            <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
              {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} {study.myRole || 'MEMBER'}
            </span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <StudyTabs studyId={studyId} activeTab="화상" userRole={study.myRole} />

        {/* 메인 콘텐츠 - 대기실 */}
        <div className={styles.waitingMainContent}>
          <div className={styles.waitingCard}>
            <div className={styles.waitingCardIcon}>🎥</div>
            <h2 className={styles.waitingCardTitle}>화상 스터디</h2>
            <p className={styles.waitingCardDescription}>
              화상 통화에 참여하시겠습니까?
            </p>

            {/* 소켓 연결 전: 로딩 스피너 */}
            {!socketConnected ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>연결 준비 중...</p>
              </div>
            ) : (
              /* 소켓 연결 후: 참여하기 버튼 */
              <button
                onClick={handleJoinCall}
                className={styles.waitingJoinButton}
              >
                🎥 참여하기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 화상 통화 메인 화면 (3단 레이아웃)
  return (
    <div className={styles.container}>

      {/* 메인 컨텐츠 영역 (3단 레이아웃) */}
      <div className={styles.mainContent}>
        {/* 좌측 사이드바: 참여자 목록 */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>👥 참여자 ({participants.length + 1})</h3>
          </div>
          <div className={styles.participantList}>
            {/* 나 */}
            <div className={styles.participant}>
              <div className={styles.participantAvatar}>
                {currentUser?.name?.charAt(0) || '?'}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>
                  👑 {currentUser?.name || '나'} (나)
                </div>
                <div className={styles.participantStatus}>
                  {!isMuted && '🎤'} {!isVideoOff && '📹'}
                </div>
              </div>
            </div>

            {/* 다른 참여자들 */}
            {participants.map((participant) => (
              <div key={participant.socketId} className={styles.participant}>
                <div className={styles.participantAvatar}>
                  {participant.user?.name?.charAt(0) || '?'}
                </div>
                <div className={styles.participantInfo}>
                  <div className={styles.participantName}>
                    {participant.user?.name || 'Unknown'}
                  </div>
                  <div className={styles.participantStatus}>
                    {!participant.isMuted && '🎤'} {!participant.isVideoOff && '📹'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 중앙: 비디오 그리드 */}
        <main className={styles.videoArea}>
          <div className={`${styles.videoGrid} ${getGridLayout()}`}>
            {/* 로컬 비디오 */}
            {localStream && (
              <VideoTile
                stream={localStream}
                isLocal={true}
                user={currentUser}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                isSpeaking={false}
                isExpanded={expandedVideoSocketId === 'local'}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onExpand={() => handleExpandVideo('local')}
                onCollapse={handleCollapseVideo}
              />
            )}

            {/* 원격 비디오 */}
            {participants.map((participant) => {
              const stream = remoteStreams.get(participant.socketId);
              const isSpeaking = speakingUsers.has(participant.socketId);

              return (
                <VideoTile
                  key={participant.socketId}
                  stream={stream}
                  isLocal={false}
                  user={participant.user}
                  isMuted={participant.isMuted}
                  isVideoOff={participant.isVideoOff}
                  isSpeaking={isSpeaking}
                  isSharingScreen={participant.isSharingScreen}
                  isExpanded={expandedVideoSocketId === participant.socketId}
                  onExpand={() => handleExpandVideo(participant.socketId)}
                  onCollapse={handleCollapseVideo}
                />
              );
            })}
          </div>
        </main>

        {/* 우측 사이드바: 채팅 */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>💬 채팅</h3>
          </div>
          <div className={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <div className={styles.chatEmpty}>채팅을 시작해보세요!</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={msg.isMe ? styles.chatMessageMe : styles.chatMessage}
                >
                  {/* 다른 사용자 메시지 */}
                  {!msg.isMe && (
                    <>
                      {/* 프로필 사진 */}
                      <div className={styles.messageAvatar}>
                        {msg.user?.name?.charAt(0) || '?'}
                      </div>

                      <div className={styles.messageContentWrapper}>
                        {/* 닉네임 */}
                        <div className={styles.messageUsername}>
                          {msg.user?.name || 'Unknown'}
                        </div>

                        {/* 메시지와 시간을 한 줄에 */}
                        <div className={styles.messageWithTime}>
                          {/* 텍스트 메시지 */}
                          {!msg.type || msg.type === 'text' ? (
                            <div className={styles.chatMessageContent}>
                              {msg.message}
                            </div>
                          ) : null}

                          {/* 파일 메시지 */}
                          {msg.type === 'file' && msg.file && (
                            <div className={styles.chatFileMessage}>
                              <div className={styles.filePreview}>
                                {isImageFile(msg.file.name) ? (
                                  <img
                                    src={msg.file.url}
                                    alt={msg.file.name}
                                    className={styles.fileImage}
                                  />
                                ) : (
                                  <div className={styles.fileIconLarge}>
                                    {getFileIcon(msg.file.name)}
                                  </div>
                                )}
                              </div>
                              <div className={styles.fileInfo}>
                                <div className={styles.fileName}>
                                  {getFileIcon(msg.file.name)} {msg.file.name}
                                </div>
                                <div className={styles.fileSize}>
                                  {formatFileSize(msg.file.size)}
                                </div>
                                <button
                                  onClick={() => handleDownloadFile(msg.file)}
                                  className={styles.fileDownloadButton}
                                >
                                  ⬇️ 다운로드
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 시간 (메시지 박스 우측, 하단 정렬) */}
                          <span className={styles.messageTimeRight}>
                            {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 내 메시지 */}
                  {msg.isMe && (
                    <div className={styles.myMessageWithTime}>
                      {/* 시간 (메시지 박스 좌측, 하단 정렬) */}
                      <span className={styles.messageTimeLeft}>
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {/* 텍스트 메시지 */}
                      {!msg.type || msg.type === 'text' ? (
                        <div className={styles.chatMessageContent}>
                          {msg.message}
                        </div>
                      ) : null}

                      {/* 파일 메시지 */}
                      {msg.type === 'file' && msg.file && (
                        <div className={styles.chatFileMessage}>
                          <div className={styles.filePreview}>
                            {isImageFile(msg.file.name) ? (
                              <img
                                src={msg.file.url}
                                alt={msg.file.name}
                                className={styles.fileImage}
                              />
                            ) : (
                              <div className={styles.fileIconLarge}>
                                {getFileIcon(msg.file.name)}
                              </div>
                            )}
                          </div>
                          <div className={styles.fileInfo}>
                            <div className={styles.fileName}>
                              {getFileIcon(msg.file.name)} {msg.file.name}
                            </div>
                            <div className={styles.fileSize}>
                              {formatFileSize(msg.file.size)}
                            </div>
                            <button
                              onClick={() => handleDownloadFile(msg.file)}
                              className={styles.fileDownloadButton}
                            >
                              ⬇️ 다운로드
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.chatInputWrapper}>
            {/* 파일 선택 미리보기 */}
            {selectedFile && (
              <div className={styles.filePreviewBar}>
                <div className={styles.filePreviewInfo}>
                  <span className={styles.filePreviewIcon}>
                    {getFileIcon(selectedFile.name)}
                  </span>
                  <div className={styles.filePreviewText}>
                    <div className={styles.filePreviewName}>{selectedFile.name}</div>
                    <div className={styles.filePreviewSize}>
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
                <div className={styles.filePreviewActions}>
                  <button
                    type="button"
                    onClick={handleSendFile}
                    disabled={isUploading}
                    className={styles.fileSendButton}
                  >
                    {isUploading ? '전송 중...' : '📤 전송'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    disabled={isUploading}
                    className={styles.fileCancelButton}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* 채팅 입력 */}
            <form onSubmit={handleSendMessage} className={styles.chatInput}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.fileAttachButton}
                title="파일 첨부"
              >
                📎
              </button>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className={styles.chatInputField}
                disabled={!!selectedFile}
              />
              <button
                type="submit"
                className={styles.chatSendButton}
                disabled={!!selectedFile}
              >
                전송
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* 하단 컨트롤 바 */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isSharingScreen={isSharingScreen}
        callDuration={formatDuration(callDuration)}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onShareScreen={handleShareScreen}
        onSettings={() => setIsSettingsOpen(true)}
        onLeave={handleLeaveCall}
      />

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
      />

      {/* 에러 표시 */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}
    </div>
  );
}
