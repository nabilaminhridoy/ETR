import { db } from '@/lib/db'

// General settings keys
const GENERAL_SETTINGS_KEYS = [
  'site_name',
  'site_tagline',
  'meta_description',
  'default_timezone',
  'default_currency',
  'currency_symbol',
  'platform_commission',
  'minimum_commission',
  'gtm_id',
  'business_email',
  'business_phone',
  'business_street_address',
  'business_city',
  'business_country',
  'business_postal_code',
  'support_phone',
  'support_email',
  'social_facebook',
  'social_instagram',
  'social_whatsapp',
  'social_telegram',
  'social_youtube',
]

export interface GeneralSettings {
  siteName: string
  siteTagline: string
  metaDescription: string
  defaultTimezone: string
  defaultCurrency: string
  currencySymbol: string
  platformCommission: string
  minimumCommission: string
  gtmId: string
  businessEmail: string
  businessPhone: string
  businessStreetAddress: string
  businessCity: string
  businessCountry: string
  businessPostalCode: string
  supportPhone: string
  supportEmail: string
  socialFacebook: string
  socialInstagram: string
  socialWhatsapp: string
  socialTelegram: string
  socialYoutube: string
}

/**
 * Get general settings from database
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: GENERAL_SETTINGS_KEYS
        }
      }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value || ''
    })

    return {
      siteName: settingsMap['site_name'] || 'EidTicketResell',
      siteTagline: settingsMap['site_tagline'] || 'Buy & Sell Unused Eid Travel Tickets Safely',
      metaDescription: settingsMap['meta_description'] || "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely.",
      defaultTimezone: settingsMap['default_timezone'] || 'Asia/Dhaka',
      defaultCurrency: settingsMap['default_currency'] || 'BDT',
      currencySymbol: settingsMap['currency_symbol'] || '৳',
      platformCommission: settingsMap['platform_commission'] || '1',
      minimumCommission: settingsMap['minimum_commission'] || '10',
      gtmId: settingsMap['gtm_id'] || '',
      businessEmail: settingsMap['business_email'] || '',
      businessPhone: settingsMap['business_phone'] || '',
      businessStreetAddress: settingsMap['business_street_address'] || '',
      businessCity: settingsMap['business_city'] || '',
      businessCountry: settingsMap['business_country'] || '',
      businessPostalCode: settingsMap['business_postal_code'] || '',
      supportPhone: settingsMap['support_phone'] || '',
      supportEmail: settingsMap['support_email'] || '',
      socialFacebook: settingsMap['social_facebook'] || '',
      socialInstagram: settingsMap['social_instagram'] || '',
      socialWhatsapp: settingsMap['social_whatsapp'] || '',
      socialTelegram: settingsMap['social_telegram'] || '',
      socialYoutube: settingsMap['social_youtube'] || '',
    }
  } catch (error) {
    console.error('Error fetching general settings:', error)
    // Return defaults on error
    return {
      siteName: 'EidTicketResell',
      siteTagline: 'Buy & Sell Unused Eid Travel Tickets Safely',
      metaDescription: "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely.",
      defaultTimezone: 'Asia/Dhaka',
      defaultCurrency: 'BDT',
      currencySymbol: '৳',
      platformCommission: '1',
      minimumCommission: '10',
      gtmId: '',
      businessEmail: '',
      businessPhone: '',
      businessStreetAddress: '',
      businessCity: '',
      businessCountry: '',
      businessPostalCode: '',
      supportPhone: '',
      supportEmail: '',
      socialFacebook: '',
      socialInstagram: '',
      socialWhatsapp: '',
      socialTelegram: '',
      socialYoutube: '',
    }
  }
}

/**
 * Get a specific general setting value
 */
export async function getGeneralSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key }
    })
    return setting?.value || null
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
}

/**
 * Calculate platform fee based on ticket price
 */
export function calculatePlatformFee(price: number, settings: GeneralSettings): number {
  const commissionPercent = parseFloat(settings.platformCommission) || 1
  const minimumCommission = parseFloat(settings.minimumCommission) || 10
  
  const calculatedFee = (price * commissionPercent) / 100
  return Math.max(calculatedFee, minimumCommission)
}
