import { ImageResponse } from 'next/og'

export const alt = 'CDC Universitas Stekom, Portal Karir Terpercaya'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1D4ED8',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', left: '-100px', top: '-100px', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: '-60px', bottom: '-60px', width: '350px', height: '350px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 1 }}>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '100px',
              padding: '10px 28px',
              fontSize: '20px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            Career Development Center
          </div>

          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
              textAlign: 'center',
            }}
          >
            CDC Universitas Stekom
          </div>

          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            Portal Karir Resmi Universitas STEKOM
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '8px' }}>
            {[
              { n: '500+', label: 'Lowongan Aktif' },
              { n: '100+', label: 'Perusahaan Mitra' },
              { n: '5 Kota', label: 'Seluruh Indonesia' },
            ].map(({ n, label }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>{n}</span>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
