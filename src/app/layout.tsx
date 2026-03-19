import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'BetPlatform',
  description: 'Online Betting Exchange',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2d353b',
              color: '#e0e6ea',
              border: '1px solid #3a444c',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#03b37f', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#e04b4b', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
