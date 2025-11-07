/**
 * Redirect: /mantenimiento -> /administracion/tickets
 */

import { redirect } from 'next/navigation'

export default function MantenimientoRedirect() {
  redirect('/administracion/tickets')
}
