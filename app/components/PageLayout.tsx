/**
 * PageLayout - Layout compartido para páginas con subtabs
 * Material Design 3 con header consistente y subtabs pill style
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import MainNavbar from './MainNavbar'

type SubTab = {
  id: string
  nombre: string
  ruta?: string
}

type PageLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
  icon: ReactNode
  activeSection: string
  subtabs?: SubTab[]
  activeSubtab?: string
  onSubtabChange?: (tabId: string) => void
  actions?: ReactNode
}

export default function PageLayout({
  children,
  title,
  subtitle,
  icon,
  activeSection,
  subtabs,
  activeSubtab,
  onSubtabChange,
  actions,
}: PageLayoutProps) {
  const handleSubtabClick = (tab: SubTab) => {
    if (onSubtabChange) {
      onSubtabChange(tab.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <MainNavbar activeSection={activeSection} />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header con Material Design 3 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                {icon}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Subtabs - Pill Style */}
        {subtabs && subtabs.length > 0 && (
          <div className="mb-6">
            <div className="card-elevated bg-white rounded-2xl p-2 inline-flex gap-1 flex-wrap">
              {subtabs.map((tab) => {
                // Si tiene ruta y no hay onSubtabChange, usar Link
                if (tab.ruta && !onSubtabChange) {
                  return (
                    <Link
                      key={tab.id}
                      href={tab.ruta}
                      className={`
                        px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300
                        ${activeSubtab === tab.id
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {tab.nombre}
                    </Link>
                  )
                }

                // Si hay onSubtabChange, usar botón
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSubtabClick(tab)}
                    className={`
                      px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-300
                      ${activeSubtab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200 transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {tab.nombre}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  )
}
