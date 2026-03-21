import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch login settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            'login_otp_enabled',
            'login_email_otp_provider',
            'login_sms_otp_provider',
            'login_otp_expiry',
            'login_max_otp_attempts',
            'login_social_enabled',
            'login_google_enabled',
            'login_facebook_enabled',
            'login_registration_enabled',
            'login_email_verification_required',
            'login_phone_verification_required',
            'login_otp_delivery_method',
            'login_password_min_length',
            'login_password_require_uppercase',
            'login_password_require_lowercase',
            'login_password_require_number',
            'login_password_require_special',
          ]
        }
      }
    })

    // Default values
    const loginSettings: Record<string, string | boolean> = {
      otpEnabled: true,
      emailOtpProvider: 'email',
      smsOtpProvider: 'alphasms',
      otpExpiry: '5',
      maxOtpAttempts: '3',
      socialLoginEnabled: true,
      googleLogin: true,
      facebookLogin: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      phoneVerificationRequired: true,
      otpDeliveryMethod: 'both',
      passwordMinLength: '8',
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumber: true,
      passwordRequireSpecial: true,
    }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'login_otp_enabled':
          loginSettings.otpEnabled = setting.value === 'true'
          break
        case 'login_email_otp_provider':
          loginSettings.emailOtpProvider = setting.value
          break
        case 'login_sms_otp_provider':
          loginSettings.smsOtpProvider = setting.value
          break
        case 'login_otp_expiry':
          loginSettings.otpExpiry = setting.value
          break
        case 'login_max_otp_attempts':
          loginSettings.maxOtpAttempts = setting.value
          break
        case 'login_social_enabled':
          loginSettings.socialLoginEnabled = setting.value === 'true'
          break
        case 'login_google_enabled':
          loginSettings.googleLogin = setting.value === 'true'
          break
        case 'login_facebook_enabled':
          loginSettings.facebookLogin = setting.value === 'true'
          break
        case 'login_registration_enabled':
          loginSettings.registrationEnabled = setting.value === 'true'
          break
        case 'login_email_verification_required':
          loginSettings.emailVerificationRequired = setting.value === 'true'
          break
        case 'login_phone_verification_required':
          loginSettings.phoneVerificationRequired = setting.value === 'true'
          break
        case 'login_otp_delivery_method':
          loginSettings.otpDeliveryMethod = setting.value
          break
        case 'login_password_min_length':
          loginSettings.passwordMinLength = setting.value
          break
        case 'login_password_require_uppercase':
          loginSettings.passwordRequireUppercase = setting.value === 'true'
          break
        case 'login_password_require_lowercase':
          loginSettings.passwordRequireLowercase = setting.value === 'true'
          break
        case 'login_password_require_number':
          loginSettings.passwordRequireNumber = setting.value === 'true'
          break
        case 'login_password_require_special':
          loginSettings.passwordRequireSpecial = setting.value === 'true'
          break
      }
    })

    return NextResponse.json({ settings: loginSettings })
  } catch (error) {
    console.error('Error fetching login settings:', error)
    return NextResponse.json({ error: 'Failed to fetch login settings' }, { status: 500 })
  }
}

// POST - Save login settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const settingsMap: Record<string, string> = {
      otpEnabled: 'login_otp_enabled',
      emailOtpProvider: 'login_email_otp_provider',
      smsOtpProvider: 'login_sms_otp_provider',
      otpExpiry: 'login_otp_expiry',
      maxOtpAttempts: 'login_max_otp_attempts',
      socialLoginEnabled: 'login_social_enabled',
      googleLogin: 'login_google_enabled',
      facebookLogin: 'login_facebook_enabled',
      registrationEnabled: 'login_registration_enabled',
      emailVerificationRequired: 'login_email_verification_required',
      phoneVerificationRequired: 'login_phone_verification_required',
      otpDeliveryMethod: 'login_otp_delivery_method',
      passwordMinLength: 'login_password_min_length',
      passwordRequireUppercase: 'login_password_require_uppercase',
      passwordRequireLowercase: 'login_password_require_lowercase',
      passwordRequireNumber: 'login_password_require_number',
      passwordRequireSpecial: 'login_password_require_special',
    }

    for (const [key, dbKey] of Object.entries(settingsMap)) {
      if (data[key] !== undefined) {
        // Convert boolean to string for storage
        const value = typeof data[key] === 'boolean' ? String(data[key]) : String(data[key])
        
        await db.systemSetting.upsert({
          where: { key: dbKey },
          update: { value },
          create: { key: dbKey, value },
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Login settings saved successfully' })
  } catch (error) {
    console.error('Error saving login settings:', error)
    return NextResponse.json({ error: 'Failed to save login settings' }, { status: 500 })
  }
}
