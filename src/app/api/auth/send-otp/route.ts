import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOTP } from '@/lib/utils'
import { storeOTP } from '@/lib/otp-store'
import otpService from '@/lib/otp-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, name, type, channel } = body

    console.log(`[Send OTP] Request received - Email: ${email}, Phone: ${phone}, Type: ${type}, Channel: ${channel}`)

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    // Determine channel (email or sms)
    const useChannel = channel || (email ? 'email' : phone ? 'sms' : null)

    if (!useChannel) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      )
    }

    const destination = useChannel === 'email' ? email : phone

    if (!destination) {
      return NextResponse.json(
        { error: `${useChannel === 'email' ? 'Email' : 'Phone'} is required for ${useChannel} verification` },
        { status: 400 }
      )
    }

    // Check if user exists for reset type
    if (type === 'reset') {
      const user = await db.user.findFirst({
        where: useChannel === 'email' 
          ? { email: destination }
          : { phone: destination }
      })
      if (!user) {
        return NextResponse.json(
          { error: `No account found with this ${useChannel === 'email' ? 'email' : 'phone number'}` },
          { status: 404 }
        )
      }
    }

    // Check if user already exists for register type
    if (type === 'register') {
      const existingUser = await db.user.findFirst({
        where: useChannel === 'email' 
          ? { email: destination }
          : { phone: destination }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: `An account with this ${useChannel === 'email' ? 'email' : 'phone number'} already exists` },
          { status: 400 }
        )
      }
    }

    // Get OTP settings
    const otpSettings = await otpService.getOTPSettings()
    
    // Check if OTP is enabled
    if (!otpSettings.otpEnabled) {
      return NextResponse.json(
        { error: 'OTP verification is currently disabled' },
        { status: 400 }
      )
    }

    // Check channel configuration
    if (useChannel === 'email') {
      const emailConfig = await otpService.isEmailConfigured()
      if (!emailConfig.configured) {
        console.error('[Send OTP] Email not configured:', emailConfig.error)
        return NextResponse.json(
          { error: emailConfig.error || 'Email service is not configured. Please configure Mail Settings.' },
          { status: 400 }
        )
      }
    } else if (useChannel === 'sms') {
      const smsConfig = await otpService.isSMSConfigured()
      if (!smsConfig.configured) {
        console.error('[Send OTP] SMS not configured:', smsConfig.error)
        return NextResponse.json(
          { error: smsConfig.error || 'SMS service is not configured. Please configure SMS Settings.' },
          { status: 400 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    console.log(`[Send OTP] Generated OTP: ${otp}`)

    // Store OTP with expiry from settings
    const expiryMs = otpSettings.otpExpiry * 60 * 1000
    storeOTP(destination, otp, type, name, expiryMs)
    console.log(`[Send OTP] OTP stored for ${destination}`)

    // Send OTP via the appropriate channel
    console.log(`[Send OTP] Attempting to send via ${useChannel}...`)
    
    const result = await otpService.sendOTP(
      destination,
      otp,
      type,
      useChannel as 'email' | 'sms',
      name
    )
    
    console.log(`[Send OTP] ${useChannel} result:`, result)

    if (!result.success) {
      console.error(`[Send OTP] Failed to send OTP via ${useChannel}:`, result.error)
      
      // For development, still return success with OTP in response
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Send OTP] Dev mode - returning OTP in response: ${otp}`)
        return NextResponse.json({
          success: true,
          message: `OTP generated (check console - ${useChannel} failed)`,
          otp, // Include OTP in development for testing
          channel: useChannel,
        })
      }
      
      return NextResponse.json(
        { error: result.error || `Failed to send OTP via ${useChannel}` },
        { status: 500 }
      )
    }

    console.log(`[Send OTP] OTP sent successfully to ${destination} via ${useChannel}`)

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to your ${useChannel === 'email' ? 'email' : 'phone'}`,
      channel: useChannel,
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
