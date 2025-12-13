import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { Providers } from '@/components/Providers'
import ScrollToTop from '@/components/ScrollToTop'
import { ToastContainer } from 'react-toastify'

export const metadata = {
  title: "CoUp - 함께, 더 높이",
  description: "당신의 성장을 위한 스터디 허브",
  keywords: "스터디, 스터디 그룹, 온라인 스터디, 학습, 성장",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <ScrollToTop />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
      </body>
    </html>
  );
}
