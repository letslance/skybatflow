import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// ─── FormLabel ────────────────────────────────────────────────────────────────
interface FormLabelProps {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
  className?: string
  style?: React.CSSProperties
}

export function FormLabel({ children, required, htmlFor, className, style }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-tx-secondary mb-1', className)}
      style={style}
    >
      {children}
      {required && <span className="text-loss ml-0.5">*</span>}
    </label>
  )
}

// ─── FormError ────────────────────────────────────────────────────────────────
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-loss mt-1">{message}</p>
}

// ─── FormField: label + input/select/children + error ────────────────────────
interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
  /** Two-column layout: label on left ~200px, field on right (matches GARUDA7777 form rows) */
  horizontal?: boolean
  labelWidth?: number
}

export function FormField({
  label, required, error, htmlFor, children, className, horizontal, labelWidth = 200,
}: FormFieldProps) {
  if (horizontal) {
    return (
      <div className={cn('flex items-start gap-4 mb-4 flex-wrap', className)}>
        {label && (
          <FormLabel
            htmlFor={htmlFor}
            required={required}
            className={cn('mt-1.5 mb-0 shrink-0')}
            style={{ width: labelWidth, minWidth: 120 }}
          >
            {label}
          </FormLabel>
        )}
        <div className="flex-1 min-w-[160px]">
          {children}
          <FormError message={error} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <FormLabel htmlFor={htmlFor} required={required}>{label}</FormLabel>
      )}
      {children}
      <FormError message={error} />
    </div>
  )
}

// ─── Input (dark-themed, forwards ref) ───────────────────────────────────────
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'input',
        error && 'border-loss focus:border-loss',
        className,
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'select',
        error && 'border-loss focus:border-loss',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

// ─── Textarea ─────────────────────────────────────────────────────────────────
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'input resize-y',
        error && 'border-loss focus:border-loss',
        className,
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
