'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './StatCard.module.css'

/**
 * StatCard 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.title - 카드 제목
 * @param {number} props.value - 현재 값
 * @param {number} props.previousValue - 이전 값 (트렌드 계산용)
 * @param {string} props.unit - 단위 (명, 개, % 등)
 * @param {React.ReactNode} props.icon - 아이콘
 * @param {string} props.iconColor - 아이콘 색상 (primary, success, warning, danger, info)
 * @param {boolean} props.countUp - 카운트업 애니메이션
 * @param {number} props.duration - 카운트업 애니메이션 지속시간 (ms)
 * @param {boolean} props.loading - 로딩 상태
 * @param {Function} props.onClick - 클릭 핸들러
 */
export default function StatCard({
  title,
  value = 0,
  previousValue,
  unit = '',
  icon,
  iconColor = 'primary',
  countUp = true,
  duration = 1000,
  loading = false,
  onClick,
}) {
  const [displayValue, setDisplayValue] = useState(countUp ? 0 : value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const cardRef = useRef(null)

  // 애니메이션 함수
  const animateValue = useCallback((start, end, animDuration) => {
    const startTime = performance.now()
    const difference = end - start

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animDuration, 1)

      // easeOutQuad
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = start + difference * easeProgress

      setDisplayValue(Math.round(current))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  // 카운트업 애니메이션
  useEffect(() => {
    if (!countUp || hasAnimated || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true)
          animateValue(0, value, duration)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [countUp, value, duration, hasAnimated, loading, animateValue])

  // 값이 변경될 때
  useEffect(() => {
    if (!countUp || !hasAnimated) {
      setDisplayValue(value)
    } else if (hasAnimated) {
      animateValue(displayValue, value, duration)
    }
  }, [value, countUp, hasAnimated, displayValue, duration, animateValue])

  // 트렌드 계산
  const trend = previousValue !== undefined && previousValue !== 0
    ? ((value - previousValue) / previousValue) * 100
    : null

  const trendDirection = trend !== null
    ? trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral'
    : null

  const cardClass = clsx(
    styles.card,
    {
      [styles['card--clickable']]: onClick,
      [styles['card--loading']]: loading,
    }
  )

  const iconClass = clsx(
    styles.icon,
    styles[`icon--${iconColor}`]
  )

  return (
    <div
      ref={cardRef}
      className={cardClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.skeleton}>
            <div className={styles.skeletonIcon}></div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonValue}></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            {icon && (
              <div className={iconClass}>
                {icon}
              </div>
            )}
            <h3 className={styles.title}>{title}</h3>
          </div>

          <div className={styles.body}>
            <div className={styles.valueWrapper}>
              <span className={styles.value}>
                {displayValue.toLocaleString()}
              </span>
              {unit && (
                <span className={styles.unit}>{unit}</span>
              )}
            </div>

            {trend !== null && (
              <div className={clsx(
                styles.trend,
                styles[`trend--${trendDirection}`]
              )}>
                {trendDirection === 'up' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
                  </svg>
                ) : trendDirection === 'down' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                ) : null}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  previousValue: PropTypes.number,
  unit: PropTypes.string,
  icon: PropTypes.node,
  iconColor: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  countUp: PropTypes.bool,
  duration: PropTypes.number,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
}

