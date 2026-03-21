/**
 * SMS Service (Server-side)
 * Supports: Alpha SMS (sms.net.bd), BulkSMSBD, Twilio
 */

import { db } from '@/lib/db'
import {
  SMSGatewayType,
  SMSResponse,
  AlphaSMSConfig,
  BulkSMSBDConfig,
  TwilioConfig,
  ALPHA_SMS_DEFAULTS,
  BULKSMSBD_DEFAULTS,
  TWILIO_DEFAULTS,
  ALPHA_SMS_ERRORS,
  BULKSMSBD_ERRORS,
} from './config'

/**
 * Get SMS Gateway configuration from database
 */
export async function getSMSGatewayConfig(gateway: SMSGatewayType): Promise<{
  isEnabled: boolean
  isSandbox: boolean
  credentials: Record<string, string> | null
} | null> {
  try {
    const result = await db.$queryRaw`
      SELECT isEnabled, isSandbox, credentials 
      FROM SMSGateway 
      WHERE name = ${gateway}
    ` as Array<{ isEnabled: number; isSandbox: number; credentials: string | null }>

    if (!result || result.length === 0) {
      return null
    }

    const gatewayData = result[0]
    const credentials = gatewayData.credentials 
      ? JSON.parse(gatewayData.credentials) 
      : null

    return {
      isEnabled: !!gatewayData.isEnabled,
      isSandbox: !!gatewayData.isSandbox,
      credentials,
    }
  } catch (error) {
    console.error(`Error fetching ${gateway} config:`, error)
    return null
  }
}

/**
 * Get all SMS gateway configurations
 */
export async function getAllSMSGateways(): Promise<Record<string, {
  isEnabled: boolean
  isSandbox: boolean
  credentials: Record<string, string> | null
}>> {
  const gateways: SMSGatewayType[] = ['alphasms', 'bulksmsbd', 'twilio']
  const configs: Record<string, typeof configs[string]> = {}

  for (const gateway of gateways) {
    const config = await getSMSGatewayConfig(gateway)
    configs[gateway] = config || {
      isEnabled: false,
      isSandbox: true,
      credentials: null,
    }
  }

  return configs
}

/**
 * Get enabled SMS gateway (returns the first enabled one)
 */
export async function getEnabledSMSGateway(): Promise<SMSGatewayType | null> {
  const gateways: SMSGatewayType[] = ['alphasms', 'bulksmsbd', 'twilio']
  
  for (const gateway of gateways) {
    const config = await getSMSGatewayConfig(gateway)
    if (config?.isEnabled && config.credentials) {
      return gateway
    }
  }
  
  return null
}

/**
 * Send SMS via Alpha SMS (sms.net.bd)
 * API Documentation: https://sms.net.bd/
 */
export async function sendAlphaSMS(
  to: string,
  message: string,
  config: AlphaSMSConfig
): Promise<SMSResponse> {
  try {
    // Format phone number (remove + prefix for Alpha SMS)
    const formattedPhone = to.replace('+', '')

    const params = new URLSearchParams({
      api_key: config.apiKey,
      msg: message,
      to: formattedPhone,
    })

    // Add sender ID if provided
    if (config.senderId) {
      params.append('sender_id', config.senderId)
    }

    const response = await fetch(ALPHA_SMS_DEFAULTS.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (data.error === 0) {
      return {
        success: true,
        messageId: data.data?.request_id?.toString(),
      }
    } else {
      return {
        success: false,
        error: ALPHA_SMS_ERRORS[data.error] || `Error code: ${data.error}`,
      }
    }
  } catch (error) {
    console.error('Alpha SMS error:', error)
    return {
      success: false,
      error: 'Failed to send SMS via Alpha SMS',
    }
  }
}

/**
 * Send SMS via BulkSMSBD
 * API Documentation: https://bulksmsbd.net/
 */
export async function sendBulkSMSBD(
  to: string,
  message: string,
  config: BulkSMSBDConfig
): Promise<SMSResponse> {
  try {
    // Format phone number for BulkSMSBD (must start with 880)
    let formattedPhone = to.replace('+', '')
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '880' + formattedPhone.substring(1)
    }

    const params = new URLSearchParams({
      api_key: config.apiKey,
      senderid: config.senderId || BULKSMSBD_DEFAULTS.senderId,
      number: formattedPhone,
      message: message,
    })

    const response = await fetch(`${BULKSMSBD_DEFAULTS.endpoint}?${params.toString()}`, {
      method: 'GET',
    })

    const data = await response.json()

    if (data.response_code === 202 || data.response_code === '202') {
      return {
        success: true,
        messageId: data.messageId,
      }
    } else {
      return {
        success: false,
        error: BULKSMSBD_ERRORS[data.response_code] || data.error_message || `Error code: ${data.response_code}`,
      }
    }
  } catch (error) {
    console.error('BulkSMSBD error:', error)
    return {
      success: false,
      error: 'Failed to send SMS via BulkSMSBD',
    }
  }
}

