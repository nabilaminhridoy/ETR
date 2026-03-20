import { NextRequest, NextResponse } from 'next/server'
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

// GET - Fetch all general settings
export async function GET() {
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

    // Build response with defaults
    const response = {
      general: {
        siteName: settingsMap['site_name'] || 'EidTicketResell',
        siteTagline: settingsMap['site_tagline'] || 'Buy & Sell Unused Eid Travel Tickets Safely',
        metaDescription: settingsMap['meta_description'] || "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely.",
        defaultTimezone: settingsMap['default_timezone'] || 'Asia/Dhaka',
        defaultCurrency: settingsMap['default_currency'] || 'BDT',
        currencySymbol: settingsMap['currency_symbol'] || '৳',
        platformCommission: settingsMap['platform_commission'] || '1',
        minimumCommission: settingsMap['minimum_commission'] || '10',
        gtmId: settingsMap['gtm_id'] || '',
      },
      business: {
        email: settingsMap['business_email'] || 'support@eidticketresell.com',
        phone: settingsMap['business_phone'] || '+880 1234-567890',
        streetAddress: settingsMap['business_street_address'] || 'House 123, Road 12',
        city: settingsMap['business_city'] || 'Dhaka',
        country: settingsMap['business_country'] || 'Bangladesh',
        postalCode: settingsMap['business_postal_code'] || '1205',
      },
      social: {
        supportPhone: settingsMap['support_phone'] || '+880 1234-567890',
        supportEmail: settingsMap['support_email'] || 'support@eidticketresell.com',
        facebook: settingsMap['social_facebook'] || 'https://facebook.com/eidticketresell',
        instagram: settingsMap['social_instagram'] || 'https://instagram.com/eidticketresell',
        whatsapp: settingsMap['social_whatsapp'] || '+880 1234-567890',
        telegram: settingsMap['social_telegram'] || 'https://t.me/eidticketresell',
        youtube: settingsMap['social_youtube'] || 'https://youtube.com/@eidticketresell',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching general settings:', error)
    return NextResponse.json({ error: 'Failed to fetch general settings' }, { status: 500 })
  }
}

// POST - Save all general settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { general, business, social } = data

    // Map form data to database keys
    const settingsToSave: { key: string; value: string }[] = []

    // General settings
    if (general) {
      if (general.siteName !== undefined) settingsToSave.push({ key: 'site_name', value: general.siteName })
      if (general.siteTagline !== undefined) settingsToSave.push({ key: 'site_tagline', value: general.siteTagline })
      if (general.metaDescription !== undefined) settingsToSave.push({ key: 'meta_description', value: general.metaDescription })
      if (general.defaultTimezone !== undefined) settingsToSave.push({ key: 'default_timezone', value: general.defaultTimezone })
      if (general.defaultCurrency !== undefined) settingsToSave.push({ key: 'default_currency', value: general.defaultCurrency })
      if (general.currencySymbol !== undefined) settingsToSave.push({ key: 'currency_symbol', value: general.currencySymbol })
      if (general.platformCommission !== undefined) settingsToSave.push({ key: 'platform_commission', value: general.platformCommission })
      if (general.minimumCommission !== undefined) settingsToSave.push({ key: 'minimum_commission', value: general.minimumCommission })
      if (general.gtmId !== undefined) settingsToSave.push({ key: 'gtm_id', value: general.gtmId })
    }

    // Business settings
    if (business) {
      if (business.email !== undefined) settingsToSave.push({ key: 'business_email', value: business.email })
      if (business.phone !== undefined) settingsToSave.push({ key: 'business_phone', value: business.phone })
      if (business.streetAddress !== undefined) settingsToSave.push({ key: 'business_street_address', value: business.streetAddress })
      if (business.city !== undefined) settingsToSave.push({ key: 'business_city', value: business.city })
      if (business.country !== undefined) settingsToSave.push({ key: 'business_country', value: business.country })
      if (business.postalCode !== undefined) settingsToSave.push({ key: 'business_postal_code', value: business.postalCode })
    }

    // Social settings
    if (social) {
      if (social.supportPhone !== undefined) settingsToSave.push({ key: 'support_phone', value: social.supportPhone })
      if (social.supportEmail !== undefined) settingsToSave.push({ key: 'support_email', value: social.supportEmail })
      if (social.facebook !== undefined) settingsToSave.push({ key: 'social_facebook', value: social.facebook })
      if (social.instagram !== undefined) settingsToSave.push({ key: 'social_instagram', value: social.instagram })
      if (social.whatsapp !== undefined) settingsToSave.push({ key: 'social_whatsapp', value: social.whatsapp })
      if (social.telegram !== undefined) settingsToSave.push({ key: 'social_telegram', value: social.telegram })
      if (social.youtube !== undefined) settingsToSave.push({ key: 'social_youtube', value: social.youtube })
    }

    // Save each setting using upsert
    for (const setting of settingsToSave) {
      await db.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    console.error('Error saving general settings:', error)
    return NextResponse.json({ error: 'Failed to save general settings' }, { status: 500 })
  }
}
