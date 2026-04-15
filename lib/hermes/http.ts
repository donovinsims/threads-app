/**
 * HTTP Hermes Adapter
 * 
 * Production implementation that communicates with Hermes via HTTP/Webhook.
 * Handles request/response serialization, timeout, and error handling.
 * 
 * STUB: Requires Hermes API endpoint to be configured and available.
 */

import type {
  HermesAdapter,
  RewriteRequest,
  RewriteResponse,
  ExpandRequest,
  ExpandResponse,
  SuggestTimeRequest,
  SuggestTimeResponse,
  QueueSummary,
  SummarizeQueueResponse,
  GenerateDraftRequest,
  GenerateDraftResponse,
  HermesConfig,
} from './adapter'

const TIMEOUT_MS = 10000

class HermesHttpError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'HermesHttpError'
  }
}

export function createHttpAdapter(config: HermesConfig): HermesAdapter {
  if (!config.enabled || !config.apiUrl) {
    throw new Error('Hermes HTTP adapter requires enabled config with apiUrl')
  }

  async function fetchEndpoint<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify(body),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new HermesHttpError(
          `Hermes API error: ${response.statusText}`,
          'API_ERROR',
          response.status
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HermesHttpError(
          'Request timed out',
          'TIMEOUT',
          408
        )
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return {
    async rewrite(req: RewriteRequest): Promise<RewriteResponse> {
      return fetchEndpoint<RewriteResponse>('/api/rewrite', req as unknown as Record<string, unknown>)
    },

    async expand(req: ExpandRequest): Promise<ExpandResponse> {
      return fetchEndpoint<ExpandResponse>('/api/expand', req as unknown as Record<string, unknown>)
    },

    async suggestTime(req: SuggestTimeRequest): Promise<SuggestTimeResponse> {
      return fetchEndpoint<SuggestTimeResponse>('/api/suggest-time', req as unknown as Record<string, unknown>)
    },

    async summarizeQueue(queue: QueueSummary): Promise<SummarizeQueueResponse> {
      return fetchEndpoint<SummarizeQueueResponse>('/api/summarize-queue', { posts: queue.posts })
    },

    async generateDraft(req: GenerateDraftRequest): Promise<GenerateDraftResponse> {
      return fetchEndpoint<GenerateDraftResponse>('/api/generate-draft', req as unknown as Record<string, unknown>)
    },

    async ping(): Promise<boolean> {
      try {
        const response = await fetch(`${config.apiUrl}/health`, {
          method: 'GET',
          headers: {
            ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
          },
          signal: AbortSignal.timeout(TIMEOUT_MS)
        })
        return response.ok
      } catch {
        return false
      }
    }
  }
}

export { HermesHttpError }
