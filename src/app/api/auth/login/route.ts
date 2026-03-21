import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'

// Token expiry times
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours for normal session
const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days for remember me

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token with expiry
    const now = Date.now()
    const expiryTime = rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY
    const expiresAt = now + expiryTime

    // Create token with user ID, timestamp, and expiry
    const tokenData = {
      userId: user.id,
      createdAt: now,
      expiresAt,
      rememberMe: !!rememberMe
    }
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      expiresAt,
      rememberMe: !!rememberMe,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
