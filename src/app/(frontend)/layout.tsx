import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/data'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: 'Статьи, новости, книги и материалы для скачивания Библейского общества Казахстана.',
  openGraph: { siteName: SITE_NAME, locale: 'ru_RU', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">{SITE_NAME}</Link>
          <nav>
            <Link href="/articles">Статьи</Link>
            <Link href="/news">Новости</Link>
            <Link href="/books">Книги</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">© {new Date().getFullYear()} {SITE_NAME}</footer>
      </body>
    </html>
  )
}
