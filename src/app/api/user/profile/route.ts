import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Helper to get user ID from auth token
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    return parts[0] || null
  } catch {
    return null
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profileImage: true,
        role: true,
        isVerified: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string | null
    const profileImage = formData.get('profileImage') as File | null

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Update data
    const updateData: any = {
      name,
      phone,
      address: address || null,
    }

    // Handle profile image upload
    if (profileImage && profileImage.size > 0) {
      // Validate file type
      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images are allowed.' },
          { status: 400 }
        )
      }

      // Validate file size (max 2MB)
      if (profileImage.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 2MB' },
          { status: 400 }
        )
      }

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = profileImage.name.split('.').pop() || 'jpg'
      const filename = `profile-${userId}-${timestamp}.${extension}`
      const filepath = path.join(uploadDir, filename)

      // Save file
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      // Save URL in database
      updateData.profileImage = `/uploads/profiles/${filename}`
    }

    // Update user
    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profileImage: true,
        role: true,
        isVerified: true,
        isEmailVerified: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      user,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
