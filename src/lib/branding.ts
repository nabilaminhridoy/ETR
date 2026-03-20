import { db } from '@/lib/db'

export interface BrandingSettings {
  logo: string
  favicon: string
  logoWidth: string
  logoHeight: string
}

const defaultBrandingSettings: BrandingSettings = {
  logo: '/logo.png',
  favicon: '/favicon.png',
  logoWidth: '200',
  logoHeight: '50',
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['site_logo', 'site_favicon', 'logo_width', 'logo_height']
        }
      }
    })

    const brandingSettings = { ...defaultBrandingSettings }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'site_logo':
          brandingSettings.logo = setting.value || defaultBrandingSettings.logo
          break
        case 'site_favicon':
          brandingSettings.favicon = setting.value || defaultBrandingSettings.favicon
          break
        case 'logo_width':
          brandingSettings.logoWidth = setting.value || defaultBrandingSettings.logoWidth
          break
        case 'logo_height':
          brandingSettings.logoHeight = setting.value || defaultBrandingSettings.logoHeight
          break
      }
    })

    return brandingSettings
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return defaultBrandingSettings
  }
}
