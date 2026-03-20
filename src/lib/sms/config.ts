/**
 * SMS Gateway Configuration
 * Supports: Alpha SMS, BulkSMSBD, Twilio
 */

// Alpha SMS Configuration
export interface AlphaSMSConfig {
  apiKey: string
  senderId: string
  baseUrl: string
}

export const ALPHA_SMS_DEFAULTS = {
  baseUrl: 'https://api.alphasms.net/index.php?app=ws',
  senderId: '8809617613541', // Default sender ID
}

// BulkSMSBD Configuration
export interface BulkSMSBDConfig {
  apiKey: string
  senderId: string
  baseUrl: string
}

export const BULKSMSBD_DEFAULTS = {
  baseUrl: 'https://bulksmsbd.net/api',
  senderId: '8809617613541',
}

// Twilio Configuration
export interface TwilioConfig {
  accountSid: string
  authToken: string
  fromNumber: string
  baseUrl: string
}

export const TWILIO_DEFAULTS = {
  baseUrl: 'https://api.twilio.com/2010-04-01/Accounts',
}

// SMS Gateway Types
export type SMSGatewayType = 'alphasms' | 'bulksmsbd' | 'twilio'

// SMS Response Interface
export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
  balance?: number
}

// SMS Gateway URLs
export const SMS_GATEWAY_URLS = {
  alphasms: {
    production: 'https://api.alphasms.net/index.php?app=ws',
    sandbox: 'https://api.alphasms.net/index.php?app=ws',
  },
  bulksmsbd: {
    production: 'https://bulksmsbd.net/api',
    sandbox: 'https://bulksmsbd.net/api',
  },
  twilio: {
    production: 'https://api.twilio.com/2010-04-01/Accounts',
    sandbox: 'https://api.twilio.com/2010-04-01/Accounts',
  },
}

// Documentation Links
export const SMS_GATEWAY_DOCS = {
  alphasms: 'https://alphasms.net/docs/',
  bulksmsbd: 'https://bulksmsbd.net/api-docs/',
  twilio: 'https://www.twilio.com/docs/sms',
}
