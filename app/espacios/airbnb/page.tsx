/**
 * Redirect /espacios/airbnb -> /airbnb
 */

import { redirect } from 'next/navigation'

export default function EspaciosAirbnbRedirect() {
  redirect('/airbnb')
}
