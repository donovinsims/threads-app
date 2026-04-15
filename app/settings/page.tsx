'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageShell, PageHeader } from '@/components/PageShell'
import { List, ListRow } from '@/components/ui/ListRow'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { HermesStatus } from '@/components/hermes/HermesStatus'
import {
  loadHermesConfig,
  saveHermesConfig,
  DEFAULT_HERMES_CONFIG,
  type HermesConfig,
} from '@/lib/hermes'

const THEME_KEY = 'threads-app-theme'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem(THEME_KEY, newIsDark ? 'dark' : 'light')
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-14 h-8
        bg-surface-2 rounded-full
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-link
      "
    >
      <span
        className={`
          absolute top-1 w-6 h-6
          bg-white rounded-full shadow-sm
          transition-transform duration-200
          flex items-center justify-center
          ${isDark ? 'left-7' : 'left-1'}
        `}
      >
        {isDark ? (
          <svg className="w-4 h-4 text-text-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-link" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        )}
      </span>
    </button>
  )
}

interface ConnectionStatus {
  connected: boolean
  userId?: string
  userName?: string
  error?: string
  needsRefresh?: boolean
  expiresIn?: number
}

function ConnectedAccount({ 
  userName, 
  needsRefresh, 
  expiresIn,
}: { 
  userName?: string
  needsRefresh?: boolean
  expiresIn?: number
}) {
  const [disconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/auth/disconnect', { method: 'POST' })
      window.location.reload()
    } catch {
      setDisconnecting(false)
    }
  }

  const handleReconnect = () => {
    window.location.href = '/api/auth'
  }

  const formatExpiry = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <Card>
      <CardContent className="p-4">
        {needsRefresh && (
          <div className="mb-4 p-3 bg-surface-2 rounded-xl border border-border-1">
            <p className="text-[13px] text-text-1">
              Your session is expiring {expiresIn ? `in ${formatExpiry(expiresIn)}` : 'soon'}.
              Please reconnect to continue.
            </p>
            <button onClick={handleReconnect} className="mt-2 text-[13px] font-semibold text-link">
              Reconnect Now →
            </button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center overflow-hidden">
            <span className="text-lg font-semibold text-text-1">
              {userName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-text-0">{userName || 'Connected'}</p>
            <p className="text-sm text-text-1">Threads Account</p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-link/10 text-link rounded-full">
            Connected
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-4"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
        </Button>
      </CardContent>
    </Card>
  )
}

function DisconnectedAccount() {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/auth')
      if (response.ok) {
        const url = response.url
        window.location.href = url
      }
    } catch {
      setConnecting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-text-1 mb-4">
            Connect your Threads account to start scheduling posts
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleConnect}
            disabled={connecting}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {connecting ? 'Connecting...' : 'Connect Threads Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HermesSettings() {
  const [config, setConfig] = useState<HermesConfig>(DEFAULT_HERMES_CONFIG)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(loadHermesConfig())
  }, [])

  const handleSave = () => {
    setSaving(true)
    saveHermesConfig(config)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 300)
  }

  const handleChange = <K extends keyof HermesConfig>(key: K, value: HermesConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-medium text-text-2 uppercase tracking-wider">
          AI Assistant (Hermes)
        </h2>
        <HermesStatus />
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <ListRow
            label="Enable Hermes"
            description="Access AI-powered content assistance"
            trailing={
              <button
                onClick={() => handleChange('enabled', !config.enabled)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-200
                  ${config.enabled ? 'bg-link' : 'bg-surface-2'}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm
                    transition-transform duration-200
                    ${config.enabled ? 'left-6' : 'left-1'}
                  `}
                />
              </button>
            }
          />
          
          {config.enabled && (
            <>
              <div>
                <Input
                  label="API URL"
                  placeholder="https://your-hermes-api.com"
                  value={config.apiUrl}
                  onChange={(e) => handleChange('apiUrl', e.target.value)}
                />
                <p className="text-xs text-text-2 mt-1 px-1">
                  Leave empty to use mock mode for development
                </p>
              </div>
              
              <div>
                <Input
                  label="API Key"
                  type="password"
                  placeholder="Enter your API key"
                  value={config.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                />
              </div>
              
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function SettingsContent() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false })
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then(setConnectionStatus)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected === 'true') {
      fetch('/api/auth/status')
        .then((res) => res.json())
        .then(setConnectionStatus)
    }
    if (error) {
      console.error('Auth error:', error)
    }
  }, [searchParams])

  return (
    <>
      <HermesSettings />

      <section>
        <h2 className="text-sm font-medium text-text-2 uppercase tracking-wider mb-2 px-1">
          Account
        </h2>
        {!loading && connectionStatus.connected ? (
          <ConnectedAccount 
            userName={connectionStatus.userName}
            needsRefresh={connectionStatus.needsRefresh}
            expiresIn={connectionStatus.expiresIn}
          />
        ) : (
          connectionStatus.error && (
            <Card>
              <CardContent className="p-4">
                <div className="p-3 bg-surface-2 rounded-xl border border-border-1">
                  <p className="text-[13px] text-red-500 mb-2">
                    Connection Error: {connectionStatus.error}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      fetch('/api/auth/disconnect', { method: 'POST' }).then(() => {
                        window.location.href = '/api/auth'
                      })
                    }}
                  >
                    Reconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
        {!loading && !connectionStatus.connected && !connectionStatus.error && (
          <DisconnectedAccount />
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-2 uppercase tracking-wider mb-2 px-1">
          Health
        </h2>
        <List>
          <ListRow
            label="Server Status"
            value="Online"
            valueClassName="text-link"
          />
          <ListRow
            label="API Status"
            value="Ready"
            valueClassName="text-link"
          />
          <ListRow
            label="Cron Jobs"
            value="Enabled"
          />
        </List>
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-2 uppercase tracking-wider mb-2 px-1">
          Appearance
        </h2>
        <List>
          <ListRow
            label="Dark Mode"
            description="Match system or set manually"
            trailing={<ThemeToggle />}
          />
        </List>
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-2 uppercase tracking-wider mb-2 px-1">
          About
        </h2>
        <List>
          <ListRow
            label="Version"
            value="0.1.0"
          />
          <ListRow
            label="Terms of Service"
            onClick={() => {}}
          />
          <ListRow
            label="Privacy Policy"
            onClick={() => {}}
          />
        </List>
      </section>
    </>
  )
}

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader title="Settings" />
      
      <div className="px-4 py-4 space-y-6">
        <Suspense fallback={<div className="text-center text-text-1 py-8">Loading...</div>}>
          <SettingsContent />
        </Suspense>
      </div>
    </PageShell>
  )
}