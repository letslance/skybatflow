import { cn } from '@/lib/utils'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  className?: string
  disabled?: boolean
}

export default function Checkbox({ id, checked, onChange, label, className, disabled }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        className="accent-primary w-3.5 h-3.5 cursor-pointer"
      />
      {label && (
        <span className="text-xs text-tx-secondary">{label}</span>
      )}
    </label>
  )
}
