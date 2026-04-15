'use client'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-bg text-text-0">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">You&apos;re Offline</h1>
        <p className="text-text-1 mb-6">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-surface-1 rounded-lg text-link hover:bg-surface-2 transition-colors"
        >
          Retry
        </button>
      </div>
    </main>
  )
}