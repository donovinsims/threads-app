import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_IMAGE_SIZE = 4.5 * 1024 * 1024
const MAX_VIDEO_SIZE = 4.5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, MOV' },
        { status: 400 }
      )
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${isVideo ? '4.5MB for video' : '4.5MB for image'}` },
        { status: 400 }
      )
    }

  const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
  const mediaType = isImage ? 'image' : 'video'
  const blobFileName = `${mediaType}-${Date.now()}-${crypto.randomUUID()}.${ext}`

  const blob = await put(blobFileName, file, {
    access: 'public',
    contentType: file.type,
  })

    return NextResponse.json({
      url: blob.url,
      id: blob.pathname,
      type: mediaType,
      size: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const { del } = await import('@vercel/blob')
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
