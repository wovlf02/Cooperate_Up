import { getSession } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }

  // 클라이언트에서 데이터를 가져오도록 변경
  return (
    <DashboardClient 
      user={session.user}
    />
  )
}
