/**
 * Nagad Payment Gateway Crypto Utilities
 * Based on Nagad Online Payment API Integration Guide v3.3
 * 
 * Encryption: RSA with PKCS1Padding
 * Signature: SHA1withRSA
 * Encoding: Base64
 */

import crypto from 'crypto'

/**
 * Generate RSA Key Pair (for merchant)
 * Used during onboarding to generate merchant keys
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

  return {
    publicKey: publicKey.toString(),
    privateKey: privateKey.toString(),
  }
}

/**
 * Encrypt sensitive data using Nagad Public Key
 * Algorithm: RSA with PKCS1Padding
 */
export function encryptWithPublicKey(plainData: string, publicKey: string): string {
  try {
    const buffer = Buffer.from(plainData, 'utf-8')
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    )
    return encrypted.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data using Merchant Private Key
 * Algorithm: RSA with PKCS1Padding
 */
export function decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64')
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    )
    return decrypted.toString('utf-8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Generate digital signature using Merchant Private Key
 * Algorithm: SHA1withRSA
 */
export function signWithPrivateKey(data: string, privateKey: string): string {
  try {
    const sign = crypto.createSign('RSA-SHA1')
    sign.update(data)
    sign.end()
    const signature = sign.sign(privateKey, 'base64')
    return signature
  } catch (error) {
    console.error('Signature error:', error)
    throw new Error('Failed to sign data')
  }
}

/**
 * Verify signature using Nagad Public Key
 * Algorithm: SHA1withRSA
 */
export function verifyWithPublicKey(data: string, signature: string, publicKey: string): boolean {
  try {
    const verify = crypto.createVerify('RSA-SHA1')
    verify.update(data)
    verify.end()
    return verify.verify(publicKey, signature, 'base64')
  } catch (error) {
    console.error('Verification error:', error)
    return false
  }
}

/**
 * Generate random challenge string (40 hex characters)
 */
export function generateChallenge(): string {
  return crypto.randomBytes(20).toString('hex').toUpperCase()
}

/**
 * Generate Order ID
 * Format: alphanumeric, 5-20 characters
 */
export function generateOrderId(prefix: string = 'ORD'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}${timestamp}${random}`.substring(0, 20)
}

/**
 * Get current datetime in Nagad format
 * Format: yyyyMMddHHmmSS (14 characters)
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
 * Prepare sensitive data for Initialize API
 */
export interface InitSensitiveData {
  merchantId: string
  dateTime: string
  orderId: string
  challenge: string
}

/**
 * Prepare sensitive data for Complete API
 */
export interface CompleteSensitiveData {
  merchantId: string
  orderId: string
  amount: string
  currencyCode: string
  challenge: string
  otherAmount?: {
    serviceFee?: string
  }
}

/**
 * Prepare encrypted request payload
 */
export function prepareEncryptedPayload(
  sensitiveData: object,
  nagadPublicKey: string,
  merchantPrivateKey: string
): { sensitiveData: string; signature: string } {
  const plainData = JSON.stringify(sensitiveData)
  
  // Encrypt with Nagad public key
  const encryptedData = encryptWithPublicKey(plainData, nagadPublicKey)
  
  // Sign with merchant private key
  const signature = signWithPrivateKey(plainData, merchantPrivateKey)
  
  return {
    sensitiveData: encryptedData,
    signature: signature,
  }
}

/**
 * Decrypt and verify response from Nagad
 */
export function decryptAndVerifyResponse(
  encryptedData: string,
  signature: string,
  merchantPrivateKey: string,
  nagadPublicKey: string
): object | null {
  try {
    // Decrypt with merchant private key
    const decryptedData = decryptWithPrivateKey(encryptedData, merchantPrivateKey)
    
    // Verify signature with Nagad public key
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
