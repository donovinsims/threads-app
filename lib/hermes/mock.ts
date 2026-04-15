/**
 * Mock Hermes Adapter
 * 
 * Development/testing implementation that returns placeholder responses.
 * Simulates network latency and provides realistic response shapes.
 * 
 * To use: import { createMockAdapter } from './mock'
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
} from './adapter'

const MOCK_DELAY_MS = 800

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function createMockAdapter(): HermesAdapter {
  return {
    async rewrite(request: RewriteRequest): Promise<RewriteResponse> {
      await delay(MOCK_DELAY_MS)
      
      const tonePrefix = request.tone ? `[${request.tone} tone] ` : ''
      const sentences = request.content.split(/[.!?]+/).filter(Boolean)
      
      let rewritten = sentences.map((sentence, i) => {
        if (i === 0) {
          return sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1)
        }
        return sentence.trim()
      }).join('. ')
      
      if (!rewritten.endsWith('.') && !rewritten.endsWith('!') && !rewritten.endsWith('?')) {
        rewritten += '.'
      }
      
      return {
        content: tonePrefix + rewritten,
        explanation: 'Mock: Improved clarity and flow. Adjusts sentence structure for better readability.'
      }
    },

    async expand({ content, targetLength }: ExpandRequest): Promise<ExpandResponse> {
      await delay(MOCK_DELAY_MS + 300)
      
      const baseContent = content.trim()
      const target = targetLength ?? 280
      
      const expansions = [
        `\n\nHere's why this matters: The key insight here is that ${baseContent.toLowerCase()}. Many people overlook this aspect, but it's crucial for understanding the bigger picture.`,
        `\n\nTo break it down further:\n• The main point connects to broader themes\n• It invites engagement and discussion\n• Practical application makes it actionable`,
      ]
      
      let expanded = baseContent
      while (expanded.length < target + 50 && expansions.length > 0) {
        expanded += expansions.shift()
      }
      
      if (expanded.length > target + 50) {
        expanded = expanded.slice(0, target) + '...'
      }
      
      return {
        content: expanded.trim(),
        points: [
          'Main thesis and core message',
          'Supporting context and background',
          'Practical implications'
        ]
      }
    },

    async suggestTime(request: SuggestTimeRequest): Promise<SuggestTimeResponse> {
      await delay(MOCK_DELAY_MS)
      
      const hour = 9 + Math.floor(Math.random() * 3)
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(hour, 0, 0, 0)
      
      return {
        suggestedTime: tomorrow.toISOString(),
        reasoning: `Mock: Based on typical engagement patterns and "${request.content?.slice(0, 30)}...", weekday mornings tend to perform well.`,
        confidence: 0.75
      }
    },

    async summarizeQueue(queue: QueueSummary): Promise<SummarizeQueueResponse> {
      await delay(MOCK_DELAY_MS + 200)
      
      const total = queue.posts.length
      const scheduled = queue.posts.filter(p => p.status === 'scheduled').length
      
      return {
        summary: `You have ${total} post${total !== 1 ? 's' : ''} in your queue, ${scheduled} scheduled for publication.`,
        suggestions: [
          'Consider spacing out posts about similar topics',
          'Weekend content performs well with personal angles',
          'Thread posts get higher engagement when announced with a hook'
        ],
        totalPosts: total
      }
    },

    async generateDraft(request: GenerateDraftRequest): Promise<GenerateDraftResponse> {
      await delay(MOCK_DELAY_MS + 400)
      
      const topic = request.prompt.trim()
      const isThread = request.type === 'thread'
      
      if (isThread) {
        return {
          content: `Here's my take on ${topic}:\n\n[Opening hook that draws readers in]`,
          threadPosts: [
            `The ${topic} landscape is evolving faster than most realize.`,
            `Here's what I've learned after months of working in this space:\n\n1. Start with the problem, not the solution\n2. Build in public creates unexpected opportunities\n3. Community feedback accelerates growth`,
            `The biggest misconception? That success requires waiting for the "perfect" moment.\n\nThe truth: momentum compounds when you ship consistently.`
          ],
          hashtags: [`#${topic.replace(/\s+/g, '')}`, '#insights', '#buildinpublic'],
          topics: [topic, 'lessons learned', 'community']
        }
      }
      
      return {
        content: `${topic.charAt(0).toUpperCase() + topic.slice(1)}.\n\nThis is something I've been thinking about. Would love to hear your perspective.`,
        hashtags: [`#${topic.replace(/\s+/g, '')}`],
        topics: [topic]
      }
    },

    async ping(): Promise<boolean> {
      await delay(200)
      return true
    }
  }
}

export const mockAdapter = createMockAdapter()
