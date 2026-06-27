'use client'

import { useState, type ReactNode } from 'react'

interface SettingsTabsProps {
  account: ReactNode
  outreach: ReactNode
  plan: ReactNode
  danger: ReactNode
}

const tabs = [
  { key: 'account', label: 'Hesap' },
  { key: 'outreach', label: 'Gönderim' },
  { key: 'plan', label: 'Plan' },
  { key: 'danger', label: 'Tehlikeli Bölge' },
] as const

export function SettingsTabs({ account, outreach, plan, danger }: SettingsTabsProps) {
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('account')
  const content = { account, outreach, plan, danger }[active]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {content}
    </div>
  )
}
