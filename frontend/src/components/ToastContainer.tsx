import React from 'react'
import { useToast } from '../context/ToastContext'

export default function ToastContainer() {
  const { toasts, remove } = useToast()
  console.log('[Toast] render, toasts:', toasts)

  return (
    <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ minWidth: 280, padding: '0.75rem 1rem', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: t.type === 'success' ? 'linear-gradient(135deg,#ecfdf5,#bbf7d0)' : t.type === 'error' ? 'linear-gradient(135deg,#fff1f2,#fecaca)' : 'linear-gradient(135deg,#eff6ff,#bfdbfe)'}}>
          <div style={{ color: t.type === 'success' ? '#065f46' : t.type === 'error' ? '#7f1d1d' : '#1e3a8a', fontWeight: 700 }}>
            {t.message}
          </div>
          <button onClick={() => remove(t.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.4)', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      ))}
    </div>
  )
}
