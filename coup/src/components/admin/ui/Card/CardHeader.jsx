'use client'

import React from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Card.module.css'

/**
 * CardHeader 컴포넌트
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 헤더 내용
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx(styles.cardHeader, className)} {...props}>
      {children}
    </div>
  )
}

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

