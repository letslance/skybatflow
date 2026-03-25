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
      <head>
        {/* Boxicons — sidebar icons */}
        <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
        {/* Material Design Icons — casino menu icons */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
        {/* Font Awesome 5 — misc icons */}
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" />
      </head>
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
