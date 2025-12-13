'use client'

import Link from 'next/link'
import styles from '../AdminNavbar.module.css'

export default function DesktopMenu({ menuItems, isActive }) {
  return (
    <ul className={styles.desktopMenu}>
      {menuItems.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`${styles.menuItem} ${
              isActive(item) ? styles.active : ''
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

