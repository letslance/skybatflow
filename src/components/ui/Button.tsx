'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger'
  size?: 'default' | 'sm'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5',
        variant === 'primary' && 'btn-primary',
        variant === 'outline' && 'btn-outline',
        variant === 'danger'  && 'btn-danger',
        size === 'sm'         && 'btn-sm',
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  )
}
