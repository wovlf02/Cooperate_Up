'use client';

import { useMemo } from 'react';
import styles from './MarkdownRenderer.module.css';

/**
 * 마크다운 텍스트를 HTML로 변환하는 컴포넌트
 *
 * 지원하는 마크다운 문법:
 * - 제목: # H1, ## H2, ### H3
 * - 굵게: **bold** 또는 __bold__
 * - 기울임: *italic* 또는 _italic_
 * - 링크: [텍스트](URL)
 * - 이미지: ![alt](URL)
 * - 코드: `inline code` 또는 ```code block```
 * - 리스트: - 또는 * (unordered), 1. (ordered)
 * - 인용: > quote
 * - 수평선: --- 또는 ***
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const htmlContent = useMemo(() => {
    if (!content) return '';

    let html = content;

    // 코드 블록 (```) - 먼저 처리하여 내부가 변환되지 않도록
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // 인라인 코드 (`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 제목 (# ## ###)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 굵게 (**text** 또는 __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // 기울임 (*text* 또는 _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 이미지 (![alt](url))
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // 링크 ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // 수평선 (---, ***)
    html = html.replace(/^---$/gm, '<hr />');
    html = html.replace(/^\*\*\*$/gm, '<hr />');

    // 인용문 (> text)
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // 순서 없는 리스트 (- item 또는 * item)
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 순서 있는 리스트 (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // 이미 ul로 감싸지지 않은 li만 ol로 감싸기
    html = html.replace(/(?<!<ul>)(<li>.*<\/li>\n?)+(?!<\/ul>)/g, '<ol>$&</ol>');

    // 문단 처리 (빈 줄로 구분)
    const lines = html.split('\n');
    const processed = [];
    let inParagraph = false;
    let inList = false;
    let inBlockquote = false;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 코드 블록 감지
      if (line.startsWith('<pre>')) inCodeBlock = true;
      if (line.endsWith('</pre>')) {
        processed.push(lines[i]);
        inCodeBlock = false;
        continue;
      }
      if (inCodeBlock) {
        processed.push(lines[i]);
        continue;
      }

      // 리스트 감지
      if (line.startsWith('<ul>') || line.startsWith('<ol>')) inList = true;
      if (line.endsWith('</ul>') || line.endsWith('</ol>')) {
        processed.push(lines[i]);
        inList = false;
        continue;
      }
      if (inList) {
        processed.push(lines[i]);
        continue;
      }

      // 인용문 감지
      if (line.startsWith('<blockquote>')) inBlockquote = true;
      if (line.endsWith('</blockquote>')) {
        processed.push(lines[i]);
        inBlockquote = false;
        continue;
      }
      if (inBlockquote) {
        processed.push(lines[i]);
        continue;
      }

      // 제목, 수평선, 이미지는 p 태그로 감싸지 않음
      if (
        line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<h3>') ||
        line.startsWith('<hr') || line.startsWith('<img')
      ) {
        if (inParagraph) {
          processed.push('</p>');
          inParagraph = false;
        }
        processed.push(lines[i]);
        continue;
      }

      // 빈 줄
      if (line === '') {
        if (inParagraph) {
          processed.push('</p>');
          inParagraph = false;
        }
        continue;
      }

      // 일반 텍스트
      if (!inParagraph) {
        processed.push('<p>');
        inParagraph = true;
      }
      processed.push(lines[i]);
    }

    // 마지막 p 태그 닫기
    if (inParagraph) {
      processed.push('</p>');
    }

    return processed.join('\n');
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <div
      className={`${styles.markdown} ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

/**
 * HTML 특수 문자를 이스케이프 처리
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

