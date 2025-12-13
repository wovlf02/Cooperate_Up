'use client'

import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Toast.module.css'

export default function Toast({
  type = 'info',
  message,
  title,
  icon,
  duration = 5000,
  onClose,
}) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (duration <= 0) return

    const interval = 50
    const decrement = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement
        if (next <= 0) {
          handleClose()
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration, handleClose])

  const getIcon = () => {
    if (icon) return icon

    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const toastClass = clsx(
    styles.toast,
    styles[`toast--${type}`],
    {
      [styles['toast--exiting']]: isExiting,
    }
  )

  return (
    <div className={toastClass} role="alert">
      <div className={styles.content}>
        <div className={styles.icon}>
          {getIcon()}
        </div>
        <div className={styles.message}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.text}>{message}</div>
        </div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      {duration > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'custom']),
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  icon: PropTypes.node,
  duration: PropTypes.number,
  onClose: PropTypes.func,
}

