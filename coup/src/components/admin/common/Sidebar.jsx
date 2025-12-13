'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Sidebar.module.css'

/**
 * Sidebar 컴포넌트
 *
 * @param {Object} props
 * @param {Array} props.menuItems - 메뉴 항목 배열
 * @param {boolean} props.collapsed - 접힌 상태
 * @param {Function} props.onToggle - 토글 핸들러
 * @param {boolean} props.isMobile - 모바일 여부
 * @param {boolean} props.isOpen - 모바일 열림 상태
 * @param {Function} props.onClose - 모바일 닫기 핸들러
 */
export default function Sidebar({
  menuItems = [],
  collapsed = false,
  onToggle,
  isMobile = false,
  isOpen = false,
  onClose,
}) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState([])

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const hasActiveChild = (item) => {
    if (!item.children) return false
    return item.children.some(child => isActive(child))
  }

  const toggleExpand = (itemId) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isExpanded = (itemId) => expandedItems.includes(itemId)

  const handleItemClick = (item) => {
    if (item.children) {
      toggleExpand(item.id)
    } else if (isMobile) {
      onClose?.()
    }
  }

  const sidebarClass = clsx(
    styles.sidebar,
    {
      [styles['sidebar--collapsed']]: collapsed && !isMobile,
      [styles['sidebar--mobile']]: isMobile,
      [styles['sidebar--mobile-open']]: isMobile && isOpen,
    }
  )

  return (
    <>
      {/* 모바일 오버레이 */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* 사이드바 */}
      <aside className={sidebarClass}>
        {/* 토글 버튼 (데스크톱) */}
        {!isMobile && (
          <button
            className={styles.toggleButton}
            onClick={onToggle}
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={clsx(styles.toggleIcon, {
                [styles['toggleIcon--collapsed']]: collapsed,
              })}
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* 메뉴 리스트 */}
        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {menuItems.map((item) => (
              <li key={item.id || item.href} className={styles.menuItemWrapper}>
                {item.children ? (
                  // 서브메뉴가 있는 경우
                  <>
                    <button
                      className={clsx(styles.menuItem, {
                        [styles['menuItem--active']]: hasActiveChild(item),
                        [styles['menuItem--expanded']]: isExpanded(item.id),
                      })}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.icon && (
                        <span className={styles.icon}>{item.icon}</span>
                      )}
                      {(!collapsed || isMobile) && (
                        <>
                          <span className={styles.label}>{item.label}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={clsx(styles.expandIcon, {
                              [styles['expandIcon--expanded']]: isExpanded(item.id),
                            })}
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* 서브메뉴 */}
                    {isExpanded(item.id) && (!collapsed || isMobile) && (
                      <ul className={styles.submenu}>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={clsx(styles.submenuItem, {
                                [styles['submenuItem--active']]: isActive(child),
                              })}
                              onClick={() => isMobile && onClose?.()}
                            >
                              {child.icon && (
                                <span className={styles.icon}>{child.icon}</span>
                              )}
                              <span className={styles.label}>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  // 일반 메뉴 아이템
                  <Link
                    href={item.href}
                    className={clsx(styles.menuItem, {
                      [styles['menuItem--active']]: isActive(item),
                    })}
                    onClick={() => handleItemClick(item)}
                    title={collapsed && !isMobile ? item.label : undefined}
                  >
                    {item.icon && (
                      <span className={styles.icon}>{item.icon}</span>
                    )}
                    {(!collapsed || isMobile) && (
                      <span className={styles.label}>{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

Sidebar.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      icon: PropTypes.node,
      exact: PropTypes.bool,
      children: PropTypes.array,
    })
  ).isRequired,
  collapsed: PropTypes.bool,
  onToggle: PropTypes.func,
  isMobile: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
}

