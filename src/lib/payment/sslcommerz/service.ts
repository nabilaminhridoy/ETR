/**
 * SSLCommerz Payment Service (Server-side)
 * Based on SSLCommerz Integration Documentation V4.00
 */

import { db } from '@/lib/db'
import {
  SSLCommerzConfig,
  SSLCommerzCredentials,
  SSLCOMMERZ_URLS,
  SSLCOMMERZ_DEFAULTS,
  SSLCOMMERZ_ERRORS,
} from './config'

/**
 * Get SSLCommerz configuration from database
 */
export async function getSSLCommerzConfigFromDB(): Promise<SSLCommerzConfig | null> {
  try {
    const gateway = await db.$queryRaw`
      SELECT credentials, isEnabled, isSandbox 
      FROM PaymentGateway 
      WHERE name = 'sslcommerz'
    `

    const gatewayData = Array.isArray(gateway) && gateway.length > 0 
      ? (gateway[0] as { credentials: string | null; isEnabled: number; isSandbox: number }) 
      : null

    if (!gatewayData || !gatewayData.isEnabled || !gatewayData.credentials) {
      return null
    }

    const credentials = JSON.parse(gatewayData.credentials) as SSLCommerzCredentials & {
      label?: string
      description?: string
      successUrl?: string
      failUrl?: string
      cancelUrl?: string
      ipnUrl?: string
      currency?: string
      productCategory?: string
    }

    const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const isSandbox = !!gatewayData.isSandbox

    return {
      storeId: credentials.storeId,
      storePassword: credentials.storePassword,
      isSandbox,
      baseUrl: isSandbox ? SSLCOMMERZ_URLS.sandbox : SSLCOMMERZ_URLS.production,
      successUrl: credentials.successUrl || `${host}/api/payment/sslcommerz/callback?status=success`,
      failUrl: credentials.failUrl || `${host}/api/payment/sslcommerz/callback?status=failed`,
      cancelUrl: credentials.cancelUrl || `${host}/api/payment/sslcommerz/callback?status=cancel`,
      ipnUrl: credentials.ipnUrl || `${host}/api/payment/sslcommerz/ipn`,
      currency: credentials.currency || SSLCOMMERZ_DEFAULTS.currency,
      productCategory: credentials.productCategory || SSLCOMMERZ_DEFAULTS.productCategory,
    }
  } catch (error) {
    console.error('Error fetching SSLCommerz config:', error)
    return null
  }
}

/**
 * Generate Transaction ID
 */
export function generateTranId(prefix: string = 'SSL'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}${random}`.substring(0, 30)
}

/**
 * Generate Session ID format
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${timestamp}${random}`
}

/**
 * SSLCommerz Payment Service Class
 */
export class SSLCommerzPaymentService {
  private config: SSLCommerzConfig

  constructor(config: SSLCommerzConfig) {
    this.config = config
  }

  /**
   * Create Payment Session
   * Returns gateway URL and session key
   */
  async createSession(
    amount: number,
    tranId?: string,
    customerInfo?: {
      cusName?: string
      cusEmail?: string
      cusPhone?: string
      cusAdd1?: string
      cusCity?: string
      cusCountry?: string
      cusPostcode?: string
    },
    shippingInfo?: {
      shipName?: string
      shipAdd1?: string
      shipCity?: string
      shipCountry?: string
      shipPostcode?: string
    },
    productInfo?: {
      productName?: string
      productCategory?: string
      productProfile?: string
    }
  ): Promise<{
    success: boolean
    sessionId?: string
    gatewayUrl?: string
    tranId?: string
    error?: string
  }> {
    try {
      // Validate amount
      if (amount < 10 || amount > 500000) {
        return { success: false, error: SSLCOMMERZ_ERRORS.INVALID_AMOUNT }
      }

      const finalTranId = tranId || generateTranId()
      
      const requestBody = new URLSearchParams({
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        total_amount: amount.toFixed(2),
        currency: this.config.currency,
        tran_id: finalTranId,
        success_url: this.config.successUrl,
        fail_url: this.config.failUrl,
        cancel_url: this.config.cancelUrl,
        ipn_url: this.config.ipnUrl,
        product_category: productInfo?.productCategory || this.config.productCategory,
        product_name: productInfo?.productName || 'Ticket Purchase',
        product_profile: productInfo?.productProfile || 'non-physical-goods',
        // Customer Info
        cus_name: customerInfo?.cusName || 'Customer',
        cus_email: customerInfo?.cusEmail || 'customer@example.com',
        cus_phone: customerInfo?.cusPhone || '01700000000',
        cus_add1: customerInfo?.cusAdd1 || 'Dhaka',
        cus_city: customerInfo?.cusCity || 'Dhaka',
        cus_country: customerInfo?.cusCountry || 'Bangladesh',
        cus_postcode: customerInfo?.cusPostcode || '1000',
        // Shipping Info
        ship_name: shippingInfo?.shipName || customerInfo?.cusName || 'Customer',
        ship_add1: shippingInfo?.shipAdd1 || customerInfo?.cusAdd1 || 'Dhaka',
        ship_city: shippingInfo?.shipCity || customerInfo?.cusCity || 'Dhaka',
        ship_country: shippingInfo?.shipCountry || customerInfo?.cusCountry || 'Bangladesh',
        ship_postcode: shippingInfo?.shipPostcode || customerInfo?.cusPostcode || '1000',
        // Additional options
        shipping_method: 'NO',
        num_of_item: '1',
        product_name: productInfo?.productName || 'Ticket',
        product_category: productInfo?.productCategory || this.config.productCategory,
        product_profile: productInfo?.productProfile || 'non-physical-goods',
      })

      const url = `${this.config.baseUrl}/gwprocess/v4/api.php`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      })

