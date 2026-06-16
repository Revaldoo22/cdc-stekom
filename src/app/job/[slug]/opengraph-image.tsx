import { ImageResponse } from 'next/og'
import { fetchJobBySlug } from '@/services/jobs.service'
import { SITE_URL } from '@/config/api'

export const alt = 'Lowongan Kerja CDC Universitas Stekom'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await fetchJobBySlug(slug)

  const title    = job?.title    ?? 'Lowongan Kerja'
  const company  = job?.company  ?? 'CDC Universitas Stekom'
  const location = job?.location ?? 'Indonesia'
  const salary   = job?.salary
  const tipe     = job?.employmentType ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#1D4ED8',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '100px',
            padding: '8px 20px',
            width: 'fit-content',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', fontWeight: 600 }}>
            CDC Universitas Stekom, Portal Karir
          </span>
        </div>

        {/* Job title */}
        <div
          style={{
            fontSize: title.length > 40 ? '48px' : '56px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            maxWidth: '900px',
            marginBottom: '20px',
          }}
        >
          {title}
        </div>

        {/* Company */}
        <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', fontWeight: 500 }}>
          {company}
        </div>

        {/* Meta pills row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '8px 20px' }}>
            <span style={{ color: 'white', fontSize: '20px' }}>📍</span>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 500 }}>{location}</span>
          </div>
          {salary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '8px 20px' }}>
              <span style={{ color: 'white', fontSize: '20px' }}>💰</span>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 500 }}>{salary}</span>
            </div>
          )}
          {tipe && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '8px 20px' }}>
              <span style={{ color: 'white', fontSize: '20px' }}>⏱</span>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 500 }}>{tipe}</span>
            </div>
          )}
        </div>

        {/* Bottom: URL watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '72px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {SITE_URL.replace('https://', '')}
        </div>

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '40px',
            bottom: '80px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
