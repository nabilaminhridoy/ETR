/**
 * Nagad Payment Gateway API Service
 * Based on Nagad Online Payment API Integration Guide v3.3
 */

import {
  NagadConfig,
  NAGAD_ENDPOINTS,
  NAGAD_CURRENCY,
  getNagadHeaders,
  NAGAD_STATUS,
} from './config'
import {
  getNagadDateTime,
  generateChallenge,
  generateOrderId,
  prepareEncryptedPayload,
  decryptAndVerifyResponse,
  InitSensitiveData,
  CompleteSensitiveData,
} from './crypto'

// Initialize Response
export interface NagadInitResponse {
  sensitiveData: string
  signature: string
  // Decrypted data
  paymentReferenceId?: string
  random?: string
  acceptDateTime?: string
}

// Complete Order Response
export interface NagadCompleteResponse {
  callBackUrl: string
}

// Payment Verify Response
export interface NagadVerifyResponse {
  merchantId: string
  orderId: string
  paymentRefId: string
  amount: string
  clientMobileNo: string | null
  merchantMobileNo: string
  orderDateTime: string | null
  issuerPaymentDateTime: string | null
  issuerPaymentRefNo: string | null
  additionalMerchantInfo: Record<string, string> | null
  status: string
  statusCode: string
  cancelIssuerDateTime: string | null
  cancelIssuerRefNo: string | null
}

// Callback Response
export interface NagadCallbackParams {
  merchant: string
  order_id: string
  payment_ref_id: string
  status: string
  status_code: string
  payment_dt: string
  issuer_payment_ref: string
}

// Error Response
export interface NagadErrorResponse {
  reason: string
  message: string
}

/**
 * Nagad Payment Gateway Service
 */
export class NagadPaymentService {
  private config: NagadConfig

  constructor(config: NagadConfig) {
    this.config = config
  }

  /**
   * Step 1: Initialize Payment
   * Creates a payment session and returns payment reference ID
   */
  async initializePayment(orderId: string, accountNumber?: string): Promise<{
    success: boolean
    paymentReferenceId?: string
    challenge?: string
    error?: string
  }> {
    try {
      const dateTime = getNagadDateTime()
      const challenge = generateChallenge()

      // Prepare sensitive data
      const sensitiveData: InitSensitiveData = {
        merchantId: this.config.merchantId,
        dateTime: dateTime,
        orderId: orderId,
        challenge: challenge,
      }

      // Encrypt and sign
      const { sensitiveData: encryptedData, signature } = prepareEncryptedPayload(
        sensitiveData,
        this.config.nagadPublicKey,
        this.config.merchantPrivateKey
      )

      // Prepare request body
      const requestBody: Record<string, string> = {
        dateTime: dateTime,
        sensitiveData: encryptedData,
        signature: signature,
      }

      // Add account number if provided (optional)
      if (accountNumber) {
        requestBody.accountNumber = accountNumber
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
        const error = data as NagadErrorResponse
        return {
          success: false,
          error: error.message || `Error: ${error.reason}`,
        }
      }

      // Decrypt response
      const decryptedResponse = decryptAndVerifyResponse(
        data.sensitiveData,
        data.signature,
        this.config.merchantPrivateKey,
        this.config.nagadPublicKey
      )

      if (!decryptedResponse) {
        return {
          success: false,
          error: 'Failed to decrypt initialization response',
        }
      }

      const { paymentReferenceId, random } = decryptedResponse as {
        paymentReferenceId: string
        random: string
        acceptDateTime: string
      }

      return {
        success: true,
        paymentReferenceId,
        challenge: random,
      }
    } catch (error) {
      console.error('Nagad initialize payment error:', error)
      return {
        success: false,
        error: 'Failed to initialize payment',
      }
    }
  }

  /**
   * Step 2: Complete Order (Place Order)
   * Returns the callback URL to redirect user to Nagad payment page
   */
  async completePayment(
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
      const sensitiveData: CompleteSensitiveData = {
        merchantId: this.config.merchantId,
        orderId: orderId,
        amount: amount.toFixed(2),
        currencyCode: NAGAD_CURRENCY.BDT,
        challenge: challenge,
      }

      // Encrypt and sign
      const { sensitiveData: encryptedData, signature } = prepareEncryptedPayload(
        sensitiveData,
        this.config.nagadPublicKey,
        this.config.merchantPrivateKey
      )

      // Prepare request body
      const requestBody: Record<string, unknown> = {
        sensitiveData: encryptedData,
        signature: signature,
        merchantCallbackURL: this.config.callbackUrl,
      }

      // Add additional merchant info if provided
      if (additionalInfo) {
        requestBody.additionalMerchantInfo = additionalInfo
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
        const error = data as NagadErrorResponse
        return {
          success: false,
          error: error.message || `Error: ${error.reason}`,
        }
      }

      return {
        success: true,
        callBackUrl: data.callBackUrl,
      }
    } catch (error) {
      console.error('Nagad complete payment error:', error)
      return {
        success: false,
        error: 'Failed to complete payment',
      }
    }
  }

  /**
   * Step 3: Verify Payment Status
   * Check the status of a payment
   */
  async verifyPayment(paymentReferenceId: string): Promise<{
    success: boolean
    data?: NagadVerifyResponse
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
        const error = data as NagadErrorResponse
        return {
          success: false,
          error: error.message || `Error: ${error.reason}`,
        }
      }

      return {
        success: true,
        data: data as NagadVerifyResponse,
      }
    } catch (error) {
      console.error('Nagad verify payment error:', error)
      return {
        success: false,
        error: 'Failed to verify payment',
      }
    }
  }

  /**
   * Process full payment flow
   * Combines initialize and complete steps
   */
  async processPayment(
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
    // Generate order ID if not provided
    const finalOrderId = orderId || generateOrderId()

    // Step 1: Initialize
    const initResult = await this.initializePayment(finalOrderId)
    if (!initResult.success) {
      return {
        success: false,
        orderId: finalOrderId,
        error: initResult.error,
      }
    }

    // Step 2: Complete
    const completeResult = await this.completePayment(
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

  /**
   * Check if payment is successful
   */
  static isPaymentSuccessful(status: string): boolean {
    return status === NAGAD_STATUS.SUCCESS
  }

  /**
   * Check if payment is failed
   */
  static isPaymentFailed(status: string): boolean {
    return [
      NAGAD_STATUS.FAILED,
      NAGAD_STATUS.CANCELLED,
      NAGAD_STATUS.ABORTED,
      NAGAD_STATUS.FRAUD,
      NAGAD_STATUS.INVALID_REQUEST,
      NAGAD_STATUS.UNKNOWN_FAILED,
    ].includes(status)
  }
}

export default NagadPaymentService
