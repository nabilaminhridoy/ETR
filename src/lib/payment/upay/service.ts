/**
 * Upay Payment Service (Server-side)
 * Based on Upay PGW API V4.1.0
 */

import { db } from '@/lib/db'
import {
  UpayConfig,
  UpayCredentials,
  UPAY_URLS,
  UPAY_ENDPOINTS,
  UPAY_RESPONSE_CODES,
  UPAY_DEFAULTS,
} from './config'

/**
 * Get Upay configuration from database
 */
export async function getUpayConfigFromDB(): Promise<UpayConfig | null> {
  try {
    const gateway = await db.$queryRaw`
      SELECT credentials, isEnabled, isSandbox 
      FROM PaymentGateway 
      WHERE name = 'upay'
    `

    const gatewayData = Array.isArray(gateway) && gateway.length > 0 
      ? (gateway[0] as { credentials: string | null; isEnabled: number; isSandbox: number }) 
      : null

    if (!gatewayData || !gatewayData.isEnabled || !gatewayData.credentials) {
      return null
    }

    const credentials = JSON.parse(gatewayData.credentials) as UpayCredentials & {
      label?: string
      description?: string
    }

    const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const isSandbox = !!gatewayData.isSandbox

    return {
      merchantId: credentials.merchantId,
      merchantKey: credentials.merchantKey,
      merchantName: credentials.merchantName || 'Merchant',
      merchantCode: credentials.merchantCode,
      merchantCity: credentials.merchantCity || UPAY_DEFAULTS.merchantCity,
      merchantMobile: credentials.merchantMobile,
      merchantCountryCode: credentials.merchantCountryCode || UPAY_DEFAULTS.merchantCountryCode,
      merchantCategoryCode: credentials.merchantCategoryCode || credentials.merchantCode,
      transactionCurrencyCode: credentials.transactionCurrencyCode || UPAY_DEFAULTS.transactionCurrencyCode,
      baseUrl: isSandbox ? UPAY_URLS.sandbox : UPAY_URLS.production,
      redirectUrl: `${host}/api/payment/upay/callback`,
      isSandbox,
    }
  } catch (error) {
    console.error('Error fetching Upay config:', error)
    return null
  }
}

/**
 * Generate Transaction ID
 */
export function generateTxnId(prefix: string = 'UPAY'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}${random}`.substring(0, 50)
}

/**
 * Generate Invoice ID
 */
export function generateInvoiceId(prefix: string = 'INV'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}${random}`.substring(0, 50)
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Upay Payment Service Class
 */
