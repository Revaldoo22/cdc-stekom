import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import { websiteSchema, organizationSchema } from '@/lib/schema'
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
    default: 'CDC Universitas Stekom, Portal Karir Terpercaya',
    template: '%s | CDC Universitas Stekom',
  },
  description:
    'Career Development Center Universitas STEKOM. Temukan lowongan kerja, magang, dan event rekrutmen terbaik. Gratis untuk semua pencari kerja.',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'CDC Universitas Stekom',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        {/* Strip attributes injected by Bank Islam (BIS) browser extension before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var ATTRS=['bis_skin_checked','bis_use'];function strip(n){if(!n||!n.removeAttribute)return;ATTRS.forEach(function(a){n.removeAttribute(a)});if(n.querySelectorAll)n.querySelectorAll('[bis_skin_checked],[bis_use]').forEach(function(e){ATTRS.forEach(function(a){e.removeAttribute(a)})})}strip(document.documentElement);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(strip);if(m.type==='attributes'&&ATTRS.indexOf(m.attributeName)>-1)m.target.removeAttribute(m.attributeName)})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['bis_skin_checked','bis_use']})})()` }} />
        <JsonLd schema={websiteSchema()} />
        <JsonLd schema={organizationSchema()} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
