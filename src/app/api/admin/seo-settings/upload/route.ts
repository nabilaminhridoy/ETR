import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Supported image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'meta', 'facebook', 'twitter'
    const oldImage = formData.get('oldImage') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Validate type parameter
    if (!['meta', 'facebook', 'twitter'].includes(type || '')) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    // Delete old image if it exists and is a local file
    if (oldImage && oldImage.startsWith('/uploads/seo/')) {
      const oldImagePath = path.join(process.cwd(), 'public', oldImage)
      if (existsSync(oldImagePath)) {
        try {
          await unlink(oldImagePath)
        } catch {
          // Ignore errors when deleting old file
        }
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'png'
    const filename = `${type}-${timestamp}-${randomString}.${extension}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'seo', filename)

    await writeFile(filepath, buffer)

    // Return the public URL
    const imageUrl = `/uploads/seo/${filename}`

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Image uploaded successfully' 
    })
  } catch (error) {
    console.error('Error uploading SEO image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE - Remove an SEO image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl || !imageUrl.startsWith('/uploads/seo/')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    const imagePath = path.join(process.cwd(), 'public', imageUrl)
    
    if (existsSync(imagePath)) {
      await unlink(imagePath)
    }

    return NextResponse.json({ success: true, message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting SEO image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
