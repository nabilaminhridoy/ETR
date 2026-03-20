import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP } from '@/lib/utils'
import { sendOTPEmail } from '@/lib/mail'
import { storeOTP } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, type } = body

    console.log(`[Send OTP] Request received - Email: ${email}, Type: ${type}`)

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    // Check if user exists for reset type
    if (type === 'reset') {
      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        )
      }
    }

    // Check if user already exists for register type
    if (type === 'register') {
      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    console.log(`[Send OTP] Generated OTP: ${otp}`)

    // Store OTP (5 minutes expiry)
    storeOTP(email, otp, type, name, 5 * 60 * 1000)
    console.log(`[Send OTP] OTP stored for ${email}`)

    // Send OTP email
    console.log(`[Send OTP] Attempting to send email...`)
    const emailResult = await sendOTPEmail(email, otp, type, name)
    console.log(`[Send OTP] Email result:`, emailResult)

    if (!emailResult.success) {
      console.error('[Send OTP] Failed to send OTP email:', emailResult.error)
      
      // For development, still return success with OTP in response
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Send OTP] Dev mode - returning OTP in response: ${otp}`)
        return NextResponse.json({
          success: true,
          message: 'OTP generated (check console - email failed)',
          otp, // Include OTP in development for testing
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please check mail settings.' },
        { status: 500 }
      )
    }

    console.log(`[Send OTP] OTP sent successfully to ${email}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      // For development purposes, return the OTP
      ...(process.env.NODE_ENV === 'development' && { otp }),
    })
  } catch (error) {
    console.error('[Send OTP] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
