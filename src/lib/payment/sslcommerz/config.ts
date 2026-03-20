/**
 * SSLCommerz Payment Gateway Configuration
 * Based on SSLCommerz Integration Documentation V4.00
 * https://developer.sslcommerz.com/doc/v4/
 */

export interface SSLCommerzConfig {
  storeId: string
  storePassword: string
  isSandbox: boolean
  baseUrl: string
  successUrl: string
  failUrl: string
  cancelUrl: string
  ipnUrl: string
  currency: string
  productCategory: string
}

export interface SSLCommerzCredentials {
  storeId: string
  storePassword: string
}

// Sandbox and Production URLs
export const SSLCOMMERZ_URLS = {
  sandbox: 'https://sandbox.sslcommerz.com',
  production: 'https://securepay.sslcommerz.com',
}

// Currency Codes
export const SSLCOMMERZ_CURRENCY = {
  BDT: 'BDT',
  USD: 'USD',
  EUR: 'EUR',
  SGD: 'SGD',
  INR: 'INR',
  MYR: 'MYR',
}

// Payment Status
export const SSLCOMMERZ_STATUS = {
  VALID: 'VALID',
  VALIDATED: 'VALIDATED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
}

// API Endpoints
export const SSLCOMMERZ_ENDPOINTS = {
  // Create Session - For initiating payment
  CREATE_SESSION: '/gwprocess/v4/api.php',
  // Order Validation API - To validate payment
  ORDER_VALIDATION: '/validator/api/validationserverAPI.php',
  // Transaction Query by Session ID
  TRANSACTION_QUERY_SESSION: '/validator/api/merchantTransIDvalidationAPI.php',
  // Transaction Query by Transaction ID
  TRANSACTION_QUERY_TRANID: '/validator/api/merchantTransIDvalidationAPI.php',
  // Refund API
  REFUND: '/merchantapi/reciveall/post/refund.php',
  // Refund Status Query
  REFUND_STATUS: '/merchantapi/reciveall/post/refundStatus.php',
}

// Risk Levels
export const SSLCOMMERZ_RISK_LEVEL = {
  SAFE: 0,
  RISKY: 1,
}

// Gateway Types for multi_card_name parameter
export const SSLCOMMERZ_GATEWAYS = {
  // Individual Gateways
  BRAC_VISA: 'brac_visa',
  DBBL_VISA: 'dbbl_visa',
  CITY_VISA: 'city_visa',
  EBL_VISA: 'ebl_visa',
  SBL_VISA: 'sbl_visa',
  BRAC_MASTER: 'brac_master',
  DBBL_MASTER: 'dbbl_master',
  CITY_MASTER: 'city_master',
  EBL_MASTER: 'ebl_master',
  SBL_MASTER: 'sbl_master',
  CITY_AMEX: 'city_amex',
  QCASH: 'qcash',
  DBBL_NEXUS: 'dbbl_nexus',
  BANKASIA: 'bankasia',
  ABBANK: 'abbank',
  IBBL: 'ibbl',
  MTBL: 'mtbl',
  BKASH: 'bkash',
  DBBL_MOBILE: 'dbblmobilebanking',
  CITY_TOUCH: 'city',
  UPAY: 'upay',
  TAPNPAY: 'tapnpay',
  
  // Group Gateways
  INTERNET_BANK: 'internetbank',
  MOBILE_BANK: 'mobilebank',
  OTHER_CARD: 'othercard',
  VISA_CARD: 'visacard',
  MASTER_CARD: 'mastercard',
  AMEX_CARD: 'amexcard',
}

// Response status codes
export const SSLCOMMERZ_RESPONSE_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  UNATTEMPTED: 'UNATTEMPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
}

// Default values
export const SSLCOMMERZ_DEFAULTS = {
  currency: 'BDT',
  productCategory: 'ticket',
  isSandbox: true,
}

// Test Card Details for Sandbox
export const SSLCOMMERZ_TEST_CARDS = {
  VISA: {
    cardNumber: '4111111111111111',
    exp: '12/26',
    cvv: '111',
  },
  MASTERCARD: {
    cardNumber: '5111111111111111',
    exp: '12/26',
    cvv: '111',
  },
  AMEX: {
    cardNumber: '371111111111111',
    exp: '12/26',
    cvv: '111',
  },
  MOBILE_OTP: '111111', // or '123456'
}

// Error Messages
export const SSLCOMMERZ_ERRORS = {
  INVALID_STORE_ID: 'Invalid Store ID',
  INVALID_STORE_PASSWORD: 'Invalid Store Password',
  SESSION_CREATION_FAILED: 'Failed to create payment session',
  VALIDATION_FAILED: 'Payment validation failed',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  REFUND_FAILED: 'Refund processing failed',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_AMOUNT: 'Invalid amount. Amount must be between 10.00 and 500000.00 BDT',
}
