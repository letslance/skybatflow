import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subvalue?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  valueClassName?: string
}

export default function StatCard({
  label, value, subvalue, icon, trend, className, valueClassName,
}: StatCardProps) {
  return (
    <div className={cn('card px-4 py-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-[11px] text-tx-muted uppercase tracking-wide font-medium mb-1">
            {label}
          </div>
          <div className={cn('text-xl font-bold text-tx-primary', valueClassName)}>
            {value}
          </div>
          {subvalue && (
            <div className={cn(
              'text-[11px] mt-1',
              trend === 'up'   ? 'text-win' :
              trend === 'down' ? 'text-loss' : 'text-tx-muted'
            )}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''} {subvalue}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-bg-hover text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
