/**
 * Nagad Payment Gateway Configuration
 * Based on Nagad Online Payment API Integration Guide v3.3
 */

export interface NagadConfig {
  merchantId: string
  merchantPrivateKey: string
  merchantPublicKey: string
  nagadPublicKey: string
  baseUrl: string
  apiVersion: string
  callbackUrl: string
  isSandbox: boolean
}

export interface NagadCredentials {
  merchantId: string
  merchantPrivateKey: string
  merchantPublicKey: string
  nagadPublicKey: string
  apiVersion: string
}

// Sandbox and Production URLs
export const NAGAD_URLS = {
  sandbox: 'https://sandbox.mynagad.com:10080',
  production: 'https://api.mynagad.com',
}

// API Versions
export const NAGAD_API_VERSIONS = {
  v020: 'v-0.2.0',
  v301: 'v-3.0.1', // Supports sender fee
}

// Currency Codes
export const NAGAD_CURRENCY = {
  BDT: '050',
}

// Client Types
export const NAGAD_CLIENT_TYPES = {
  PC_WEB: 'PC_WEB',
  MOBILE_WEB: 'MOBILE_WEB',
  MOBILE_APP: 'MOBILE_APP',
  WALLET_WEB_VIEW: 'WALLET_WEB_VIEW',
  BILL_KEY: 'BILL_KEY',
}

// Purchase Status
export const NAGAD_STATUS = {
  SUCCESS: 'Success',
  ORDER_INITIATED: 'OrderInitiated',
  READY: 'Ready',
  IN_PROGRESS: 'InProgress',
  OTP_SENT: 'OtpSent',
  OTP_VERIFIED: 'OtpVerified',
  PIN_GIVEN: 'PinGiven',
  CANCELLED: 'Cancelled',
  PARTIAL_CANCELLED: 'PartialCancelled',
  INVALID_REQUEST: 'InvalidRequest',
  FRAUD: 'Fraud',
  ABORTED: 'Aborted',
  UNKNOWN_FAILED: 'UnKnownFailed',
  FAILED: 'Failed',
}

// API Endpoints
export const NAGAD_ENDPOINTS = {
  INITIALIZE: '/remote-payment-gateway-1.0/api/dfs/check-out/initialize',
  COMPLETE: '/api/dfs/check-out/complete',
  VERIFY: '/api/dfs/verify/payment',
}

// Error codes from Nagad
export const NAGAD_ERROR_CODES: Record<string, string> = {
  '16_0006_004': 'Provided merchant ID is invalid',
  '16_0006_052': 'Invalid Merchant',
  '16_0006_053': 'Inactive Merchant',
  '16_0006_056': 'Encryption failed',
  '16_0006_057': 'Decryption failed',
  '16_0006_058': 'Failed to verify signature',
  '16_0006_059': 'Invalid Sensitive Data',
  '16_0006_060': 'Error processing sensitive data',
  '16_0006_061': 'Invalid merchant key',
  '16_0006_064': 'Mandatory Header Missing',
  '16_0006_068': 'Invalid Order Id',
  '16_0006_076': 'Transaction Date Time Not in allowed window',
  '16_0006_075': 'Could not persist data to storage',
  '16_0006_081': 'Invalid Date Time Format',
  '16_0006_083': 'Duplicate Order ID in same day',
  '16_0006_999': 'Invalid Request',
  '16_0006_017': 'Purchase information state is invalid',
  '16_0006_040': 'Invalid encrypted request type',
  '16_0006_050': 'Provided merchant ID is invalid',
  '16_0006_055': 'Invalid Payment Reference Id',
  '16_0006_069': 'Data not encoded',
  '16_0006_080': 'Invalid Currency Code',
}
