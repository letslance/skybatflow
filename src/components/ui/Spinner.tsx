import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: number
  className?: string
}

export default function Spinner({ size = 20, className }: SpinnerProps) {
  return <Loader2 size={size} className={cn('animate-spin text-tx-muted', className)} />
}

/** Full-page or full-container centered loading state */
export function SpinnerOverlay({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-tx-muted">
      <Loader2 size={28} className="animate-spin text-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
