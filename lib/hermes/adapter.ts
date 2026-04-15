/**
 * Hermes Adapter Interface
 * 
 * Defines the contract for interacting with the Hermes AI agent.
 * This adapter pattern keeps Hermes isolated from core Threads logic.
 * 
 * Preferred implementation order:
 * 1. HTTP/Webhook adapter (production)
 * 2. MCP adapter (if Hermes exposes MCP interface)
 * 3. Mock adapter (development/testing)
 */

// Request/Response types for Hermes actions

export interface RewriteRequest {
  /** The original post content to rewrite */
  content: string
  /** Optional tone guidance (e.g., 'professional', 'casual', 'engaging') */
  tone?: 'professional' | 'casual' | 'engaging' | 'humorous'
}

export interface RewriteResponse {
  /** The rewritten content */
  content: string
  /** Explanation of changes made */
  explanation: string
}

export interface ExpandRequest {
  /** The short prompt to expand into a full post */
  content: string
  /** Target character count (optional) */
  targetLength?: number
}

export interface ExpandResponse {
  /** The expanded content */
  content: string
  /** Key points that were expanded */
  points: string[]
}

export interface SuggestTimeRequest {
  /** Content of the post for context */
  content: string
  /** Preferred timezone */
  timezone?: string
}

export interface SuggestTimeResponse {
  /** ISO date string for suggested publish time */
  suggestedTime: string
  /** Reason for this suggestion */
  reasoning: string
  /** Confidence score 0-1 */
  confidence: number
}

export interface QueueSummary {
  posts: {
    id: string
    content: string
    scheduledAt: string
    status: string
  }[]
}

export interface SummarizeQueueResponse {
  /** Summary of upcoming posts */
  summary: string
  /** Suggestions for the queue */
  suggestions: string[]
  /** Total posts analyzed */
  totalPosts: number
}

export interface GenerateDraftRequest {
  /** Short prompt or topic for draft generation */
  prompt: string
  /** Content type (e.g., 'thread', 'single', 'reply') */
  type?: 'thread' | 'single' | 'reply'
}

export interface GenerateDraftResponse {
  /** Generated content */
  content: string
  /** Thread posts if type is 'thread' */
  threadPosts?: string[]
  /** Hashtags suggested */
  hashtags: string[]
  /** Topics covered */
  topics: string[]
}

export interface HermesError {
  code: string
  message: string
}

/**
 * HermesAdapter Interface
 * 
 * All methods return Promises and should handle:
 * - Loading states (via isLoading callback if provided)
 * - Timeouts (default 10 seconds)
 * - Error states with meaningful messages
 */
export interface HermesAdapter {
  /**
   * Rewrite existing content with improved phrasing
   */
  rewrite(request: RewriteRequest): Promise<RewriteResponse>

  /**
   * Expand a short prompt into full post content
   */
  expand(request: ExpandRequest): Promise<ExpandResponse>

  /**
   * Suggest the best time to publish based on content and patterns
   */
  suggestTime(request: SuggestTimeRequest): Promise<SuggestTimeResponse>

  /**
   * Summarize the scheduled queue with insights
   */
  summarizeQueue(queue: QueueSummary): Promise<SummarizeQueueResponse>

  /**
   * Generate a new draft from a short prompt
   */
  generateDraft(request: GenerateDraftRequest): Promise<GenerateDraftResponse>

  /**
   * Health check - verify Hermes is reachable
   */
  ping(): Promise<boolean>
}

/**
 * Hermes configuration stored in localStorage
 */
export interface HermesConfig {
  enabled: boolean
  apiUrl: string
  apiKey: string
}

export const DEFAULT_HERMES_CONFIG: HermesConfig = {
  enabled: false,
  apiUrl: '',
  apiKey: ''
}

/**
 * Storage key for Hermes config
 */
export const HERMES_CONFIG_KEY = 'threads-app-hermes-config'

/**
 * Load Hermes configuration from localStorage
 */
export function loadHermesConfig(): HermesConfig {
  if (typeof window === 'undefined') return DEFAULT_HERMES_CONFIG
  
  try {
    const stored = localStorage.getItem(HERMES_CONFIG_KEY)
    if (stored) {
      return { ...DEFAULT_HERMES_CONFIG, ...JSON.parse(stored) }
    }
  } catch {
    console.warn('Failed to load Hermes config')
  }
  return DEFAULT_HERMES_CONFIG
}

/**
 * Save Hermes configuration to localStorage
 */
export function saveHermesConfig(config: HermesConfig): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(HERMES_CONFIG_KEY, JSON.stringify(config))
  } catch {
    console.warn('Failed to save Hermes config')
  }
}
