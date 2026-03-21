/**
 * Unified OTP Service
 * Handles sending OTP via Email or SMS based on login settings
 */

import { db } from './db'
import { sendOTPEmail } from './mail'
import { sendSMS, getSMSGatewayConfig } from './sms/service'

export interface OTPSettings {
  otpEnabled: boolean
  emailOtpProvider: string
  smsOtpProvider: string
  otpExpiry: number
  maxOtpAttempts: number
  otpDeliveryMethod: string // 'email' | 'sms' | 'both'
}

/**
 * Get OTP settings from database
 */
export async function getOTPSettings(): Promise<OTPSettings> {
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
            'login_otp_delivery_method',
          ]
        }
      }
    })

    const otpSettings: OTPSettings = {
      otpEnabled: true,
      emailOtpProvider: 'email',
      smsOtpProvider: 'alphasms',
      otpExpiry: 5,
      maxOtpAttempts: 3,
      otpDeliveryMethod: 'both',
    }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'login_otp_enabled':
          otpSettings.otpEnabled = setting.value === 'true'
          break
        case 'login_email_otp_provider':
          otpSettings.emailOtpProvider = setting.value
          break
        case 'login_sms_otp_provider':
          otpSettings.smsOtpProvider = setting.value
          break
        case 'login_otp_expiry':
          otpSettings.otpExpiry = parseInt(setting.value) || 5
          break
        case 'login_max_otp_attempts':
          otpSettings.maxOtpAttempts = parseInt(setting.value) || 3
          break
        case 'login_otp_delivery_method':
          otpSettings.otpDeliveryMethod = setting.value
          break
      }
    })

    return otpSettings
  } catch (error) {
    console.error('Error fetching OTP settings:', error)
    return {
      otpEnabled: true,
      emailOtpProvider: 'email',
      smsOtpProvider: 'alphasms',
      otpExpiry: 5,
      maxOtpAttempts: 3,
      otpDeliveryMethod: 'both',
    }
  }
}

/**
 * Send OTP via Email
 */
export async function sendOTPViaEmail(
  email: string,
  otp: string,
  type: 'register' | 'reset' | 'verify',
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendOTPEmail(email, otp, type, userName)
  } catch (error: any) {
    console.error('Error sending OTP via email:', error)
    return { success: false, error: error.message || 'Failed to send OTP via email' }
  }
}

/**
 * Send OTP via SMS
 */
export async function sendOTPViaSMS(
  phone: string,
  otp: string,
  type: 'register' | 'reset' | 'verify',
  preferredGateway?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get OTP settings to determine SMS provider
    const settings = await getOTPSettings()
    const gateway = preferredGateway || settings.smsOtpProvider

    // Create OTP message based on type
    const messages: Record<string, string> = {
      register: `Your EidTicketResell verification code is: ${otp}. Valid for ${settings.otpExpiry} minutes.`,
      reset: `Your EidTicketResell password reset code is: ${otp}. Valid for ${settings.otpExpiry} minutes.`,
      verify: `Your EidTicketResell verification code is: ${otp}. Valid for ${settings.otpExpiry} minutes.`,
    }

    const message = messages[type] || `Your verification code is: ${otp}`

    // Check if the SMS gateway is configured
    const gatewayConfig = await getSMSGatewayConfig(gateway as 'alphasms' | 'bulksmsbd' | 'twilio')
    
    if (!gatewayConfig?.isEnabled || !gatewayConfig.credentials) {
      return { 
        success: false, 
        error: `SMS gateway (${gateway}) is not configured or disabled. Please configure it in SMS Settings.` 
      }
    }

    // Send SMS using the configured gateway
    const result = await sendSMS(phone, message, gateway as 'alphasms' | 'bulksmsbd' | 'twilio')
    
    return result
  } catch (error: any) {
    console.error('Error sending OTP via SMS:', error)
    return { success: false, error: error.message || 'Failed to send OTP via SMS' }
  }
}

/**
 * Send OTP - Unified function that handles both email and phone
 */
export async function sendOTP(
  destination: string,
  otp: string,
  type: 'register' | 'reset' | 'verify',
  channel: 'email' | 'sms',
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  if (channel === 'email') {
    return sendOTPViaEmail(destination, otp, type, userName)
  } else {
    return sendOTPViaSMS(destination, otp, type)
  }
}

/**
 * Send OTP with custom gateway preference
 */
export async function sendOTPWithGateway(
  destination: string,
  otp: string,
  type: 'register' | 'reset' | 'verify',
  channel: 'email' | 'sms',
  gateway?: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  if (channel === 'email') {
    return sendOTPViaEmail(destination, otp, type, userName)
  } else {
    return sendOTPViaSMS(destination, otp, type, gateway)
  }
}

/**
 * Check if SMS is configured
 */
export async function isSMSConfigured(): Promise<{ configured: boolean; gateway?: string; error?: string }> {
  try {
    const settings = await getOTPSettings()
    const gateway = settings.smsOtpProvider

    const gatewayConfig = await getSMSGatewayConfig(gateway as 'alphasms' | 'bulksmsbd' | 'twilio')

    if (!gatewayConfig?.credentials) {
      return { 
        configured: false, 
        gateway,
        error: `SMS gateway (${gateway}) is not configured. Please configure it in SMS Settings.` 
      }
    }

    // Check for required credentials based on gateway
    if (gateway === 'alphasms') {
      if (!gatewayConfig.credentials.apiKey) {
        return { 
          configured: false, 
          gateway,
          error: 'Alpha SMS API Key is not configured.' 
        }
      }
    } else if (gateway === 'bulksmsbd') {
      if (!gatewayConfig.credentials.apiKey || !gatewayConfig.credentials.senderId) {
        return { 
          configured: false, 
          gateway,
          error: 'BulkSMSBD API Key or Sender ID is not configured.' 
        }
      }
    } else if (gateway === 'twilio') {
      if (!gatewayConfig.credentials.accountSid || !gatewayConfig.credentials.authToken || !gatewayConfig.credentials.fromNumber) {
        return { 
          configured: false, 
          gateway,
          error: 'Twilio credentials are not fully configured.' 
        }
      }
    }

    return { configured: true, gateway }
  } catch (error: any) {
    return { configured: false, error: error.message || 'Failed to check SMS configuration' }
  }
}

/**
 * Check if Email is configured
 */
export async function isEmailConfigured(): Promise<{ configured: boolean; error?: string }> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['smtp_host', 'smtp_username', 'smtp_password']
        }
      }
    })

    const config: Record<string, string> = {}
    settings.forEach((s) => {
      config[s.key] = s.value
    })

    if (!config.smtp_host || !config.smtp_username || !config.smtp_password) {
      return { 
        configured: false, 
        error: 'SMTP is not configured. Please configure Mail Settings.' 
      }
    }

    return { configured: true }
  } catch (error: any) {
    return { configured: false, error: error.message || 'Failed to check email configuration' }
  }
}

const otpService = {
  getOTPSettings,
  sendOTPViaEmail,
  sendOTPViaSMS,
  sendOTP,
  sendOTPWithGateway,
  isSMSConfigured,
  isEmailConfigured,
}

export default otpService
