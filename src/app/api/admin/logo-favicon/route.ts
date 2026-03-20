import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { db } from '@/lib/db'

// Allowed image types
const LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
const FAVICON_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/ico']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// GET - Fetch logo and favicon settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['site_logo', 'site_favicon', 'logo_width', 'logo_height']
        }
      }
    })

    const brandingSettings: Record<string, string> = {
      logo: '/logo.png',
      favicon: '/favicon.png',
      logoWidth: '200',
      logoHeight: '50',
    }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'site_logo':
          brandingSettings.logo = setting.value || '/logo.png'
          break
        case 'site_favicon':
          brandingSettings.favicon = setting.value || '/favicon.png'
          break
        case 'logo_width':
          brandingSettings.logoWidth = setting.value || '200'
          break
        case 'logo_height':
          brandingSettings.logoHeight = setting.value || '50'
          break
      }
    })

    return NextResponse.json({ settings: brandingSettings })
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return NextResponse.json({ error: 'Failed to fetch branding settings' }, { status: 500 })
  }
}

// POST - Upload logo or favicon
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'logo' or 'favicon'
    const width = formData.get('width') as string | null
    const height = formData.get('height') as string | null
    const oldImage = formData.get('oldImage') as string | null

    // Handle dimension updates only
    if (!file && type && (width || height)) {
      if (width) {
        await db.systemSetting.upsert({
          where: { key: 'logo_width' },
          update: { value: width },
          create: { key: 'logo_width', value: width },
        })
      }
      if (height) {
        await db.systemSetting.upsert({
          where: { key: 'logo_height' },
          update: { value: height },
          create: { key: 'logo_height', value: height },
        })
      }
      return NextResponse.json({ success: true, message: 'Dimensions updated successfully' })
    }

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 })
    }

    // Validate type
    if (!['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "logo" or "favicon"' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = type === 'logo' ? LOGO_ALLOWED_TYPES : FAVICON_ALLOWED_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Delete old image if it exists and is a local file
    if (oldImage && oldImage.startsWith('/uploads/branding/')) {
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
    const extension = file.name.split('.').pop() || (type === 'favicon' ? 'png' : 'png')
    const filename = `${type}-${timestamp}-${randomString}.${extension}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'branding', filename)

    await writeFile(filepath, buffer)

    // Save to database
    const imageUrl = `/uploads/branding/${filename}`
    const dbKey = type === 'logo' ? 'site_logo' : 'site_favicon'

    await db.systemSetting.upsert({
      where: { key: dbKey },
      update: { value: imageUrl },
      create: { key: dbKey, value: imageUrl },
    })

    // Save dimensions if provided
    if (type === 'logo') {
      if (width) {
        await db.systemSetting.upsert({
          where: { key: 'logo_width' },
          update: { value: width },
          create: { key: 'logo_width', value: width },
        })
      }
      if (height) {
        await db.systemSetting.upsert({
          where: { key: 'logo_height' },
          update: { value: height },
          create: { key: 'logo_height', value: height },
        })
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`
    })
  } catch (error) {
    console.error('Error uploading branding asset:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

// DELETE - Remove logo or favicon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'logo' or 'favicon'

    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const dbKey = type === 'logo' ? 'site_logo' : 'site_favicon'
    
    // Get current value
    const setting = await db.systemSetting.findUnique({
      where: { key: dbKey }
    })

    if (setting?.value && setting.value.startsWith('/uploads/branding/')) {
      const imagePath = path.join(process.cwd(), 'public', setting.value)
      if (existsSync(imagePath)) {
        await unlink(imagePath)
      }
    }

    // Reset to default
    const defaultValue = type === 'logo' ? '/logo.png' : '/favicon.png'
    await db.systemSetting.upsert({
      where: { key: dbKey },
      update: { value: defaultValue },
      create: { key: dbKey, value: defaultValue },
    })

    return NextResponse.json({ success: true, message: `${type} removed successfully` })
  } catch (error) {
    console.error('Error removing branding asset:', error)
    return NextResponse.json({ error: 'Failed to remove file' }, { status: 500 })
  }
}
