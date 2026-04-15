import { NextRequest, NextResponse } from 'next/server'
import * as serverStorage from '@/lib/server-storage'
import type { Post, Media } from '@/types/post'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as Post['status'] | null

    let posts: Post[]
    if (status) {
      posts = await serverStorage.serverGetByStatus(status)
    } else {
      posts = await serverStorage.serverGetAll()
    }

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { content, media, scheduledAt } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const input: { content: string; media?: Media[]; scheduledAt?: Date } = { content }
    if (scheduledAt) {
      input.scheduledAt = new Date(scheduledAt)
    }
    if (media && Array.isArray(media)) {
      input.media = media
    }

    const post = await serverStorage.serverCreate(input)
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content, media, scheduledAt, status } = body

    const input: Record<string, unknown> = {}
    if (content !== undefined) input.content = content
    if (media !== undefined) input.media = media
    if (scheduledAt !== undefined) input.scheduledAt = new Date(scheduledAt)
    if (status !== undefined) input.status = status

    const post = await serverStorage.serverUpdate(id, input as Parameters<typeof serverStorage.serverUpdate>[1])
    return NextResponse.json({ post })
  } catch (error) {
    if (error instanceof Error && error.message === 'Post not found') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    await serverStorage.serverDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete post' },
      { status: 500 }
    )
  }
}