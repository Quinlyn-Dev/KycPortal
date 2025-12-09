import React from 'react'

type Props = {
  onClick?: () => void
  title?: string
  ariaLabel?: string
  variant?: 'default' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
  label?: string
}

export default function ActionButton({ onClick, title, ariaLabel, variant = 'default', size = 'sm', icon, label }: Props) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: size === 'sm' ? '0.35rem 0.6rem' : '0.6rem 0.9rem',
    boxShadow: '0 1px 0 rgba(2,6,23,0.04)'
  }

  const variants: Record<string, React.CSSProperties> = {
    default: { border: '1px solid #c7e6ff', background: '#ffffff', color: '#0366d6' },
    danger: { border: '1px solid #f5c6cb', background: '#fff5f5', color: '#b91c1c' },
    ghost: { border: '1px solid transparent', background: 'transparent', color: 'var(--text-primary)', boxShadow: 'none' }
  }

  const style = { ...base, ...(variants[variant] || variants.default) }

  return (
    <button onClick={onClick} title={title} aria-label={ariaLabel} style={style}>
      {icon}
      {label && <span style={{ lineHeight: 1 }}>{label}</span>}
    </button>
  )
}
