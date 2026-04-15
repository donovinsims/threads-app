import type { Post, PostStatus } from '@/types/post'

const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Just shipped a new feature! The team has been working hard on this one. More details coming soon.',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '2',
    content: 'Thread time! Let me share some thoughts on building great products.',
    threadOrder: 0,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    content: '1/ Consistency is key. Show up every day and do the work.',
    threadOrder: 1,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '4',
    content: '2/ Quality over quantity. One great post beats ten mediocre ones.',
    threadOrder: 2,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '5',
    content: 'Morning coffee and some creative writing. Perfect way to start the day.',
    status: 'draft',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '6',
    content: 'Excited to share our latest update with the community!',
    status: 'published',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export function getMockPosts(): Post[] {
  return [...mockPosts]
}

export function getMockPostByStatus(status: PostStatus): Post[] {
  return mockPosts.filter(p => p.status === status)
}

export function formatScheduledTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (diff < 0) {
    return 'Overdue'
  }
  if (hours < 1) {
    return `In ${minutes}m`
  }
  if (hours < 24) {
    return `In ${hours}h ${minutes}m`
  }
  const days = Math.floor(hours / 24)
  return `In ${days}d`
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
