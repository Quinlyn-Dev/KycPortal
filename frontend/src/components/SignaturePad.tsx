import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  value?: string
  onChange: (signature: string) => void
  label: string
  width?: number
  height?: number
}

export const SignaturePad = ({ value, onChange, label, width = 400, height = 150 }: SignaturePadProps) => {
  const sigPadRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    if (value && sigPadRef.current && sigPadRef.current.isEmpty()) {
      try {
        sigPadRef.current.fromDataURL(value)
      } catch (e) {
        console.error('Failed to load signature:', e)
      }
    }
  }, [value])

  const handleClear = () => {
    sigPadRef.current?.clear()
    onChange('')
  }

  const handleEnd = () => {
    if (sigPadRef.current) {
      const dataUrl = sigPadRef.current.toDataURL()
      onChange(dataUrl)
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: 600, 
        color: '#374151',
        fontSize: '0.875rem'
      }}>
        {label}
      </label>
      <div style={{ 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        display: 'inline-block'
      }}>
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width,
            height,
            style: { 
              display: 'block',
              touchAction: 'none'
            }
          }}
          backgroundColor="white"
          penColor="black"
          onEnd={handleEnd}
        />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          🗑️ Clear Signature
        </button>
      </div>
    </div>
  )
}