/**
 * Send SMS via Twilio
 */
export async function sendTwilioSMS(
  to: string,
  message: string,
  config: TwilioConfig
): Promise<SMSResponse> {
  try {
    const url = `${config.baseUrl || TWILIO_DEFAULTS.baseUrl}/${config.accountSid}/Messages.json`
    
    const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')
    
    const params = new URLSearchParams({
      From: config.fromNumber,
      To: to,
      Body: message,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (response.ok && data.sid) {
      return {
        success: true,
        messageId: data.sid,
      }
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send SMS via Twilio',
      }
    }
  } catch (error) {
    console.error('Twilio SMS error:', error)
    return {
      success: false,
      error: 'Failed to send SMS via Twilio',
    }
  }
}

/**
 * Send SMS using the configured gateway
 */
export async function sendSMS(
  to: string,
  message: string,
  preferredGateway?: SMSGatewayType
): Promise<SMSResponse> {
  // Determine which gateway to use
  let gateway = preferredGateway
  
  if (!gateway) {
    gateway = await getEnabledSMSGateway()
  }
  
  if (!gateway) {
    return {
      success: false,
      error: 'No SMS gateway is enabled',
    }
  }

  const config = await getSMSGatewayConfig(gateway)
  
  if (!config?.isEnabled || !config.credentials) {
    return {
      success: false,
      error: `${gateway} is not configured or disabled`,
    }
  }

  // Format phone number (ensure it starts with country code)
  let formattedTo = to.replace(/[^0-9+]/g, '')
  if (!formattedTo.startsWith('+')) {
    // Add Bangladesh country code if not present
    if (formattedTo.startsWith('01')) {
      formattedTo = '+880' + formattedTo.substring(1)
    } else if (!formattedTo.startsWith('880')) {
      formattedTo = '+880' + formattedTo
    } else {
      formattedTo = '+' + formattedTo
    }
  }

  // Send via appropriate gateway
  switch (gateway) {
    case 'alphasms':
      return sendAlphaSMS(formattedTo, message, config.credentials as unknown as AlphaSMSConfig)
    case 'bulksmsbd':
      return sendBulkSMSBD(formattedTo, message, config.credentials as unknown as BulkSMSBDConfig)
    case 'twilio':
      return sendTwilioSMS(formattedTo, message, config.credentials as unknown as TwilioConfig)
    default:
      return {
        success: false,
        error: 'Invalid SMS gateway',
      }
  }
}

/**
 * Check SMS balance (for Alpha SMS and BulkSMSBD)
 */
export async function checkSMSBalance(gateway: SMSGatewayType): Promise<{
  success: boolean
  balance?: string
  error?: string
}> {
  const config = await getSMSGatewayConfig(gateway)
  
  if (!config?.credentials) {
    return {
      success: false,
      error: 'Gateway not configured',
    }
  }

  try {
    switch (gateway) {
      case 'alphasms': {
        const creds = config.credentials as unknown as AlphaSMSConfig
        const response = await fetch(`${ALPHA_SMS_DEFAULTS.balanceEndpoint}?api_key=${creds.apiKey}`)
        const data = await response.json()
        
        if (data.error === 0) {
          return { success: true, balance: data.data?.balance || '0.0000' }
        }
        return { success: false, error: ALPHA_SMS_ERRORS[data.error] || `Error code: ${data.error}` }
      }
      
      case 'bulksmsbd': {
        const creds = config.credentials as unknown as BulkSMSBDConfig
        const response = await fetch(`${BULKSMSBD_DEFAULTS.balanceEndpoint}?api_key=${creds.apiKey}`)
        const data = await response.json()
        
        if (data.response_code === 202 || data.response_code === '202') {
          return { success: true, balance: data.balance || '0' }
        }
        return { success: false, error: BULKSMSBD_ERRORS[data.response_code] || data.error_message || 'Failed to get balance' }
      }
      
      case 'twilio':
        // Twilio doesn't have a simple balance check
        return { success: true, balance: 'N/A' }
      
      default:
        return { success: false, error: 'Invalid gateway' }
    }
  } catch (error) {
    console.error('Error checking balance:', error)
    return { success: false, error: 'Failed to check balance' }
  }
}

const smsService = {
  sendSMS,
  getSMSGatewayConfig,
  getAllSMSGateways,
  getEnabledSMSGateway,
  checkSMSBalance,
  sendAlphaSMS,
  sendBulkSMSBD,
  sendTwilioSMS,
}

export default smsService
