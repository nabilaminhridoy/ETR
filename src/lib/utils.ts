import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ETR-${timestamp}-${random}`
}

export function calculatePlatformFee(price: number): number {
  const fee = price * 0.01 // 1%
  return Math.max(fee, 10) // Minimum 10 BDT
}

export function getTransportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BUS: 'Bus',
    TRAIN: 'Train',
    LAUNCH: 'Launch',
    AIR: 'Air',
  }
  return labels[type] || type
}

export function getClassTypeLabel(type: string, transportType: string): string {
  const busClasses: Record<string, string> = {
    NON_AC_ECONOMY: 'Non-AC Economy',
    NON_AC_BUSINESS: 'Non-AC Business',
    AC_ECONOMY: 'AC Economy',
    AC_BUSINESS: 'AC Business',
    SLEEPER: 'Sleeper',
    SUIT_CLASS_BUSINESS: 'Suit Class Business',
    SUIT_CLASS_SLEEPER: 'Suit Class Sleeper',
  }
  
  const trainClasses: Record<string, string> = {
    AC_B: 'AC-B (Berth)',
    AC_S: 'AC-S (Seat)',
    SNIGDHA: 'Snigdha',
    F_BERTH: 'F-Berth',
    F_SEAT: 'F-Seat',
    F_CHAIR: 'F-Chair',
    S_CHAIR: 'S-Chair',
    SHOVAN: 'Shovan',
    SHULOV: 'Shulov',
    AC_CHAIR: 'AC-Chair',
  }
  
  const launchClasses: Record<string, string> = {
    STANDING: 'Standing',
    NON_AC_SEAT: 'Non-AC Seat',
    AC_SEAT: 'AC Seat',
    NON_AC_CABIN: 'Non-AC Cabin',
    AC_CABIN: 'AC Cabin',
    VIP_CABIN: 'VIP Cabin',
  }
  
  const airClasses: Record<string, string> = {
    ECONOMY: 'Economy',
    PREMIUM_ECONOMY: 'Premium Economy',
    BUSINESS: 'Business',
    FIRST_CLASS: 'First Class',
  }
  
  if (transportType === 'BUS') return busClasses[type] || type
  if (transportType === 'TRAIN') return trainClasses[type] || type
  if (transportType === 'LAUNCH') return launchClasses[type] || type
  if (transportType === 'AIR') return airClasses[type] || type
  return type
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  const maskedName = name.substring(0, 2) + '****' + name.substring(name.length - 1)
  return `${maskedName}@${domain}`
}

export function maskPhone(phone: string): string {
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3)
}
