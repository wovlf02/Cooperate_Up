'use client'

import React from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Card.module.css'

/**
 * CardContent 컴포넌트
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 콘텐츠 내용
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx(styles.cardContent, className)} {...props}>
      {children}
    </div>
  )
}

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

