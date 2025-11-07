/**
 * Redirect: /pagos -> /administracion/pagos
 */

import { redirect } from 'next/navigation'

export default function PagosRedirect() {
  redirect('/administracion/pagos')
}
