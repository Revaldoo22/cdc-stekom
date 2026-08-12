'use client'

import { useEffect } from 'react'

const EMBED_SCRIPT_SRC = 'https://www.instagram.com/embed.js'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

interface InstagramEmbedProps {
  /** URL permalink post, mis. https://www.instagram.com/p/DbsE_8RJUCG/ */
  url: string
}

/**
 * Embed post Instagram memakai markup resmi (blockquote + embed.js).
 *
 * Pola ini menyalin implementasi yang sudah terbukti jalan di
 * pmb.stekom.ac.id (octane-laravel-inertia-pmb, Promo/hooks.ts): script dimuat
 * manual lalu `instgrm.Embeds.process()` dipanggil untuk merender blockquote.
 *
 * Dipilih dibanding iframe `/embed` karena script resmi mengukur tinggi post
 * secara otomatis, jadi caption panjang tidak terpotong.
 *
 * Butuh pelonggaran CSP di next.config.ts (`script-src` + `frame-src` ke
 * www.instagram.com) — tanpa itu embed diblokir browser dan hanya tersisa link.
 */
export function InstagramEmbed({ url }: InstagramEmbedProps) {
  useEffect(() => {
    // Script sudah dimuat oleh embed lain / navigasi sebelumnya: cukup render ulang.
    if (window.instgrm) {
      window.instgrm.Embeds.process()
      return
    }

    const script = document.createElement('script')
    script.src = EMBED_SCRIPT_SRC
    script.async = true
    script.onload = () => window.instgrm?.Embeds.process()
    document.body.appendChild(script)
    // Script sengaja tidak dihapus saat unmount: instgrm di-cache global dan
    // dipakai lagi kalau user kembali ke halaman event.
  }, [url])

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ maxWidth: '100%', width: '100%', margin: 0 }}
    >
      {/* Terlihat sebelum embed.js selesai memproses, atau kalau script diblokir. */}
      <div className="p-4">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cta">
          Lihat postingan ini di Instagram
        </a>
      </div>
    </blockquote>
  )
}
