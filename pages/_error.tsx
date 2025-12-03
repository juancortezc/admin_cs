import { NextPageContext } from 'next'

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.75rem',
          fontWeight: 'bold',
          color: '#d1d5db',
          marginBottom: '1rem'
        }}>
          {statusCode || 'Error'}
        </h1>
        <p style={{ color: '#6b7280' }}>
          {statusCode
            ? `Ocurrió un error ${statusCode} en el servidor`
            : 'Ocurrió un error en el cliente'}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
