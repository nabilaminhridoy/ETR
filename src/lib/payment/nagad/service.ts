/**
 * Nagad Payment Service (Server-side)
 * Based on Nagad Online Payment API Integration Guide v3.3
 */

import crypto from 'crypto'
import { db } from '@/lib/db'
import {
  NagadConfig,
  NagadCredentials,
  NAGAD_URLS,
  NAGAD_API_VERSIONS,
  NAGAD_CURRENCY,
  NAGAD_ENDPOINTS,
} from './config'

/**
 * Get Nagad configuration from database
 */
export async function getNagadConfigFromDB(): Promise<NagadConfig | null> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: 'payment_nagad' },
    })

    if (!setting) return null

    const credentials = JSON.parse(setting.value) as NagadCredentials & { isEnabled: boolean }

    if (!credentials.isEnabled) return null

    const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    return {
      merchantId: credentials.merchantId,
      merchantPrivateKey: credentials.merchantPrivateKey,
      merchantPublicKey: credentials.merchantPublicKey,
      nagadPublicKey: credentials.nagadPublicKey,
      baseUrl: credentials.merchantId.startsWith('68') 
        ? NAGAD_URLS.sandbox 
        : NAGAD_URLS.production,
      apiVersion: credentials.apiVersion || NAGAD_API_VERSIONS.v020,
      callbackUrl: `${host}/api/payment/nagad/callback`,
      isSandbox: credentials.merchantId.startsWith('68'),
    }
  } catch (error) {
    console.error('Error fetching Nagad config:', error)
    return null
  }
}

/**
 * Generate RSA Key Pair
 */
export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  return { publicKey, privateKey }
}

/**
 * Generate random challenge (40 hex characters)
 */
export function generateChallenge(): string {
  return crypto.randomBytes(20).toString('hex').toUpperCase()
}

/**
 * Generate Order ID
 */