export class UpayPaymentService {
  private config: UpayConfig
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: UpayConfig) {
    this.config = config
  }

  /**
   * Get authorization token
   * Token is cached and reused until expired
   */
  private async getAuthToken(): Promise<{ success: boolean; token?: string; error?: string }> {
    // Return cached token if still valid (tokens typically last 1 hour)
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return { success: true, token: this.authToken }
    }

    try {
      const url = `${this.config.baseUrl}${UPAY_ENDPOINTS.AUTH}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          merchant_key: this.config.merchantKey,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.code !== 'MAS2001') {
        return {
          success: false,
          error: data.message || UPAY_RESPONSE_CODES[data.code] || 'Authentication failed',
        }
      }

      // Cache token for 55 minutes (safe margin before 1 hour expiry)
      this.authToken = data.data.token
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)

      return { success: true, token: this.authToken }
    } catch (error) {
      console.error('Upay auth error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  /**
   * Initialize Payment
   * Returns gateway URL to redirect customer
   */
  async initializePayment(
    amount: number,
    txnId?: string,
    invoiceId?: string,
    additionalInfo?: Record<string, unknown>
  ): Promise<{
    success: boolean
    gatewayUrl?: string
    sessionId?: string
    txnId?: string
    trxId?: string
    invoiceId?: string
    error?: string
  }> {
    try {
      // Get auth token
      const authResult = await this.getAuthToken()
      if (!authResult.success || !authResult.token) {
        return { success: false, error: authResult.error || 'Authentication failed' }
      }

      // Generate IDs if not provided
      const finalTxnId = txnId || generateTxnId()
      const finalInvoiceId = invoiceId || generateInvoiceId()

      // Prepare request body
      const requestBody = {
        date: getCurrentDate(),
        txn_id: finalTxnId,
        invoice_id: finalInvoiceId,
        amount: amount.toFixed(2),
        merchant_id: this.config.merchantId,
        merchant_name: this.config.merchantName,
        merchant_code: this.config.merchantCode,
        merchant_country_code: this.config.merchantCountryCode,
        merchant_city: this.config.merchantCity,
        merchant_category_code: this.config.merchantCategoryCode,
        merchant_mobile: this.config.merchantMobile,
        transaction_currency_code: this.config.transactionCurrencyCode,
        redirect_url: this.config.redirectUrl,
        additional_info: additionalInfo || {},
        is_cashback: false,
        seat_count: '',
      }

      const url = `${this.config.baseUrl}${UPAY_ENDPOINTS.INIT}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `UPAY ${authResult.token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok || data.code !== 'MPIS2002') {
        return {
          success: false,
          txnId: finalTxnId,
          error: data.message || UPAY_RESPONSE_CODES[data.code] || 'Payment initialization failed',
        }
      }

      return {
        success: true,
        gatewayUrl: data.data.gateway_url,
        sessionId: data.data.session_id,
        txnId: data.data.txn_id,
        trxId: data.data.trx_id,
        invoiceId: data.data.invoice_id,
      }
    } catch (error) {
      console.error('Upay init payment error:', error)
      return { success: false, error: 'Payment initialization failed' }
    }
  }

  /**
   * Check Single Payment Status
   */
  async checkPaymentStatus(txnId: string): Promise<{
    success: boolean
    data?: {
      txnId: string
      trxId: string
      invoiceId: string
      sessionId: string
      status: string
      amount: number
      merchantName: string
      customerWallet: string
      date: string
    }
    error?: string
  }> {
    try {
      // Get auth token
      const authResult = await this.getAuthToken()
      if (!authResult.success || !authResult.token) {
        return { success: false, error: authResult.error || 'Authentication failed' }
      }

      const url = `${this.config.baseUrl}${UPAY_ENDPOINTS.SINGLE_STATUS}/${txnId}/`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `UPAY ${authResult.token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || data.code !== 'PS2005') {
        return {
          success: false,
          error: data.message || UPAY_RESPONSE_CODES[data.code] || 'Payment not found',
        }
      }

      return {
        success: true,
        data: {
          txnId: data.data.txn_id,
          trxId: data.data.trx_id,
          invoiceId: data.data.invoice_id,
          sessionId: data.data.session_id,
          status: data.data.status,
          amount: parseFloat(data.data.amount),
          merchantName: data.data.merchant_name,
          customerWallet: data.data.customer_wallet,
          date: data.data.date,
        },
      }
    } catch (error) {
      console.error('Upay check status error:', error)
      return { success: false, error: 'Failed to check payment status' }
    }
  }

  /**
   * Check Bulk Payment Status
   */
  async checkBulkPaymentStatus(txnIdList: string[]): Promise<{
    success: boolean
    data?: Array<{
      txnId: string
      trxId: string
      invoiceId: string
      sessionId: string
      status: string
      amount: number
      merchantName: string
      customerWallet: string
      date: string
    }>
    error?: string
  }> {
    try {
      // Get auth token
      const authResult = await this.getAuthToken()
      if (!authResult.success || !authResult.token) {
        return { success: false, error: authResult.error || 'Authentication failed' }
      }

      const url = `${this.config.baseUrl}${UPAY_ENDPOINTS.BULK_STATUS}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `UPAY ${authResult.token}`,
        },
        body: JSON.stringify({ txn_id_list: txnIdList }),
      })

      const data = await response.json()

      if (!response.ok || data.code !== 'PS2005') {
        return {
          success: false,
          error: data.message || UPAY_RESPONSE_CODES[data.code] || 'Failed to get payment status',
        }
      }

      const payments = data.data.map((item: Record<string, unknown>) => ({
        txnId: item.txn_id as string,
        trxId: item.trx_id as string,
        invoiceId: item.invoice_id as string,
        sessionId: item.session_id as string,
        status: item.status as string,
        amount: parseFloat(item.amount as string),
        merchantName: item.merchant_name as string,
        customerWallet: item.customer_wallet as string,
        date: item.date as string,
      }))

      return { success: true, data: payments }
    } catch (error) {
      console.error('Upay bulk status error:', error)
      return { success: false, error: 'Failed to check bulk payment status' }
    }
  }

  /**
   * Process Bulk Refund
   */
  async processBulkRefund(
    refunds: Array<{ txnId: string; amount: number }>
  ): Promise<{
    success: boolean
    successList?: string[]
    failedList?: Array<Record<string, { en: string; bn: string }>>
    error?: string
  }> {
    try {
      // Get auth token
      const authResult = await this.getAuthToken()
      if (!authResult.success || !authResult.token) {
        return { success: false, error: authResult.error || 'Authentication failed' }
      }

      const url = `${this.config.baseUrl}${UPAY_ENDPOINTS.BULK_REFUND}`

      const requestBody = refunds.map((r) => ({
        txn_id: r.txnId,
        refund_amount: r.amount.toFixed(0),
      }))

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `UPAY ${authResult.token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok || data.code !== 'MPR_200') {
        return {
          success: false,
          error: data.message || UPAY_RESPONSE_CODES[data.code] || 'Refund failed',
        }
      }

      return {
        success: true,
        successList: data.data.success_list,
        failedList: data.data.failed_list,
      }
    } catch (error) {
      console.error('Upay refund error:', error)
      return { success: false, error: 'Failed to process refund' }
    }
  }

  /**
   * Check if payment is successful
   */
  static isPaymentSuccessful(status: string): boolean {
    return status.toLowerCase() === 'success'
  }

  /**
   * Check if payment is failed
   */
  static isPaymentFailed(status: string): boolean {
    const failedStatuses = ['failed', 'cancelled', 'expired']
    return failedStatuses.includes(status.toLowerCase())
  }

  /**
   * Check if payment is pending
   */
  static isPaymentPending(status: string): boolean {
    return status.toLowerCase() === 'pending'
  }
}

/**
 * Get Upay configuration (alias for getUpayConfigFromDB)
 */
export async function getUpayConfig(): Promise<UpayConfig | null> {
  return getUpayConfigFromDB()
}

export default UpayPaymentService
