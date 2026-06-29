import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#06080F',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(34,211,238,0.35), transparent 50%), radial-gradient(circle at 85% 85%, rgba(37,99,235,0.35), transparent 50%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #22D3EE, #2563EB)',
              fontSize: 30,
              fontWeight: 700,
              color: '#06080F',
            }}
          >
            G
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>Google Business Data</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 64, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15, maxWidth: 980 }}>
          Google Maps&apos;ten satışa hazır lead çıkar.
        </div>

        <div style={{ display: 'flex', marginTop: 28, fontSize: 28, color: '#94A3B8', maxWidth: 880 }}>
          Tara, filtrele, kişiselleştirilmiş WhatsApp/e-posta ile satışa dönüştür.
        </div>
      </div>
    ),
    { ...size }
  )
}
