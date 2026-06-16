import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { websiteSchema } from '@/lib/schema'
import { SITE_URL } from '@/config/api'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CDC Stekom — Portal Karir Mahasiswa & Alumni',
    template: '%s | CDC Stekom',
  },
  description:
    'Career Development Center Universitas STEKOM — temukan lowongan kerja, magang, dan event rekrutmen terbaik untuk mahasiswa dan alumni Stekom.',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'CDC Stekom',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <head>
        <JsonLd schema={websiteSchema()} />
      </head>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
