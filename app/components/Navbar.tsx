/**
 * Navbar Legacy - Wrapper para compatibilidad
 * Redirige a MainNavbar con mapeo de activeTab a activeSection
 */

'use client'

import MainNavbar from './MainNavbar'

type SubTab = 'Ingresos' | 'Egresos' | 'Estado de cuenta' | 'Arrendatarios' | 'Espacios' | 'Reservas' | 'Huéspedes' | 'Pagos' | 'Tickets' | 'Inventario' | 'Pagos Eventuales'

type NavbarProps = {
  activeTab?: SubTab
}

// Mapeo de subtab a sección
const subtabToSection: Record<string, string> = {
  'Ingresos': 'calendario',
  'Egresos': 'calendario',
  'Estado de cuenta': 'cobros',
  'Arrendatarios': 'arrendatarios',
  'Espacios': 'espacios',
  'Reservas': 'airbnb',
  'Huéspedes': 'airbnb',
  'Pagos': 'pagos',
  'Tickets': 'mantenimiento',
  'Inventario': 'mantenimiento',
  'Pagos Eventuales': 'pagos',
}

export default function Navbar({ activeTab }: NavbarProps) {
  const activeSection = activeTab ? subtabToSection[activeTab] || 'inicio' : 'inicio'

  return <MainNavbar activeSection={activeSection} />
}
