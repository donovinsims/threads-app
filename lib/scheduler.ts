import type { Post } from '@/types/post'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface ScheduledJob {
  id: string
  postId: string
  scheduledAt: Date
  status: JobStatus
  createdAt: Date
  completedAt?: Date
  error?: string
}

export interface Scheduler {
  addJob(postId: string, scheduledAt: Date): ScheduledJob
  removeJob(jobId: string): boolean
  getJobs(): ScheduledJob[]
  getJob(jobId: string): ScheduledJob | undefined
  updateJobStatus(jobId: string, status: JobStatus, error?: string): void
}

const STORAGE_KEY = 'threads-app-scheduler-jobs'

function loadJobs(): ScheduledJob[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((job: ScheduledJob) => ({
        ...job,
        scheduledAt: new Date(job.scheduledAt),
        createdAt: new Date(job.createdAt),
        completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
      }))
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return []
}

function saveJobs(jobs: ScheduledJob[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

export function createScheduler(): Scheduler {
  const jobs = loadJobs()

  return {
    addJob(postId: string, scheduledAt: Date): ScheduledJob {
      const job: ScheduledJob = {
        id: crypto.randomUUID(),
        postId,
        scheduledAt,
        status: 'pending',
        createdAt: new Date(),
      }
      jobs.push(job)
      saveJobs(jobs)
      return job
    },
    removeJob(jobId: string): boolean {
      const index = jobs.findIndex(j => j.id === jobId)
      if (index === -1) return false
      jobs.splice(index, 1)
      saveJobs(jobs)
      return true
    },
    getJobs(): ScheduledJob[] {
      return [...jobs]
    },
    getJob(jobId: string): ScheduledJob | undefined {
      return jobs.find(j => j.id === jobId)
    },
    updateJobStatus(jobId: string, status: JobStatus, error?: string): void {
      const job = jobs.find(j => j.id === jobId)
      if (job) {
        job.status = status
        if (status === 'completed' || status === 'failed') {
          job.completedAt = new Date()
        }
        if (error) {
          job.error = error
        }
        saveJobs(jobs)
      }
    },
  }
}

export function isJobDue(job: ScheduledJob): boolean {
  return job.status === 'pending' && new Date() >= job.scheduledAt
}

export async function executeJob(job: ScheduledJob, publishFn: (postId: string) => Promise<Post>): Promise<Post> {
  return publishFn(job.postId)
}
