// src/components/Providers.js
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SocketProvider } from '@/contexts/SocketContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ToastProvider } from '@/components/admin/ui/Toast'
import AuthSessionProvider from '@/lib/session-provider'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        cacheTime: 5 * 60 * 1000, // 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <SocketProvider>
            <ToastProvider position="top-right">
              {children}
            </ToastProvider>
          </SocketProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </AuthSessionProvider>
  )
}
