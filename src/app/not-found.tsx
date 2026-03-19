import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-body">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <p className="text-tx-primary text-lg mb-2">Page not found</p>
        <p className="text-tx-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary btn-sm">Go home</Link>
      </div>
    </div>
  )
}
