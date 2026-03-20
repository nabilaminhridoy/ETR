import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch public branding settings (for frontend)
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['site_logo', 'site_favicon', 'logo_width', 'logo_height']
        }
      }
    })

    const brandingSettings: Record<string, string> = {
      logo: '/logo.png',
      favicon: '/favicon.png',
      logoWidth: '200',
      logoHeight: '50',
    }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'site_logo':
          brandingSettings.logo = setting.value || '/logo.png'
          break
        case 'site_favicon':
          brandingSettings.favicon = setting.value || '/favicon.png'
          break
        case 'logo_width':
          brandingSettings.logoWidth = setting.value || '200'
          break
        case 'logo_height':
          brandingSettings.logoHeight = setting.value || '50'
          break
      }
    })

    return NextResponse.json({ settings: brandingSettings })
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return NextResponse.json({ error: 'Failed to fetch branding settings' }, { status: 500 })
  }
}
