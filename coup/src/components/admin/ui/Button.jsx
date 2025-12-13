'use client'

import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass = styles[variant] || styles.primary
  const sizeClass = styles[size] || styles.medium

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${styles.button}
        ${variantClass}
        ${sizeClass}
        ${fullWidth ? styles.fullWidth : ''}
        ${loading ? styles.loading : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M14 8C14 4.68629 11.3137 2 8 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}

