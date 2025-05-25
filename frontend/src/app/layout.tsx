import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const paperlogy = localFont({
  src: '../../public/fonts/Paperlogy-4Regular.ttf',
  display: 'swap',
  variable: '--font-paperlogy',
})

export const metadata: Metadata = {
  title: 'Vibe Editor',
  description: 'AI로 작성하는 기술 블로그 VSCode Extension',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={paperlogy.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
          {children}
      </body>
    </html>
  )
}
