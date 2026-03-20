/**
 * bKash Tokenized Checkout API Service
 * 
 * Documentation: https://developer.bka.sh/docs/tokenized-checkout-process
 * 
 * API Endpoints:
 * - Grant Token: POST /tokenized/checkout/token/grant
 * - Refresh Token: POST /tokenized/checkout/token/refresh
 * - Create Payment: POST /tokenized/checkout/create
 * - Execute Payment: POST /tokenized/checkout/execute
 * - Query Payment: GET /tokenized/checkout/payment/status
 * - Search Transaction: GET /tokenized/checkout/general/searchTransaction
 * - Refund: POST /tokenized/checkout/payment/refund
 * - Refund Status: GET /tokenized/checkout/payment/refund
 * - Create Agreement: POST /tokenized/checkout/create
 * - Execute Agreement: POST /tokenized/checkout/execute
 * - Query Agreement: GET /tokenized/checkout/agreement/status
 * - Cancel Agreement: POST /tokenized/checkout/agreement/cancel
 */

export interface BkashConfig {
  appKey: string
  appSecret: string
  username: string
  password: string
  isSandbox: boolean
}

export interface BkashTokenResponse {
  id_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

export interface BkashPaymentCreateRequest {
  mode: '0011' // 0011 for tokenized checkout
  payerReference: string
  callbackURL: string
  amount: string
  currency: string
  intent: string
  merchantInvoiceNumber: string
}

export interface BkashPaymentCreateResponse {
  paymentID: string
  createTime: string
  orgLogo: string
  orgName: string
  transactionStatus: string
  amount: string
  currency: string
  intent: string
  merchantInvoiceNumber: string
  callbackURL: string
  payerReference?: string
  agreementID?: string
  paymentExecuteTime?: string
  bkashURL?: string
}

export interface BkashPaymentExecuteResponse {
  paymentID: string
  createTime: string
  updateTime: string
  trxID: string
  transactionStatus: string
  amount: string
  currency: string
  intent: string
  merchantInvoiceNumber: string
  payerReference?: string
  agreementID?: string
  paymentExecuteTime?: string
  payerMsisdn?: string
}

export interface BkashQueryPaymentResponse {
  paymentID: string
  createTime: string
  updateTime: string
  trxID: string
  transactionStatus: string
  amount: string
  currency: string
  intent: string
  merchantInvoiceNumber: string
  payerReference?: string
  agreementID?: string
  paymentExecuteTime?: string
  payerMsisdn?: string
}

export interface BkashSearchTransactionResponse {
  amount: string
  currency: string
  merchantInvoiceNumber: string
  payerMsisdn?: string
  paymentReferenceId?: string
  transactionStatus: string
  trxID: string
  transactionType: string
  transferType: string
  reversedAmount?: string
  destinationMsisdn?: string
  transferredAmount?: string
}

export interface BkashRefundRequest {
  paymentID: string
  amount: string
  trxID: string
  sku?: string
  reason?: string
}

export interface BkashRefundResponse {
  refundTrxID: string
  paymentID: string
  amount: string
  currency: string
  trxID: string
  refundStatus: string
  completedTime: string
}

export interface BkashAgreementCreateRequest {
  mode: '0000'
  payerReference: string
  callbackURL: string
  amount?: string
  currency?: string
  intent?: string
}

export interface BkashAgreementCreateResponse {
  paymentID: string
  createTime: string
  orgLogo: string
  orgName: string
  transactionStatus: string
  amount?: string
  currency?: string
  intent?: string
  merchantInvoiceNumber?: string
  callbackURL: string
  payerReference?: string
  agreementID?: string
  bkashURL?: string
}

export interface BkashAgreementExecuteResponse {
  paymentID: string
  createTime: string
  updateTime: string
  trxID?: string
  transactionStatus: string
  amount?: string
  currency?: string
  intent?: string
  merchantInvoiceNumber?: string
  payerReference?: string
  agreementID?: string
  paymentExecuteTime?: string
}

export interface BkashQueryAgreementResponse {
  agreementID: string
  payerReference?: string
  agreementStatus: string
  agreementCreateTime: string
  agreementExecuteTime?: string
  mode: string
  orgLogo: string
  orgName: string
  msisdn?: string
}

export interface BkashCancelAgreementResponse {
  agreementID: string
  agreementStatus: string
  agreementCancelTime: string
}

// Token cache to avoid repeated API calls
interface TokenCache {
  id_token: string
  refresh_token: string
  expires_at: number
}

let tokenCache: TokenCache | null = null

export class BkashService {
  private config: BkashConfig
  private baseUrl: string

