'use client'

import { useState, useEffect } from 'react'
import { loadHermesConfig, mockAdapter, HermesAdapter } from '@/lib/hermes'

interface HermesStatusProps {
  onStatusChange?: (enabled: boolean) => void
}

export function HermesStatus({ onStatusChange }: HermesStatusProps) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disabled' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const config = loadHermesConfig()
      
      if (!config.enabled) {
        setStatus('disabled')
        onStatusChange?.(false)
        return
      }

      try {
        let adapter: HermesAdapter
        if (config.apiUrl) {
          const { createHttpAdapter } = await import('@/lib/hermes')
          adapter = createHttpAdapter(config)
        } else {
          adapter = mockAdapter
        }

        const isConnected = await adapter.ping()
        if (isConnected) {
          setStatus('connected')
          onStatusChange?.(true)
        } else {
          setStatus('error')
          setError('Connection failed')
          onStatusChange?.(false)
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
        onStatusChange?.(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [onStatusChange])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-text-2 animate-pulse" />
        <span className="text-sm text-text-2">Checking...</span>
      </div>
    )
  }

  if (status === 'disabled') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-text-2" />
        <span className="text-sm text-text-2">Disabled</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm text-red-500" title={error || undefined}>
          Error
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-sm text-green-600 dark:text-green-400">
        Connected
      </span>
    </div>
  )
}
