// src/app/layout.tsx
import { Metadata } from 'next'

import { ClientProvider } from '@/providers/clientProvider'
import { fontVariables } from '@/styles/fonts'

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="manifest"
          href="/manifest.webmanifest"
        />
      </head>
      <body className={fontVariables}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'Vibe Editor',
  description: 'AI로 작성하는 기술 블로그 VSCode Extension',
}
