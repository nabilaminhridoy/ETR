import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// General settings keys for public access
const PUBLIC_GENERAL_SETTINGS_KEYS = [
  'site_name',
  'site_tagline',
  'meta_description',
  'default_timezone',
  'default_currency',
  'currency_symbol',
  'platform_commission',
  'minimum_commission',
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

// GET - Fetch public general settings (for frontend)
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: PUBLIC_GENERAL_SETTINGS_KEYS
        }
      }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value || ''
    })

    // Build response with defaults
    const response = {
      siteName: settingsMap['site_name'] || 'EidTicketResell',
      siteTagline: settingsMap['site_tagline'] || 'Buy & Sell Unused Eid Travel Tickets Safely',
      metaDescription: settingsMap['meta_description'] || "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely.",
      defaultTimezone: settingsMap['default_timezone'] || 'Asia/Dhaka',
      defaultCurrency: settingsMap['default_currency'] || 'BDT',
      currencySymbol: settingsMap['currency_symbol'] || '৳',
      platformCommission: settingsMap['platform_commission'] || '1',
      minimumCommission: settingsMap['minimum_commission'] || '10',
      business: {
        email: settingsMap['business_email'] || '',
        phone: settingsMap['business_phone'] || '',
        streetAddress: settingsMap['business_street_address'] || '',
        city: settingsMap['business_city'] || '',
        country: settingsMap['business_country'] || '',
        postalCode: settingsMap['business_postal_code'] || '',
      },
      support: {
        phone: settingsMap['support_phone'] || '',
        email: settingsMap['support_email'] || '',
      },
      social: {
        facebook: settingsMap['social_facebook'] || '',
        instagram: settingsMap['social_instagram'] || '',
        whatsapp: settingsMap['social_whatsapp'] || '',
        telegram: settingsMap['social_telegram'] || '',
        youtube: settingsMap['social_youtube'] || '',
      },
    }

    return NextResponse.json({ settings: response })
  } catch (error) {
    console.error('Error fetching general settings:', error)
    return NextResponse.json({ error: 'Failed to fetch general settings' }, { status: 500 })
  }
}
