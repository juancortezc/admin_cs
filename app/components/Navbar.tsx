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

type MainTab = 'Calendario' | 'Espacios' | 'Airbnb' | 'Administración'
type SubTab = 'Ingresos' | 'Egresos' | 'Estado de cuenta' | 'Arrendatarios' | 'Espacios' | 'Reservas' | 'Huéspedes' | 'Pagos' | 'Tickets' | 'Inventario' | 'Pagos Eventuales'

type NavbarProps = {
  activeTab?: SubTab
}

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Determinar el tab principal activo según el subtab activo
  const getActiveMainTab = (): MainTab => {
    if (!activeTab) return 'Calendario'

    const calendarioTabs: SubTab[] = ['Ingresos', 'Egresos']
    const espaciosTabs: SubTab[] = ['Estado de cuenta', 'Arrendatarios', 'Espacios']
    const airbnbTabs: SubTab[] = ['Reservas', 'Huéspedes']
    const administracionTabs: SubTab[] = ['Pagos', 'Tickets', 'Inventario']

    if (calendarioTabs.includes(activeTab)) return 'Calendario'
    if (espaciosTabs.includes(activeTab)) return 'Espacios'
    if (airbnbTabs.includes(activeTab)) return 'Airbnb'
    if (administracionTabs.includes(activeTab)) return 'Administración'

    return 'Calendario'
  }

  const [activeMainTab, setActiveMainTab] = useState<MainTab>(getActiveMainTab())

  // Definición de tabs principales y sus subtabs
  const mainTabs: Record<MainTab, { nombre: string; ruta: string }[] | null> = {
    'Calendario': [
      { nombre: 'Ingresos', ruta: '/calendario?tipo=ingresos' },
      { nombre: 'Egresos', ruta: '/calendario?tipo=egresos' },
    ],
    'Espacios': [
      { nombre: 'Estado de cuenta', ruta: '/cobros/espacios' },
      { nombre: 'Arrendatarios', ruta: '/arrendatarios' },
      { nombre: 'Espacios', ruta: '/espacios' },
    ],
    'Airbnb': [
      { nombre: 'Calendario', ruta: '/airbnb' },
      { nombre: 'Reservas', ruta: '/airbnb' },
      { nombre: 'Huéspedes', ruta: '/airbnb' },
      { nombre: 'Espacios', ruta: '/airbnb' },
    ],
    'Administración': [
      { nombre: 'Pagos', ruta: '/administracion/pagos' },
      { nombre: 'Tickets', ruta: '/administracion/tickets' },
      { nombre: 'Inventario', ruta: '/administracion/inventario' },
    ],
  }

  const handleNavegar = (ruta: string) => {
    setMenuAbierto(false)
    router.push(ruta)
  }

  // Manejar clic en tab principal - navegar al primer subtab
  const handleMainTabClick = (tab: MainTab) => {
    setActiveMainTab(tab)
    const subtabs = mainTabs[tab]
    if (subtabs && subtabs.length > 0) {
      router.push(subtabs[0].ruta)
    }
  }

  const currentSubTabs = mainTabs[activeMainTab] || []

  return (
    <>
      {/* Navbar with Material Design gradient - 2 filas */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: 'linear-gradient(120deg, #312E81 0%, #3730A3 50%, #2563EB 100%)',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Header con logo y tabs principales - usando grid para centrar */}
          <div className="grid grid-cols-[200px_1fr_200px] items-center h-16">
            {/* Logo/Título with gradient text effect */}
            <button
              onClick={() => handleNavegar('/calendario')}
              className="text-xl font-bold text-white hover:scale-105 transition-all tracking-tight justify-self-start"
            >
              Casa del Sol
            </button>

            {/* Desktop: Tabs principales en barra contenedora - centrado absoluto */}
            <div className="hidden md:flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-1">
                {(Object.keys(mainTabs) as MainTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleMainTabClick(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      activeMainTab === tab
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-white bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile: Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all justify-self-end"
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

            {/* Espacio vacío en desktop para mantener grid */}
            <div className="hidden md:block"></div>
          </div>

          {/* Desktop: Subtabs (segunda fila) en barra contenedora centrada */}
          {currentSubTabs.length > 0 && (
            <div className="hidden md:flex items-center justify-center pb-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-1">
                {currentSubTabs.map((subtab) => (
                  <button
                    key={subtab.nombre}
                    onClick={() => handleNavegar(subtab.ruta)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === subtab.nombre
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-white bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {subtab.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                {(Object.keys(mainTabs) as MainTab[]).map((mainTab) => {
                  const subtabs = mainTabs[mainTab]

                  // Si no tiene subtabs (por si acaso), no mostrar
                  if (!subtabs) {
                    return null
                  }

                  // Tabs con subtabs
                  return (
                    <div key={mainTab}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
                        {mainTab}
                      </h3>
                      <div className="space-y-1">
                        {subtabs.map((subtab) => (
                          <button
                            key={subtab.nombre}
                            onClick={() => handleNavegar(subtab.ruta)}
                            className={`w-full text-left px-4 py-3 rounded-full text-sm font-medium transition-all ${
                              activeTab === subtab.nombre
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                            }`}
                          >
                            {subtab.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
