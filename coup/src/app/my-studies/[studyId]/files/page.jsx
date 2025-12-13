// 내 스터디 파일 관리 페이지
'use client';

import { use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useStudy, useFiles, useUploadFile, useDeleteFile } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

export default function MyStudyFilesPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('전체');

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: filesData, isLoading: filesLoading, refetch } = useFiles(studyId);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();

  const study = studyData?.data;
  const files = filesData?.data || [];

  // 파일 확장자 추출 함수
  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1].toLowerCase();
  };

  // 파일 확장자 기준 카테고리 분류 함수
  const getFileCategory = (file) => {
    const ext = getFileExtension(file.name);

    // 문서 확장자
    const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp', 'hwpx', 'rtf', 'odt', 'ods', 'odp', 'csv'];
    if (docExtensions.includes(ext)) return '문서';

    // 이미지 확장자
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif', 'heic', 'heif'];
    if (imageExtensions.includes(ext)) return '이미지';

    // 압축 파일 확장자
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'];
    if (archiveExtensions.includes(ext)) return '압축';

    return '기타';
  };

  // 필터링된 파일 목록
  const filteredFiles = activeFilter === '전체'
    ? files
    : files.filter(file => getFileCategory(file) === activeFilter);

  // 각 카테고리별 파일 수
  const fileCounts = {
    전체: files.length,
    문서: files.filter(f => getFileCategory(f) === '문서').length,
    이미지: files.filter(f => getFileCategory(f) === '이미지').length,
    압축: files.filter(f => getFileCategory(f) === '압축').length,
    기타: files.filter(f => getFileCategory(f) === '기타').length,
  };


  const getFileIcon = (type) => {
    if (!type) return '📄';
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleFileUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    for (const file of fileList) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        await uploadFileMutation.mutateAsync({
          studyId,
          formData
        });

        console.log(`파일 업로드 성공: ${file.name}`);
      } catch (error) {
        console.error(`파일 업로드 실패 (${file.name}):`, error);
        alert(`파일 업로드 실패 (${file.name}): ${error.message}`);
      }
    }

    // 파일 업로드 완료 후 목록 새로고침
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f) => f.id));
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!confirm(`${fileName} 파일을 삭제하시겠습니까?`)) return;

    try {
      await deleteFileMutation.mutateAsync({ studyId, fileId });
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      await refetch();
    } catch (error) {
      alert('파일 삭제 실패: ' + error.message);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
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
      <StudyTabs studyId={studyId} activeTab="파일" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 파일 목록 */}
        <div className={styles.fileSection}>
          {/* 파일 헤더 */}
          <div className={styles.fileHeader}>
            <h2 className={styles.fileTitle}>📁 파일 관리</h2>
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending}
            >
              {uploadFileMutation.isPending ? '⏳ 업로드 중...' : '⬆️ 파일 업로드'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            />
          </div>

          {/* 필터 탭 */}
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              {['전체', '문서', '이미지', '압축', '기타'].map((filter) => (
                <button
                  key={filter}
                  className={`${styles.filterTab} ${
                    activeFilter === filter ? styles.active : ''
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter} ({fileCounts[filter]})
                </button>
              ))}
            </div>
          </div>

          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropZoneContent}>
              <span className={styles.dropZoneIcon}>⬆️</span>
              <p className={styles.dropZoneText}>
                {isDragging ? '파일을 놓으세요' : '파일을 드래그하거나 클릭하세요'}
              </p>
              <p className={styles.dropZoneHint}>
                지원 형식: 모든 파일 (최대 50MB)
              </p>
            </div>
          </div>

          {/* 파일 목록 */}
          <div className={styles.fileListSection}>
            <div className={styles.fileListHeader}>
              <h3 className={styles.sectionLabel}>📄 파일 ({filteredFiles.length})</h3>
            </div>

            {filesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>파일 로딩 중...</div>
            ) : filteredFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                {activeFilter === '전체' ? '첫 파일을 업로드해보세요! 📤' : `${activeFilter} 파일이 없습니다.`}
              </div>
            ) : (
              <>
                {/* 테이블 헤더 */}
                <div className={styles.tableHeader}>
                  <div className={styles.tableCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                  <div className={styles.tableName}>이름</div>
                  <div className={styles.tableSize}>크기</div>
                  <div className={styles.tableUploader}>업로더</div>
                  <div className={styles.tableDate}>날짜</div>
                  <div className={styles.tableActions}>액션</div>
                </div>

                {/* 파일 행 */}
                {filteredFiles.map((file) => (
                  <div key={file.id} className={styles.fileRow}>
                    <div className={styles.fileCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                      />
                    </div>
                    <div className={styles.fileName}>
                      <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                      <div className={styles.fileNameText}>
                        <span className={styles.fileNameMain}>{file.name}</span>
                      </div>
                    </div>
                    <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                    <div className={styles.fileUploader}>
                      {file.uploader?.name || '알 수 없음'}
                    </div>
                    <div className={styles.fileDate}>{formatDate(file.createdAt)}</div>
                    <div className={styles.fileActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        다운로드
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDeleteFile(file.id, file.name)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 선택된 파일 액션 */}
          {selectedFiles.length > 0 && (
            <div className={styles.selectedActions}>
              <span className={styles.selectedCount}>
                선택된 파일 ({selectedFiles.length}개):
              </span>
              <button
                className={styles.bulkActionBtn}
                onClick={() => {
                  if (confirm(`${selectedFiles.length}개 파일을 삭제하시겠습니까?`)) {
                    selectedFiles.forEach(fileId => {
                      const file = files.find(f => f.id === fileId);
                      if (file) handleDeleteFile(fileId, file.name);
                    });
                  }
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <button
                className={styles.widgetButton}
                onClick={() => fileInputRef.current?.click()}
              >
                📤 업로드
              </button>
            </div>
          </div>

          {/* 통계 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 파일 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>전체 파일:</span>
                <span className={styles.statValue}>{files.length}개</span>
              </div>
              <div className={styles.statRow}>
                <span>총 용량:</span>
                <span>{formatFileSize(files.reduce((sum, f) => sum + (f.size || 0), 0))}</span>
              </div>
            </div>
          </div>

          {/* 최근 파일 */}
          {files.length > 0 && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>📁 최근 파일</h3>
              <div className={styles.widgetContent}>
                {files.slice(0, 3).map((file) => (
                  <div key={file.id} className={styles.recentFile}>
                    <span className={styles.recentFileIcon}>{getFileIcon(file.type)}</span>
                    <div className={styles.recentFileInfo}>
                      <div className={styles.recentFileName}>{file.name}</div>
                      <div className={styles.recentFileTime}>{formatDate(file.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 팁 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 팁</h3>
            <div className={styles.widgetContent}>
              <p className={styles.tipText}>
                • 드래그&드롭으로 빠른 업로드
              </p>
              <p className={styles.tipText}>
                • 최대 50MB 파일 업로드 가능
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
