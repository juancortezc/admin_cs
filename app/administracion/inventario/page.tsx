/**
 * Redirect: /administracion/inventario -> /inventario
 */

import { redirect } from 'next/navigation'

export default function InventarioRedirect() {
  redirect('/inventario')
}
