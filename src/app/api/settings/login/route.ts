import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch public login settings (for frontend)
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            'login_otp_enabled',
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

    // Default values (safe for public)
    const loginSettings: Record<string, string | boolean> = {
      otpEnabled: true,
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
