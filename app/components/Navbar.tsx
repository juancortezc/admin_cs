/**
 * Navbar estilo Apple
 * - Compacto y elegante (h-14)
 * - Backdrop blur translúcido
 * - Border inferior sutil
 * - Desktop: tabs horizontales con hover suave
 * - Mobile: hamburguesa con drawer desde la derecha
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type NavbarProps = {
  activeTab?: 'Calendario' | 'Cobros' | 'Pagos' | 'Caja' | 'Mantenimiento' | 'Espacios' | 'Arrendatarios'
}

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const tabs = [
    { nombre: 'Calendario', ruta: '/calendario' },
    { nombre: 'Cobros', ruta: '/cobros' },
    { nombre: 'Pagos', ruta: '/pagos' },
    { nombre: 'Caja', ruta: '/caja' },
    { nombre: 'Mantenimiento', ruta: '/mantenimiento' },
    { nombre: 'Espacios', ruta: '/espacios' },
    { nombre: 'Arrendatarios', ruta: '/arrendatarios' },
  ]

  const handleNavegar = (ruta: string) => {
    setMenuAbierto(false)
    router.push(ruta)
  }

  return (
    <>
      {/* Navbar con backdrop blur */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo/Título */}
            <button
              onClick={() => handleNavegar('/calendario')}
              className="text-lg font-semibold text-zinc-900 hover:text-[#007AFF] transition-colors tracking-tight"
            >
              Casa del Sol
            </button>

            {/* Desktop Tabs - compactos */}
            <div className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.nombre}
                  onClick={() => handleNavegar(tab.ruta)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.nombre
                      ? 'text-[#007AFF] bg-[#007AFF]/10'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {tab.nombre}
                </button>
              ))}
            </div>

            {/* Mobile Hamburguesa - icono más pequeño */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 active:scale-95 transition-all"
              aria-label="Menu"
            >
              <svg
                className="w-5 h-5 text-zinc-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuAbierto ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          {/* Overlay con fade in */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer desde la derecha */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden animate-in slide-in-from-right duration-300">
            <div className="p-4">
              {/* Header del drawer */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
                <h2 className="text-base font-semibold text-zinc-900">Menú</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 active:scale-95 transition-all"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-5 h-5 text-zinc-700"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links del drawer - compactos */}
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.nombre}
                    onClick={() => handleNavegar(tab.ruta)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.nombre
                        ? 'text-[#007AFF] bg-[#007AFF]/10'
                        : 'text-zinc-700 hover:bg-zinc-100 active:scale-95'
                    }`}
                  >
                    {tab.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
