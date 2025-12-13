import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminRole } from '@/lib/admin/auth'
import AdminNavbar from '@/components/admin/common/AdminNavbar'
import Breadcrumb from '@/components/admin/common/Breadcrumb'
import styles from './layout.module.css'

export const metadata = {
  title: 'CoUp 관리자',
  description: 'CoUp 플랫폼 관리자 페이지'
}

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin')
  }

  // 관리자 권한 확인
  const adminRole = await getAdminRole(session.user.id)

  if (!adminRole) {
    redirect('/unauthorized')
  }

  return (
    <div className={styles.adminLayout}>
      <header className={styles.navbar}>
        <AdminNavbar user={session.user} adminRole={adminRole} />
      </header>

      <div className={styles.mainContent}>
        <div className={styles.breadcrumbContainer}>
          <Breadcrumb />
        </div>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

