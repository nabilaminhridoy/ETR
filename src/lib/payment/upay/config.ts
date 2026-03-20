/**
 * Upay Payment Gateway Configuration
 * Based on Upay PGW API V4.1.0
 */

export interface UpayConfig {
  merchantId: string
  merchantKey: string
  merchantName: string
  merchantCode: string
  merchantCity: string
  merchantMobile: string
  merchantCountryCode: string
  merchantCategoryCode: string
  transactionCurrencyCode: string
  baseUrl: string
  redirectUrl: string
  isSandbox: boolean
}

export interface UpayCredentials {
  merchantId: string
  merchantKey: string
  merchantName: string
  merchantCode: string
  merchantCity: string
  merchantMobile: string
  merchantCountryCode: string
  merchantCategoryCode: string
  transactionCurrencyCode: string
}

// Sandbox and Production URLs
export const UPAY_URLS = {
  sandbox: 'https://uat-pg.upay.systems',
  production: 'https://pg.upay.systems',
}

// Currency Codes
export const UPAY_CURRENCY = {
  BDT: 'BDT',
}

// Country Codes
export const UPAY_COUNTRY = {
  BD: 'BD',
}

// Payment Status
export const UPAY_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  EXPIRED: 'expired',
}

// API Endpoints
export const UPAY_ENDPOINTS = {
  AUTH: '/payment/merchant-auth/',
  INIT: '/payment/merchant-payment-init/',
  SINGLE_STATUS: '/payment/single-payment-status',
  BULK_STATUS: '/payment/bulk-payment-status/',
  BULK_REFUND: '/payment/bulk/refund/',
}

// Response Codes
export const UPAY_RESPONSE_CODES: Record<string, string> = {
  // Success codes
  'MAS2001': 'Merchant Auth Success',
  'MPIS2002': 'Merchant Payment Init Success',
  'PS2005': 'Payment Status Found',
  'MPR_200': 'Merchant payment refunded successfully',
  
  // Error codes
  'DVE4001': 'Data Validation Error',
  'MSE5001': 'Middleware Server Error',
  'MNF4002': 'Merchant Not Found',
  'DTP4003': 'Duplicate Transaction id provided',
  'PNF4012': 'Payment Not Found',
}

// Default merchant settings
export const UPAY_DEFAULTS = {
  merchantCountryCode: 'BD',
  merchantCity: 'Dhaka',
  transactionCurrencyCode: 'BDT',
  merchantCategoryCode: '', // Same as merchant code
}
