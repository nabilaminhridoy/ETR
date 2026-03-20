import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { generateInvoiceNumber } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const profileImage = formData.get('profileImage') as File | null

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        profileImage: profileImage ? `/uploads/profiles/${email}` : null,
        isEmailVerified: true,
        role: 'USER',
      },
    })

    // Create wallet for user
    await db.wallet.create({
      data: {
        userId: user.id,
        availableBalance: 0,
        pendingBalance: 0,
      },
    })

    // Send welcome email using admin panel template
    const emailResult = await sendWelcomeEmail(email, name)
    if (!emailResult.success) {
      console.error('[Register] Failed to send welcome email:', emailResult.error)
    } else {
      console.log('[Register] Welcome email sent successfully to:', email)
    }

    // Generate token (simple JWT-like token for demo)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

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
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
