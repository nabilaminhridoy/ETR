/**
 * SMS Service (Server-side)
 * Supports: Alpha SMS, BulkSMSBD, Twilio
 */

import { db } from '@/lib/db'
import {
  SMSGatewayType,
  SMSResponse,
  AlphaSMSConfig,
  BulkSMSBDConfig,
  TwilioConfig,
  SMS_GATEWAY_URLS,
  ALPHA_SMS_DEFAULTS,
  BULKSMSBD_DEFAULTS,
  TWILIO_DEFAULTS,
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
 * Send SMS via Alpha SMS
 */
export async function sendAlphaSMS(
  to: string,
  message: string,
  config: AlphaSMSConfig
): Promise<SMSResponse> {
  try {
    const url = new URL(config.baseUrl || ALPHA_SMS_DEFAULTS.baseUrl)
    url.searchParams.set('h', config.apiKey)
    url.searchParams.set('op', 'pv')
    url.searchParams.set('to', to)
    url.searchParams.set('msg', message)
    url.searchParams.set('sender', config.senderId || ALPHA_SMS_DEFAULTS.senderId)

    const response = await fetch(url.toString(), {
      method: 'GET',
    })

    const data = await response.json()

    if (data.status === 'OK') {
      return {
        success: true,
        messageId: data.log?.[0]?.messageId,
        balance: data.creditBalance,
      }
    } else {
      return {
        success: false,
        error: data.error || 'Failed to send SMS via Alpha SMS',
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
 */
export async function sendBulkSMSBD(
  to: string,
  message: string,
  config: BulkSMSBDConfig
): Promise<SMSResponse> {
  try {
    const url = `${config.baseUrl || BULKSMSBD_DEFAULTS.baseUrl}/smsapi`
    
    const params = new URLSearchParams({
      api_key: config.apiKey,
      senderid: config.senderId || BULKSMSBD_DEFAULTS.senderId,
      number: to,
      message: message,
    })

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
    })

    const data = await response.json()

    if (data.response_code === 202) {
      return {
        success: true,
        messageId: data.messageId,
        balance: data.remainingBalance,
      }
    } else {
      return {
        success: false,
        error: data.error_message || `Error code: ${data.response_code}`,
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
  balance?: number
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
        const url = new URL(creds.baseUrl || ALPHA_SMS_DEFAULTS.baseUrl)
        url.searchParams.set('h', creds.apiKey)
        url.searchParams.set('op', 'balance')
        
        const response = await fetch(url.toString())
        const data = await response.json()
        
        if (data.status === 'OK') {
          return { success: true, balance: data.creditBalance }
        }
        return { success: false, error: data.error }
      }
      
      case 'bulksmsbd': {
        const creds = config.credentials as unknown as BulkSMSBDConfig
        const url = `${creds.baseUrl || BULKSMSBD_DEFAULTS.baseUrl}/getBalance`
        
        const params = new URLSearchParams({
          api_key: creds.apiKey,
        })
        
        const response = await fetch(`${url}?${params.toString()}`)
        const data = await response.json()
        
        if (data.response_code === 202) {
          return { success: true, balance: data.balance }
        }
        return { success: false, error: data.error_message }
      }
      
      case 'twilio':
        // Twilio doesn't have a simple balance check
        return { success: true, balance: 0 }
      
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
