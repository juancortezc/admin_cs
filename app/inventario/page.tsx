/**
 * Redirect: /inventario -> /administracion/inventario
 */

import { redirect } from 'next/navigation'

export default function InventarioRedirect() {
  redirect('/administracion/inventario')
}
