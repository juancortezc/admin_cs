/**
 * Navbar Material Design con gradientes y efectos modernos
 * - Gradient hero background
 * - Glass morphism effects
 * - Smooth animations
 * - Elevated design
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

  // Definición de tabs principales y sus subtabs con iconos SVG
  const mainTabs: Record<MainTab, { nombre: string; ruta: string; icon: string }[]> = {
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
      {/* Navbar with Material Design gradient */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: 'linear-gradient(120deg, #312E81 0%, #3730A3 50%, #2563EB 100%)',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Header con logo y tabs principales */}
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título with gradient text effect */}
            <button
              onClick={() => handleNavegar('/calendario')}
              className="text-xl font-bold text-white hover:scale-105 transition-all tracking-tight flex items-center gap-2"
            >
              <span className="text-2xl">🏛️</span>
              <span className="text-gradient-white">Casa del Sol</span>
            </button>

            {/* Desktop: Tabs principales */}
            <div className="hidden md:flex items-center gap-2">
              {(Object.keys(mainTabs) as MainTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeMainTab === tab
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile: Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-white"
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

          {/* Desktop: Subtabs (segunda fila) con glass effect */}
          <div className="hidden md:flex items-center gap-2 pb-3 overflow-x-auto">
            {currentSubTabs.map((subtab) => (
              <button
                key={subtab.nombre}
                onClick={() => handleNavegar(subtab.ruta)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === subtab.nombre
                    ? 'bg-white text-indigo-700 shadow-md transform -translate-y-0.5'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base">{subtab.icon}</span>
                {subtab.nombre}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <>
          {/* Overlay con backdrop blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setMenuAbierto(false)}
          />

          {/* Drawer desde la derecha con Material Design */}
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden animate-slide-in-up"
            style={{
              boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="p-6">
              {/* Header del drawer con gradient */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menú</h2>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
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
              <div className="space-y-6">
                {(Object.keys(mainTabs) as MainTab[]).map((mainTab) => (
                  <div key={mainTab}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
                      {mainTab}
                    </h3>
                    <div className="space-y-1">
                      {mainTabs[mainTab].map((subtab) => (
                        <button
                          key={subtab.nombre}
                          onClick={() => handleNavegar(subtab.ruta)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                            activeTab === subtab.nombre
                              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                          }`}
                        >
                          <span className="text-lg">{subtab.icon}</span>
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
