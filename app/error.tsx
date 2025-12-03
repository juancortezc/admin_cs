'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">500</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Algo salió mal</h2>
        <p className="text-gray-600 mb-6">Ha ocurrido un error inesperado.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
