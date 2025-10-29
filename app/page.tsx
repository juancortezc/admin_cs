/**
 * Página principal - Redirect a Calendario (Home)
 */

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/calendario')
}