export function generateOrderId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}${timestamp}${random}`.substring(0, 20)
}

/**
 * Get current datetime in Nagad format
 */
export function getNagadDateTime(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * Encrypt sensitive data with Nagad Public Key
 */
export function encryptWithPublicKey(plainData: string, publicKey: string): string {
  const buffer = Buffer.from(plainData, 'utf-8')
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  )
  return encrypted.toString('base64')
}

/**
 * Decrypt sensitive data with Merchant Private Key
 */
export function decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
  const buffer = Buffer.from(encryptedData, 'base64')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  )
  return decrypted.toString('utf-8')
}

/**
 * Generate signature with Merchant Private Key (SHA1withRSA)
 */
export function signWithPrivateKey(data: string, privateKey: string): string {
  const sign = crypto.createSign('RSA-SHA1')
  sign.update(data)
  sign.end()
  return sign.sign(privateKey, 'base64')
}

/**
 * Verify signature with Nagad Public Key
 */
export function verifyWithPublicKey(data: string, signature: string, publicKey: string): boolean {
  try {
    const verify = crypto.createVerify('RSA-SHA1')
    verify.update(data)
    verify.end()
    return verify.verify(publicKey, signature, 'base64')
  } catch {
    return false
  }
}

/**
 * Prepare encrypted payload for Nagad API
 */
export function prepareEncryptedPayload(
  sensitiveData: object,
  nagadPublicKey: string,
  merchantPrivateKey: string
): { sensitiveData: string; signature: string } {
  const plainData = JSON.stringify(sensitiveData)
  const encryptedData = encryptWithPublicKey(plainData, nagadPublicKey)
  const signature = signWithPrivateKey(plainData, merchantPrivateKey)
  return { sensitiveData: encryptedData, signature }
}

/**
 * Decrypt and verify Nagad response
 */
export function decryptAndVerifyResponse(
  encryptedData: string,
  signature: string,
  merchantPrivateKey: string,
  nagadPublicKey: string
): object | null {
  try {
    const decryptedData = decryptWithPrivateKey(encryptedData, merchantPrivateKey)
    const isValid = verifyWithPublicKey(decryptedData, signature, nagadPublicKey)
    
    if (!isValid) {
      console.error('Signature verification failed')
      return null
    }
    
    return JSON.parse(decryptedData)
  } catch (error) {
    console.error('Failed to decrypt and verify response:', error)
    return null
  }
}

/**
 * Nagad Payment Service Class
 */
export class NagadPaymentService {
  private config: NagadConfig

  constructor(config: NagadConfig) {
    this.config = config
  }

  /**
   * Initialize Payment - Step 1
   */
  async initialize(orderId: string, accountNumber?: string): Promise<{
    success: boolean
    paymentReferenceId?: string
    challenge?: string
    error?: string
  }> {
    try {
      const dateTime = getNagadDateTime()
      const challenge = generateChallenge()

      // Prepare sensitive data
      const sensitiveData = {
        merchantId: this.config.merchantId,
        dateTime,
        orderId,
        challenge,
      }

      // Encrypt and sign
      const { sensitiveData: encryptedData, signature } = prepareEncryptedPayload(
        sensitiveData,
        this.config.nagadPublicKey,
        this.config.merchantPrivateKey
      )

      // Prepare request
      const requestBody: Record<string, string> = {
        accountNumber: accountNumber || '',
        dateTime,
        sensitiveData: encryptedData,
        signature,
      }

      // Make API call
      const url = `${this.config.baseUrl}${NAGAD_ENDPOINTS.INITIALIZE}/${this.config.merchantId}/${orderId}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': this.config.apiVersion,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.reason || 'Initialization failed',
        }
      }

      // Decrypt response
      const decrypted = decryptAndVerifyResponse(
        data.sensitiveData,
        data.signature,
        this.config.merchantPrivateKey,
        this.config.nagadPublicKey
      )

      if (!decrypted) {
        return { success: false, error: 'Failed to decrypt response' }
      }

      const { paymentReferenceId, random } = decrypted as {
        paymentReferenceId: string
        random: string
      }

      return {
        success: true,
        paymentReferenceId,
        challenge: random,
      }
    } catch (error) {
      console.error('Nagad initialize error:', error)
      return { success: false, error: 'Initialization failed' }
    }
  }

  /**
   * Complete Payment - Step 2
   */
  async complete(
    orderId: string,
    paymentReferenceId: string,
    amount: number,
    challenge: string,
    additionalInfo?: Record<string, string>
  ): Promise<{
    success: boolean
    callBackUrl?: string
    error?: string
  }> {
    try {
      // Prepare sensitive data
      const sensitiveData = {
        merchantId: this.config.merchantId,
        orderId,
        amount: amount.toFixed(2),
        currencyCode: NAGAD_CURRENCY.BDT,
        challenge,
      }

      // Encrypt and sign
      const { sensitiveData: encryptedData, signature } = prepareEncryptedPayload(
        sensitiveData,
        this.config.nagadPublicKey,
        this.config.merchantPrivateKey
      )

      // Prepare request
      const requestBody: Record<string, unknown> = {
        sensitiveData: encryptedData,
        signature,
        merchantCallbackURL: this.config.callbackUrl,
        additionalMerchantInfo: additionalInfo || {},
      }

      // Make API call
      const url = `${this.config.baseUrl}${NAGAD_ENDPOINTS.COMPLETE}/${paymentReferenceId}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': this.config.apiVersion,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.reason || 'Failed to complete order',
        }
      }

      return {
        success: true,
        callBackUrl: data.callBackUrl,
      }
    } catch (error) {
      console.error('Nagad complete error:', error)
      return { success: false, error: 'Failed to complete payment' }
    }
  }

  /**
   * Verify Payment Status
   */
  async verify(paymentReferenceId: string): Promise<{
    success: boolean
    data?: {
      merchantId: string
      orderId: string
      paymentRefId: string
      amount: string
      status: string
      statusCode: string
      issuerPaymentRefNo?: string
      issuerPaymentDateTime?: string
    }
    error?: string
  }> {
    try {
      const url = `${this.config.baseUrl}${NAGAD_ENDPOINTS.VERIFY}/${paymentReferenceId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': this.config.apiVersion,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.reason || 'Verification failed',
        }
      }

      return {
        success: true,
        data: {
          merchantId: data.merchantId,
          orderId: data.orderId,
          paymentRefId: data.paymentRefId,
          amount: data.amount,
          status: data.status,
          statusCode: data.statusCode,
          issuerPaymentRefNo: data.issuerPaymentRefNo,
          issuerPaymentDateTime: data.issuerPaymentDateTime,
        },
      }
    } catch (error) {
      console.error('Nagad verify error:', error)
      return { success: false, error: 'Verification failed' }
    }
  }

  /**
   * Full payment flow
   */
  async createPayment(
    amount: number,
    orderId?: string,
    additionalInfo?: Record<string, string>
  ): Promise<{
    success: boolean
    callBackUrl?: string
    orderId?: string
    paymentReferenceId?: string
    error?: string
  }> {
    const finalOrderId = orderId || generateOrderId()

    // Step 1: Initialize
    const initResult = await this.initialize(finalOrderId)
    if (!initResult.success) {
      return { success: false, orderId: finalOrderId, error: initResult.error }
    }

    // Step 2: Complete
    const completeResult = await this.complete(
      finalOrderId,
      initResult.paymentReferenceId!,
      amount,
      initResult.challenge!,
      additionalInfo
    )

    if (!completeResult.success) {
      return {
        success: false,
        orderId: finalOrderId,
        paymentReferenceId: initResult.paymentReferenceId,
        error: completeResult.error,
      }
    }

    return {
      success: true,
      orderId: finalOrderId,
      paymentReferenceId: initResult.paymentReferenceId,
      callBackUrl: completeResult.callBackUrl,
    }
  }
}

export default NagadPaymentService
