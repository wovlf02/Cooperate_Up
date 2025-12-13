'use client'

import React from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Card.module.css'

/**
 * Card 컴포넌트
 *
 * @param {Object} props
 * @param {'default'|'elevated'|'outlined'} props.variant - 카드 스타일
 * @param {boolean} props.hoverable - 호버 효과
 * @param {boolean} props.clickable - 클릭 가능
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {React.ReactNode} props.children - 카드 내용
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function Card({
  variant = 'default',
  hoverable = false,
  clickable = false,
  onClick,
  children,
  className,
  ...props
}) {
  const Component = clickable || onClick ? 'button' : 'div'

  const cardClass = clsx(
    styles.card,
    styles[`card--${variant}`],
    {
      [styles['card--hoverable']]: hoverable,
      [styles['card--clickable']]: clickable || onClick,
    },
    className
  )

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Component
      className={cardClass}
      onClick={handleClick}
      type={Component === 'button' ? 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined']),
  hoverable: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

