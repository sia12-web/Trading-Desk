import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * POST /api/upload/screenshot
 * Uploads a screenshot to Supabase Storage
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Use validated extension from MIME type, not user-provided filename
    const mimeToExt: Record<string, string> = {
      'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg',
      'image/webp': 'webp', 'image/gif': 'gif'
    }
    const fileExt = mimeToExt[file.type] || 'png'
    const fileName = `${crypto.randomUUID()}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/wave-analysis/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('trade-screenshots')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      path: data.path
    })

  } catch (error: any) {
    console.error('Screenshot upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload screenshot' },
      { status: 500 }
    )
  }
}