  constructor(config: BkashConfig) {
    this.config = config
    this.baseUrl = config.isSandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta'
  }

  /**
   * Get the base URL for bKash API
   */
  getBaseUrl(): string {
    return this.baseUrl
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    if (!tokenCache) return false
    // Add 60 seconds buffer before expiry
    return Date.now() < (tokenCache.expires_at - 60000)
  }

  /**
   * Grant Token - Get new access token
   * Documentation: https://developer.bka.sh/docs/grant-token-3
   */
  async grantToken(): Promise<BkashTokenResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/token/grant`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.config.username,
        'password': this.config.password,
      },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to grant token: ${error}`)
    }

    const data: BkashTokenResponse = await response.json()
    
    // Cache the token
    tokenCache = {
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    }

    return data
  }

  /**
   * Refresh Token - Refresh the access token
   * Documentation: https://developer.bka.sh/docs/refresh-token-3
   */
  async refreshToken(refreshToken: string): Promise<BkashTokenResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/token/refresh`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.config.username,
        'password': this.config.password,
      },
      body: JSON.stringify({
        app_key: this.config.appKey,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh token: ${error}`)
    }

    const data: BkashTokenResponse = await response.json()
    
    // Cache the token
    tokenCache = {
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    }

    return data
  }

  /**
   * Get valid token (either from cache or grant new)
   */
  private async getValidToken(): Promise<string> {
    if (this.isTokenValid() && tokenCache) {
      return tokenCache.id_token
    }

    // Try to refresh if we have a refresh token
    if (tokenCache?.refresh_token) {
      try {
        const data = await this.refreshToken(tokenCache.refresh_token)
        return data.id_token
      } catch {
        // Refresh failed, get new token
      }
    }

    // Grant new token
    const data = await this.grantToken()
    return data.id_token
  }

  /**
   * Get headers for authenticated requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-App-Key': this.config.appKey,
    }
  }

  /**
   * Create Payment - Create a payment request
   * Documentation: https://developer.bka.sh/docs/create-payment-1
   */
  async createPayment(params: {
    amount: string | number
    merchantInvoiceNumber: string
    callbackURL: string
    payerReference?: string
    agreementID?: string
    mode?: '0011' | '0012' // 0011 for one-time, 0012 for agreement-based
    currency?: string
    intent?: string
  }): Promise<BkashPaymentCreateResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/create`
    const headers = await this.getAuthHeaders()

    const requestBody: BkashPaymentCreateRequest = {
      mode: params.mode || '0011',
      payerReference: params.payerReference || '',
      callbackURL: params.callbackURL,
      amount: String(params.amount),
      currency: params.currency || 'BDT',
      intent: params.intent || 'sale',
      merchantInvoiceNumber: params.merchantInvoiceNumber,
    }

    // If agreement ID is provided, include it
    if (params.agreementID) {
      (requestBody as any).agreementID = params.agreementID
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create payment: ${error}`)
    }

    return response.json()
  }

  /**
   * Execute Payment - Finalize a payment
   * Documentation: https://developer.bka.sh/docs/execute-payment-1
   */
  async executePayment(paymentID: string): Promise<BkashPaymentExecuteResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/execute`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentID }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to execute payment: ${error}`)
    }

    return response.json()
  }

  /**
   * Query Payment - Check payment status
   * Documentation: https://developer.bka.sh/docs/query-payment-3
   */
  async queryPayment(paymentID: string): Promise<BkashQueryPaymentResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/payment/status?paymentID=${paymentID}`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to query payment: ${error}`)
    }

    return response.json()
  }

  /**
   * Search Transaction - Search for a transaction by trxID
   * Documentation: https://developer.bka.sh/docs/search-transaction-3
   */
  async searchTransaction(trxID: string): Promise<BkashSearchTransactionResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/general/searchTransaction?trxID=${trxID}`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to search transaction: ${error}`)
    }

    return response.json()
  }

  /**
   * Refund Transaction - Refund a payment
   * Documentation: https://developer.bka.sh/docs/refund-transaction-4
   */
  async refund(params: {
    paymentID: string
    amount: string | number
    trxID: string
    sku?: string
    reason?: string
  }): Promise<BkashRefundResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/payment/refund`
    const headers = await this.getAuthHeaders()

    const requestBody: BkashRefundRequest = {
      paymentID: params.paymentID,
      amount: String(params.amount),
      trxID: params.trxID,
      sku: params.sku,
      reason: params.reason,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refund: ${error}`)
    }

    return response.json()
  }

  /**
   * Refund Status - Check refund status
   * Documentation: https://developer.bka.sh/docs/refund-status-3
   */
  async refundStatus(paymentID: string, trxID: string): Promise<BkashRefundResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/payment/refund?paymentID=${paymentID}&trxID=${trxID}`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get refund status: ${error}`)
    }

    return response.json()
  }

  /**
   * Create Agreement - Create a payment agreement for recurring payments
   * Documentation: https://developer.bka.sh/docs/create-agreement
   */
  async createAgreement(params: {
    payerReference: string
    callbackURL: string
  }): Promise<BkashAgreementCreateResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/create`
    const headers = await this.getAuthHeaders()

    const requestBody: BkashAgreementCreateRequest = {
      mode: '0000',
      payerReference: params.payerReference,
      callbackURL: params.callbackURL,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create agreement: ${error}`)
    }

    return response.json()
  }

  /**
   * Execute Agreement - Finalize an agreement
   * Documentation: https://developer.bka.sh/docs/execute-agreement
   */
  async executeAgreement(paymentID: string): Promise<BkashAgreementExecuteResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/execute`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentID }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to execute agreement: ${error}`)
    }

    return response.json()
  }

  /**
   * Query Agreement - Check agreement status
   * Documentation: https://developer.bka.sh/docs/query-agreement
   */
  async queryAgreement(agreementID: string): Promise<BkashQueryAgreementResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/agreement/status?agreementID=${agreementID}`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to query agreement: ${error}`)
    }

    return response.json()
  }

  /**
   * Cancel Agreement - Cancel an existing agreement
   * Documentation: https://developer.bka.sh/docs/cancel-agreement
   */
  async cancelAgreement(agreementID: string): Promise<BkashCancelAgreementResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/agreement/cancel`
    const headers = await this.getAuthHeaders()

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ agreementID }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to cancel agreement: ${error}`)
    }

    return response.json()
  }

  /**
   * Create Payment with Agreement - Create a payment using existing agreement
   */
  async createPaymentWithAgreement(params: {
    agreementID: string
    amount: string | number
    merchantInvoiceNumber: string
    callbackURL: string
    payerReference?: string
    currency?: string
    intent?: string
  }): Promise<BkashPaymentCreateResponse> {
    return this.createPayment({
      ...params,
      mode: '0012', // Agreement-based payment
    })
  }

  /**
   * Verify callback signature
   * Note: In production, implement proper signature verification
   */
  verifyCallbackSignature(paymentID: string, status: string, signature: string): boolean {
    // TODO: Implement proper signature verification
    // The signature is generated using app_secret
    // For now, return true (implement proper verification in production)
    return true
  }

  /**
   * Clear token cache
   */
  static clearTokenCache(): void {
    tokenCache = null
  }
}

/**
 * Get bKash service instance from stored configuration
 */
export async function getBkashService(): Promise<BkashService | null> {
  try {
    const { db } = await import('@/lib/db')
    
    const gateway = await db.paymentGateway.findUnique({
      where: { name: 'bkash' },
    })

    if (!gateway || !gateway.isEnabled) {
      return null
    }

    const credentials = gateway.credentials ? JSON.parse(gateway.credentials) : {}

    if (!credentials.appKey || !credentials.appSecret || !credentials.username || !credentials.password) {
      return null
    }

    return new BkashService({
      appKey: credentials.appKey,
      appSecret: credentials.appSecret,
      username: credentials.username,
      password: credentials.password,
      isSandbox: gateway.isSandbox,
    })
  } catch (error) {
    console.error('Error getting bKash service:', error)
    return null
  }
}

/**
 * Payment status constants
 */
export const BKASH_PAYMENT_STATUS = {
  INITIATED: 'Initiated',
  PENDING: 'Pending',
  AUTHORIZED: 'Authorized',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
  REVERSED: 'Reversed',
} as const

/**
 * Agreement status constants
 */
export const BKASH_AGREEMENT_STATUS = {
  INITIATED: 'Initiated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
} as const
