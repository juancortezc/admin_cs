/**
 * Configuración centralizada de navegación
 * Define todos los tabs y subtabs del sistema
 */

export type NavItem = {
  id: string
  nombre: string
  ruta: string
  icon?: string // SVG path para icono
}

export type NavSection = {
  id: string
  nombre: string
  ruta: string
  icon: string
  subtabs?: NavItem[]
}

// Configuración de navegación principal
// Orden: Inicio, Cobros, Pagos, Airbnb, Calendario, Reportes (6 principales)
// El resto va en menú "Más": Espacios, Arrendatarios, Admin
export const navigationConfig: NavSection[] = [
  // === TABS PRINCIPALES (6) ===
  {
    id: 'inicio',
    nombre: 'Inicio',
    ruta: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    id: 'cobros',
    nombre: 'Cobros',
    ruta: '/cobros',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    subtabs: [
      { id: 'todos', nombre: 'Todos', ruta: '/cobros' },
      { id: 'pendientes', nombre: 'Pendientes', ruta: '/cobros?filtro=pendientes' },
      { id: 'historial', nombre: 'Historial', ruta: '/cobros?filtro=historial' },
    ],
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    ruta: '/administracion/pagos',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    subtabs: [
      { id: 'pagos', nombre: 'Pagos', ruta: '/administracion/pagos' },
      { id: 'tickets', nombre: 'Tickets', ruta: '/administracion/tickets' },
      { id: 'inventario', nombre: 'Inventario', ruta: '/administracion/inventario' },
    ],
  },
  {
    id: 'airbnb',
    nombre: 'Airbnb',
    ruta: '/airbnb',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    subtabs: [
      { id: 'reservas', nombre: 'Reservas', ruta: '/airbnb' },
      { id: 'huespedes', nombre: 'Huéspedes', ruta: '/airbnb?tab=huespedes' },
      { id: 'ocupacion', nombre: 'Ocupación', ruta: '/airbnb?tab=ocupacion' },
    ],
  },
  {
    id: 'calendario',
    nombre: 'Calendario',
    ruta: '/calendario',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    ruta: '/reportes',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  // === TABS EN MENU "MÁS" ===
  {
    id: 'mantenimiento',
    nombre: 'Mantenimiento',
    ruta: '/mantenimiento',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'espacios',
    nombre: 'Espacios',
    ruta: '/espacios',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    id: 'arrendatarios',
    nombre: 'Arrendatarios',
    ruta: '/arrendatarios',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    subtabs: [
      { id: 'activos', nombre: 'Activos', ruta: '/arrendatarios' },
      { id: 'inactivos', nombre: 'Inactivos', ruta: '/arrendatarios?filtro=inactivos' },
    ],
  },
  {
    id: 'admin',
    nombre: 'Admin',
    ruta: '/admin',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    subtabs: [
      { id: 'usuarios', nombre: 'Usuarios', ruta: '/admin' },
      { id: 'empleados', nombre: 'Empleados', ruta: '/admin/empleados' },
    ],
  },
]

// Obtener sección activa por ruta
export function getActiveSection(pathname: string): NavSection | undefined {
  // Primero buscar coincidencia exacta
  const exactMatch = navigationConfig.find(section => section.ruta === pathname)
  if (exactMatch) return exactMatch

  // Luego buscar por prefijo de ruta
  return navigationConfig.find(section => {
    if (pathname.startsWith(section.ruta) && section.ruta !== '/') {
      return true
    }
    // Verificar subtabs
    if (section.subtabs) {
      return section.subtabs.some(subtab => pathname.startsWith(subtab.ruta.split('?')[0]))
    }
    return false
  })
}

// Obtener subtab activo
export function getActiveSubtab(pathname: string, searchParams: string, section: NavSection): NavItem | undefined {
  if (!section.subtabs) return undefined

  const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname

  // Buscar coincidencia exacta primero
  const exactMatch = section.subtabs.find(subtab => subtab.ruta === fullPath)
  if (exactMatch) return exactMatch

  // Buscar por pathname si no hay query params
  return section.subtabs.find(subtab => subtab.ruta.split('?')[0] === pathname)
}

// Tabs visibles en navbar principal (los primeros 6)
export const VISIBLE_NAV_TABS = 6
