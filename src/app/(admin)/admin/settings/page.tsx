'use client'

import PageHeader from '@/components/ui/PageHeader'
import Link from 'next/link'
import { Globe, Activity, BarChart3, Wrench } from 'lucide-react'

const SETTING_CARDS = [
  {
    href:  '/admin/settings/global',
    icon:  <Globe size={20} />,
    title: 'Global Settings',
    desc:  'Site title, announcement, social links, sign-up toggle, maintenance mode, default stake limits',
  },
  {
    href:  '/admin/settings/sports',
    icon:  <Activity size={20} />,
    title: 'Sport Settings',
    desc:  'Per-sport enable/disable, min/max bet, odds delay, inplay bet delay',
  },
  {
    href:  '/admin/markets',
    icon:  <BarChart3 size={20} />,
    title: 'Market Settings',
    desc:  'Suspend, settle and manage markets by event. Navigate to Markets → Events.',
  },
  {
    href:  '/admin/settings/platform',
    icon:  <Wrench size={20} />,
    title: 'Platform Config',
    desc:  'Odds provider, casino provider, maintenance toggles, odds change tolerance',
  },
]

export default function SettingsHubPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETTING_CARDS.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="card p-5 hover:border-primary/40 border border-transparent transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="text-primary mt-0.5">{card.icon}</div>
              <div>
                <div className="text-sm font-semibold text-tx-primary group-hover:text-primary transition-colors mb-1">
                  {card.title}
                </div>
                <div className="text-[12px] text-tx-muted leading-relaxed">{card.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
