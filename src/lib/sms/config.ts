/**
 * SMS Gateway Configuration
 * Supports: Alpha SMS (sms.net.bd), BulkSMSBD, Twilio
 */

// Alpha SMS Configuration (sms.net.bd)
export interface AlphaSMSConfig {
  apiKey: string
  senderId: string
}

export const ALPHA_SMS_DEFAULTS = {
  endpoint: 'https://api.sms.net.bd/sendsms',
  balanceEndpoint: 'https://api.sms.net.bd/user/balance/',
  senderId: '8809617613541', // Default sender ID
}

// BulkSMSBD Configuration
export interface BulkSMSBDConfig {
  apiKey: string
  senderId: string
}

export const BULKSMSBD_DEFAULTS = {
  endpoint: 'http://bulksmsbd.net/api/smsapi',
  balanceEndpoint: 'http://bulksmsbd.net/api/getBalanceApi',
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
  balance?: string
}

// SMS Gateway URLs
export const SMS_GATEWAY_URLS = {
  alphasms: {
    production: 'https://api.sms.net.bd/sendsms',
    balance: 'https://api.sms.net.bd/user/balance/',
  },
  bulksmsbd: {
    production: 'http://bulksmsbd.net/api/smsapi',
    balance: 'http://bulksmsbd.net/api/getBalanceApi',
  },
  twilio: {
    production: 'https://api.twilio.com/2010-04-01/Accounts',
    sandbox: 'https://api.twilio.com/2010-04-01/Accounts',
  },
}

// Documentation Links
export const SMS_GATEWAY_DOCS = {
  alphasms: 'https://sms.net.bd/',
  bulksmsbd: 'https://bulksmsbd.net/',
  twilio: 'https://www.twilio.com/docs/sms',
}

// Error codes for Alpha SMS (sms.net.bd)
export const ALPHA_SMS_ERRORS: Record<number, string> = {
  0: 'Success',
  400: 'The request was rejected due to missing or invalid parameter',
  403: 'You don\'t have permissions to perform the request',
  404: 'The requested resource not found',
  405: 'Authorization required - Invalid API Key',
  409: 'Unknown error occurred on Server end',
  410: 'Account expired',
  411: 'Reseller Account expired or suspended',
  412: 'Invalid Schedule',
  413: 'Invalid Sender ID',
  414: 'Message is empty',
  415: 'Message is too long',
  416: 'No valid number found',
  417: 'Insufficient balance',
  420: 'Content Blocked',
  421: 'You can only send SMS to your registered phone number until first balance recharge',
}

// Error codes for BulkSMSBD
export const BULKSMSBD_ERRORS: Record<number, string> = {
  202: 'SMS Submitted Successfully',
  1001: 'Invalid Number',
  1002: 'Sender ID not correct/sender id is disabled',
  1003: 'Please Required all fields/Contact Your System Administrator',
  1005: 'Internal Error',
  1006: 'Balance Validity Not Available',
  1007: 'Balance Insufficient',
  1011: 'User Id not found',
  1012: 'Masking SMS must be sent in Bengali',
  1013: 'Sender Id has not found Gateway by api key',
  1014: 'Sender Type Name not found using this sender by api key',
  1015: 'Sender Id has not found Any Valid Gateway by api key',
  1016: 'Sender Type Name Active Price Info not found by this sender id',
  1017: 'Sender Type Name Price Info not found by this sender id',
  1018: 'The Owner of this Account is disabled',
  1019: 'The Price of this Account is disabled',
  1020: 'The parent of this account is not found',
  1021: 'The parent active price of this account is not found',
  1031: 'Your Account Not Verified, Please Contact Administrator',
  1032: 'IP Not whitelisted',
}
