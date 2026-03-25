'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TabItem<K extends string = string> {
  key:   K
  label: string
  icon?: string        // optional Boxicons / FA class
  badge?: string | number
}

interface TabsProps<K extends string> {
  tabs:         TabItem<K>[]
  active:       K
  onChange:     (key: K) => void
  className?:   string
  /** 'underline' = bottom-border style (matches GARUDA7777 modal tabs)
   *  'pill'      = rounded pill buttons
   *  'boxed'     = filled active tab (matches report page tabs) */
  variant?:     'underline' | 'pill' | 'boxed'
}

// ─── Tabs bar ─────────────────────────────────────────────────────────────────
export function Tabs<K extends string>({
  tabs, active, onChange, className, variant = 'underline',
}: TabsProps<K>) {
  return (
    <div
      className={cn(
        'flex flex-wrap',
        variant === 'underline' && 'border-b border-[#3a444c] gap-0',
        variant === 'pill'      && 'gap-2',
        variant === 'boxed'     && 'bg-bg-card rounded gap-1 p-1',
        className,
      )}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              // Underline variant
              variant === 'underline' && [
                'px-4 py-2.5 border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-tx-primary'
                  : 'border-transparent text-tx-muted hover:text-tx-secondary hover:border-[#3a444c]',
              ],
              // Pill variant
              variant === 'pill' && [
                'px-3 py-1.5 rounded-full',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary',
              ],
              // Boxed variant
              variant === 'boxed' && [
                'px-3 py-1.5 rounded',
                isActive
                  ? 'bg-bg-hover text-tx-primary'
                  : 'text-tx-muted hover:text-tx-secondary',
              ],
            )}
          >
            {tab.icon && <i className={tab.icon} style={{ fontSize: 13 }} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'text-2xs px-1.5 py-0.5 rounded-full font-semibold',
                isActive ? 'bg-white/20 text-white' : 'bg-bg-hover text-tx-muted',
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Convenience: controlled Tabs + panel in one component ────────────────────
interface TabPanelProps<K extends string> {
  tabs:       TabItem<K>[]
  defaultTab?: K
  children:   (activeKey: K) => React.ReactNode
  className?: string
  variant?:   TabsProps<K>['variant']
  headerRight?: React.ReactNode
}

export function TabPanel<K extends string>({
  tabs, defaultTab, children, className, variant, headerRight,
}: TabPanelProps<K>) {
  const [active, setActive] = useState<K>(defaultTab ?? tabs[0]?.key)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between">
        <Tabs tabs={tabs} active={active} onChange={setActive} variant={variant} />
        {headerRight && <div className="shrink-0 ml-2">{headerRight}</div>}
      </div>
      <div className="mt-3">
        {children(active)}
      </div>
    </div>
  )
}
