// Shared OTP store for authentication
// In production, use Redis or database instead

interface OTPData {
  otp: string
  expiresAt: number
  type: string
  name?: string
}

// Global OTP store
const otpStore = new Map<string, OTPData>()

export function storeOTP(email: string, otp: string, type: string, name?: string, expiresInMs: number = 5 * 60 * 1000) {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + expiresInMs,
    type,
    name,
  })
}

export function getOTP(email: string): OTPData | null {
  const data = otpStore.get(email)
  if (!data) return null
  
  // Check if expired
  if (Date.now() > data.expiresAt) {
    otpStore.delete(email)
    return null
  }
  
  return data
}

export function deleteOTP(email: string) {
  otpStore.delete(email)
}

export function verifyOTP(email: string, otp: string, type: string): { valid: boolean; error?: string; name?: string } {
  const storedData = getOTP(email)
  
  if (!storedData) {
    return { valid: false, error: 'OTP not found. Please request a new one.' }
  }
  
  if (storedData.otp !== otp) {
    return { valid: false, error: 'Invalid OTP' }
  }
  
  if (storedData.type !== type) {
    return { valid: false, error: 'Invalid OTP type' }
  }
  
  // Delete used OTP
  deleteOTP(email)
  
  return { valid: true, name: storedData.name }
}

// Clean up expired OTPs (can be called periodically)
export function cleanupExpiredOTPs() {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email)
    }
  }
}
