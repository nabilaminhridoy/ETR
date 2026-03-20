import { db } from '@/lib/db'

export interface LoginSettings {
  otpEnabled: boolean
  otpProvider: string
  otpExpiry: string
  maxOtpAttempts: string
  socialLoginEnabled: boolean
  googleLogin: boolean
  facebookLogin: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  phoneVerificationRequired: boolean
  passwordMinLength: string
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumber: boolean
  passwordRequireSpecial: boolean
}

const defaultLoginSettings: LoginSettings = {
  otpEnabled: true,
  otpProvider: 'twilio',
  otpExpiry: '5',
  maxOtpAttempts: '3',
  socialLoginEnabled: true,
  googleLogin: true,
  facebookLogin: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  phoneVerificationRequired: true,
  passwordMinLength: '8',
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
}

export async function getLoginSettings(): Promise<LoginSettings> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            'login_otp_enabled',
            'login_otp_provider',
            'login_otp_expiry',
            'login_max_otp_attempts',
            'login_social_enabled',
            'login_google_enabled',
            'login_facebook_enabled',
            'login_registration_enabled',
            'login_email_verification_required',
            'login_phone_verification_required',
            'login_password_min_length',
            'login_password_require_uppercase',
            'login_password_require_lowercase',
            'login_password_require_number',
            'login_password_require_special',
          ]
        }
      }
    })

    const loginSettings = { ...defaultLoginSettings }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'login_otp_enabled':
          loginSettings.otpEnabled = setting.value === 'true'
          break
        case 'login_otp_provider':
          loginSettings.otpProvider = setting.value
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

    return loginSettings
  } catch (error) {
    console.error('Error fetching login settings:', error)
    return defaultLoginSettings
  }
}

// Validate password based on settings
export function validatePasswordWithSettings(
  password: string,
  settings: LoginSettings
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const minLength = parseInt(settings.passwordMinLength) || 8

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }

  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (settings.passwordRequireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (settings.passwordRequireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (settings.passwordRequireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
