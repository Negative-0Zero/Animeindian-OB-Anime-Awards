import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AnimeIndian Awards',
  description: 'The biggest community-driven anime awards. Vote for your favorites!',
  openGraph: {
    title: 'AnimeIndian Awards',
    description: 'Celebrating the best of Indian anime fandom.',
    url: 'https://animeindian-awards.page.dev',
    siteName: 'AnimeIndian Awards',
    images: [
      {
        url: '/Share.png',        // Your social sharing image
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeIndian Awards',
    description: 'Vote now for the best anime of the season!',
    images: ['/Share.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon for modern browsers (SVG) */}
        <link rel="icon" type="image/svg+xml" href="/icon0.svg" />
        {/* Fallback PNG favicon */}
        <link rel="icon" type="image/png" href="/icon1.png" />
        {/* Classic favicon.ico (some browsers still use it) */}
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Apple Touch Icon for iOS home screen */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