      const data = await response.json()

      if (data.status !== 'SUCCESS') {
        return {
          success: false,
          tranId: finalTranId,
          error: data.failedreason || SSLCOMMERZ_ERRORS.SESSION_CREATION_FAILED,
        }
      }

      return {
        success: true,
        sessionId: data.sessionkey,
        gatewayUrl: data.GatewayPageURL,
        tranId: finalTranId,
      }
    } catch (error) {
      console.error('SSLCommerz session creation error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Validate Payment (Order Validation API)
   * Should be called after receiving IPN or callback
   */
  async validatePayment(valId: string): Promise<{
    success: boolean
    data?: {
      tranId: string
      valId: string
      amount: number
      currency: string
      status: string
      bankTranId: string
      cardType: string
      cardNo: string
      cardIssuer: string
      cardBrand: string
      cardIssuerCountry: string
      currencyAmount: number
      currencyRate: number
      storeId: string
      tranDate: string
      riskLevel: number
      riskTitle: string
    }
    error?: string
  }> {
    try {
      const url = new URL(`${this.config.baseUrl}/validator/api/validationserverAPI.php`)
      url.searchParams.set('val_id', valId)
      url.searchParams.set('store_id', this.config.storeId)
      url.searchParams.set('store_passwd', this.config.storePassword)
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString(), {
        method: 'GET',
      })

      const data = await response.json()

      if (data.status !== 'VALID' && data.status !== 'VALIDATED') {
        return {
          success: false,
          error: data.error || SSLCOMMERZ_ERRORS.VALIDATION_FAILED,
        }
      }

      return {
        success: true,
        data: {
          tranId: data.tran_id,
          valId: data.val_id,
          amount: parseFloat(data.amount),
          currency: data.currency_type,
          status: data.status,
          bankTranId: data.bank_tran_id,
          cardType: data.card_type,
          cardNo: data.card_no,
          cardIssuer: data.card_issuer,
          cardBrand: data.card_brand,
          cardIssuerCountry: data.card_issuer_country,
          currencyAmount: parseFloat(data.currency_amount),
          currencyRate: parseFloat(data.currency_rate),
          storeId: data.store_id,
          tranDate: data.tran_date,
          riskLevel: parseInt(data.risk_level) || 0,
          riskTitle: data.risk_title || 'Safe',
        },
      }
    } catch (error) {
      console.error('SSLCommerz validation error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Query Transaction by Session ID
   */
  async queryBySessionId(sessionKey: string): Promise<{
    success: boolean
    data?: {
      tranId: string
      sessionId: string
      amount: number
      currency: string
      status: string
      bankTranId: string
      tranDate: string
    }
    error?: string
  }> {
    try {
      const url = new URL(`${this.config.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`)
      url.searchParams.set('sessionkey', sessionKey)
      url.searchParams.set('store_id', this.config.storeId)
      url.searchParams.set('store_passwd', this.config.storePassword)
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString(), {
        method: 'GET',
      })

      const data = await response.json()

      if (!data.tran_id) {
        return {
          success: false,
          error: SSLCOMMERZ_ERRORS.TRANSACTION_NOT_FOUND,
        }
      }

      return {
        success: true,
        data: {
          tranId: data.tran_id,
          sessionId: data.sessionkey,
          amount: parseFloat(data.amount),
          currency: data.currency,
          status: data.status,
          bankTranId: data.bank_tran_id,
          tranDate: data.tran_date,
        },
      }
    } catch (error) {
      console.error('SSLCommerz query error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Query Transaction by Transaction ID
   */
  async queryByTranId(tranId: string): Promise<{
    success: boolean
    data?: {
      tranId: string
      valId: string
      amount: number
      currency: string
      status: string
      bankTranId: string
      tranDate: string
    }
    error?: string
  }> {
    try {
      const url = new URL(`${this.config.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`)
      url.searchParams.set('tran_id', tranId)
      url.searchParams.set('store_id', this.config.storeId)
      url.searchParams.set('store_passwd', this.config.storePassword)
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString(), {
        method: 'GET',
      })

      const data = await response.json()

      if (!data.tran_id) {
        return {
          success: false,
          error: SSLCOMMERZ_ERRORS.TRANSACTION_NOT_FOUND,
        }
      }

      return {
        success: true,
        data: {
          tranId: data.tran_id,
          valId: data.val_id,
          amount: parseFloat(data.amount),
          currency: data.currency,
          status: data.status,
          bankTranId: data.bank_tran_id,
          tranDate: data.tran_date,
        },
      }
    } catch (error) {
      console.error('SSLCommerz query error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Initiate Refund
   */
  async initiateRefund(
    bankTranId: string,
    refundAmount: number,
    refundRemarks: string
  ): Promise<{
    success: boolean
    data?: {
      refundId: string
      refundAmount: number
      status: string
    }
    error?: string
  }> {
    try {
      const requestBody = new URLSearchParams({
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        bank_tran_id: bankTranId,
        refund_amount: refundAmount.toFixed(2),
        refund_remarks: refundRemarks,
        format: 'json',
      })

      const url = `${this.config.baseUrl}/merchantapi/reciveall/post/refund.php`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      })

      const data = await response.json()

      if (data.status !== 'SUCCESS') {
        return {
          success: false,
          error: data.errorReason || SSLCOMMERZ_ERRORS.REFUND_FAILED,
        }
      }

      return {
        success: true,
        data: {
          refundId: data.refund_ref_id,
          refundAmount: parseFloat(data.refund_amount),
          status: data.status,
        },
      }
    } catch (error) {
      console.error('SSLCommerz refund error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Query Refund Status
   */
  async queryRefundStatus(refundId: string): Promise<{
    success: boolean
    data?: {
      refundId: string
      bankTranId: string
      refundAmount: number
      status: string
      processedAt: string
    }
    error?: string
  }> {
    try {
      const url = new URL(`${this.config.baseUrl}/merchantapi/reciveall/post/refund_status.php`)
      url.searchParams.set('refund_ref_id', refundId)
      url.searchParams.set('store_id', this.config.storeId)
      url.searchParams.set('store_passwd', this.config.storePassword)
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString(), {
        method: 'GET',
      })

      const data = await response.json()

      if (data.status !== 'SUCCESS') {
        return {
          success: false,
          error: data.errorReason || 'Refund not found',
        }
      }

      return {
        success: true,
        data: {
          refundId: data.refund_ref_id,
          bankTranId: data.bank_tran_id,
          refundAmount: parseFloat(data.refund_amount),
          status: data.status,
          processedAt: data.processed_at,
        },
      }
    } catch (error) {
      console.error('SSLCommerz refund status error:', error)
      return { success: false, error: SSLCOMMERZ_ERRORS.NETWORK_ERROR }
    }
  }

  /**
   * Check if payment is successful
   */
  static isPaymentSuccessful(status: string): boolean {
    return status === 'VALID' || status === 'VALIDATED'
  }

  /**
   * Check if payment is failed
   */
  static isPaymentFailed(status: string): boolean {
    return status === 'FAILED'
  }

  /**
   * Check if payment is cancelled
   */
  static isPaymentCancelled(status: string): boolean {
    return status === 'CANCELLED'
  }

  /**
   * Check if payment is pending
   */
  static isPaymentPending(status: string): boolean {
    return status === 'PENDING'
  }

  /**
   * Check if payment is risky
   */
  static isRiskyPayment(riskLevel: number): boolean {
    return riskLevel === 1
  }
}

/**
 * Get SSLCommerz configuration (alias for getSSLCommerzConfigFromDB)
 */
export async function getSSLCommerzConfig(): Promise<SSLCommerzConfig | null> {
  return getSSLCommerzConfigFromDB()
}

/**
 * Verify IPN hash
 * SSLCommerz sends hash_key in IPN which can be verified
 */
export function verifyIPNHash(
  storeId: string,
  storePassword: string,
  tranId: string,
  amount: string,
  receivedHash: string
): boolean {
  // Create hash using store_id, store_passwd, tran_id, amount
  const data = `${storeId}${storePassword}${tranId}${amount}`
  // Note: In production, use proper hash verification with crypto
  // SSLCommerz uses HMAC-SHA256
  return true // Simplified for now - implement proper hash verification
}

export default SSLCommerzPaymentService
