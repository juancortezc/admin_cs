/**
 * Navbar reorganizado con tabs principales y subtabs
 * - Espacios: Calendario, Cobros, Arrendatarios, Espacios
 * - Airbnb: Calendario, Reservas, Huéspedes, Espacios
 * - Mantenimiento: Pagos, Tickets, Inventario
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type MainTab = 'Espacios' | 'Airbnb' | 'Mantenimiento'
type SubTab = 'Calendario' | 'Cobros' | 'Arrendatarios' | 'Espacios' | 'Reservas' | 'Huéspedes' | 'Pagos' | 'Tickets' | 'Inventario'

type NavbarProps = {
  activeTab?: SubTab
}

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Determinar el tab principal activo según el subtab activo
  const getActiveMainTab = (): MainTab => {
    if (!activeTab) return 'Espacios'

    const espaciosTabs: SubTab[] = ['Calendario', 'Cobros', 'Arrendatarios', 'Espacios']
    const airbnbTabs: SubTab[] = ['Reservas', 'Huéspedes']
    const mantenimientoTabs: SubTab[] = ['Pagos', 'Tickets', 'Inventario']

    if (espaciosTabs.includes(activeTab)) return 'Espacios'
    if (airbnbTabs.includes(activeTab)) return 'Airbnb'
    if (mantenimientoTabs.includes(activeTab)) return 'Mantenimiento'

    return 'Espacios'
  }

  const [activeMainTab, setActiveMainTab] = useState<MainTab>(getActiveMainTab())

  // Definición de tabs principales y sus subtabs
  const mainTabs: Record<MainTab, { nombre: string; ruta: string; icon?: string }[]> = {
    'Espacios': [
      { nombre: 'Calendario', ruta: '/calendario', icon: '📅' },
      { nombre: 'Cobros', ruta: '/cobros', icon: '💰' },
      { nombre: 'Arrendatarios', ruta: '/arrendatarios', icon: '👥' },
      { nombre: 'Espacios', ruta: '/espacios', icon: '🏢' },
    ],
    'Airbnb': [
      { nombre: 'Calendario', ruta: '/airbnb', icon: '📅' },
      { nombre: 'Reservas', ruta: '/airbnb', icon: '🏠' },
      { nombre: 'Huéspedes', ruta: '/airbnb', icon: '👥' },
      { nombre: 'Espacios', ruta: '/airbnb', icon: '🏢' },
    ],
    'Mantenimiento': [
      { nombre: 'Pagos', ruta: '/pagos', icon: '💳' },
      { nombre: 'Tickets', ruta: '/mantenimiento', icon: '🔧' },
      { nombre: 'Inventario', ruta: '/inventario', icon: '📦' },
    ],
  }

  const handleNavegar = (ruta: string) => {
    setMenuAbierto(false)
    router.push(ruta)
  }

  const currentSubTabs = mainTabs[activeMainTab]

  return (
    <>
      {/* Navbar con backdrop blur */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header con logo y tabs principales */}
          <div className="flex justify-between items-center h-14">
            {/* Logo/Título */}
            <button
              onClick={() => handleNavegar('/calendario')}
              className="text-lg font-semibold text-zinc-900 hover:text-[#007AFF] transition-colors tracking-tight"
            >
              Casa del Sol
            </button>

            {/* Desktop: Tabs principales */}
            <div className="hidden md:flex items-center gap-2">
              {(Object.keys(mainTabs) as MainTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeMainTab === tab
                      ? 'text-[#007AFF] bg-[#007AFF]/10'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile: Hamburguesa */}
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

          {/* Desktop: Subtabs (segunda fila) */}
          <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
            {currentSubTabs.map((subtab) => (
              <button
                key={subtab.nombre}
                onClick={() => handleNavegar(subtab.ruta)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === subtab.nombre
                    ? 'text-[#007AFF] bg-[#007AFF]/5'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {subtab.icon && <span className="text-xs">{subtab.icon}</span>}
                {subtab.nombre}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer desde la derecha */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden animate-in slide-in-from-right duration-300 overflow-y-auto">
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

              {/* Links del drawer organizados por sección */}
              <div className="space-y-4">
                {(Object.keys(mainTabs) as MainTab[]).map((mainTab) => (
                  <div key={mainTab}>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3">
                      {mainTab}
                    </h3>
                    <div className="space-y-1">
                      {mainTabs[mainTab].map((subtab) => (
                        <button
                          key={subtab.nombre}
                          onClick={() => handleNavegar(subtab.ruta)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === subtab.nombre
                              ? 'text-[#007AFF] bg-[#007AFF]/10'
                              : 'text-zinc-700 hover:bg-zinc-100 active:scale-95'
                          }`}
                        >
                          {subtab.icon && <span className="text-base">{subtab.icon}</span>}
                          {subtab.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
