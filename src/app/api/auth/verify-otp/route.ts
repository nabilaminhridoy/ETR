import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, type } = body

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, OTP, and type are required' },
        { status: 400 }
      )
    }

    // Verify OTP
    const result = verifyOTP(email, otp, type)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      ...(result.name && { name: result.name }),
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
