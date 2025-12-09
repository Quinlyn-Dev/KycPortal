import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Toast = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

type ToastContextType = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const toast: Toast = { id, ...t }
    console.log('[Toast] push', toast)
    setToasts((s) => [...s, toast])
    // auto remove after 4s
    setTimeout(() => remove(id), 4000)
  }

  const remove = (id: string) => {
    setToasts((s) => s.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  )
}

export default ToastContext
