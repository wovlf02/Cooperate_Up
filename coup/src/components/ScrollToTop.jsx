// src/components/ScrollToTop.jsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 경로가 변경될 때마다 스크롤을 최상단으로 이동
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 즉시 이동 (부드럽게 이동하려면 'smooth' 사용)
    });

    // body와 html의 스크롤도 초기화
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

