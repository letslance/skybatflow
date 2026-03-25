import { cn } from '@/lib/utils'

interface ToggleProps {
  value: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * iOS-style toggle switch.
 * Matches GARUDA7777's bet-lock / user-lock toggles.
 */
export default function Toggle({ value, onChange, disabled, size = 'md', className }: ToggleProps) {
  const w = size === 'sm' ? 36 : 42
  const h = size === 'sm' ? 20 : 22
  const d = size === 'sm' ? 14 : 18
  const off = 2
  const on  = w - d - off

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!value)}
      className={cn(
        'relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none',
        value   ? 'bg-primary' : 'bg-bg-hover',
        disabled && 'opacity-50 cursor-default',
        !disabled && 'cursor-pointer',
        className,
      )}
      style={{ width: w, height: h }}
    >
      <span
        className="absolute top-0 rounded-full bg-white shadow transition-all duration-200"
        style={{
          width: d, height: d,
          top: off, left: value ? on : off,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}
