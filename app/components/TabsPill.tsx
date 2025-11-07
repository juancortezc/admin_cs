/**
 * TabsPill Component - Material Design 3
 * Componente reutilizable de tabs con estilo pill
 */

import { ReactNode } from 'react'

type Tab = {
  id: string
  nombre: string
  icon: ReactNode
}

type TabsPillProps = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  size?: 'normal' | 'small'
}

export default function TabsPill({ tabs, activeTab, onTabChange, size = 'normal' }: TabsPillProps) {
  const isSmall = size === 'small'

  return (
    <div className="card-elevated bg-white rounded-2xl p-2 inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            ${isSmall ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'}
            rounded-xl font-semibold transition-all duration-300 flex items-center gap-2
            ${activeTab === tab.id
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {tab.icon}
          <span>{tab.nombre}</span>
        </button>
      ))}
    </div>
  )
}
