import { db } from '@/lib/db'

export interface SEOSettings {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  metaImage: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonicalUrl: string
  robotsTxt: string
}

const defaultSEOSettings: SEOSettings = {
  metaTitle: 'EidTicketResell - Buy & Sell Eid Travel Tickets in Bangladesh',
  metaDescription: "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely. Bus, Train, Launch, and Air tickets available.",
  metaKeywords: 'eid tickets, travel tickets, bangladesh tickets, bus tickets, train tickets, launch tickets, air tickets, ticket resale',
  metaImage: '',
  ogTitle: 'EidTicketResell - Safe Ticket Marketplace',
  ogDescription: 'Buy and sell unused Eid travel tickets safely. Verified sellers, secure payments.',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterTitle: 'EidTicketResell - Safe Ticket Marketplace',
  twitterDescription: 'Buy and sell unused Eid travel tickets safely. Verified sellers, secure payments.',
  twitterImage: '',
  canonicalUrl: 'https://eidticketresell.com',
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://eidticketresell.com/sitemap.xml`,
}

export async function getSEOSettings(): Promise<SEOSettings> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            'seo_meta_title',
            'seo_meta_description',
            'seo_meta_keywords',
            'seo_meta_image',
            'seo_og_title',
            'seo_og_description',
            'seo_og_image',
            'seo_twitter_card',
            'seo_twitter_title',
            'seo_twitter_description',
            'seo_twitter_image',
            'seo_canonical_url',
            'seo_robots_txt',
          ]
        }
      }
    })

    const seoSettings = { ...defaultSEOSettings }

    settings.forEach((setting) => {
      switch (setting.key) {
        case 'seo_meta_title':
          seoSettings.metaTitle = setting.value
          break
        case 'seo_meta_description':
          seoSettings.metaDescription = setting.value
          break
        case 'seo_meta_keywords':
          seoSettings.metaKeywords = setting.value
          break
        case 'seo_meta_image':
          seoSettings.metaImage = setting.value
          break
        case 'seo_og_title':
          seoSettings.ogTitle = setting.value
          break
        case 'seo_og_description':
          seoSettings.ogDescription = setting.value
          break
        case 'seo_og_image':
          seoSettings.ogImage = setting.value
          break
        case 'seo_twitter_card':
          seoSettings.twitterCard = setting.value
          break
        case 'seo_twitter_title':
          seoSettings.twitterTitle = setting.value
          break
        case 'seo_twitter_description':
          seoSettings.twitterDescription = setting.value
          break
        case 'seo_twitter_image':
          seoSettings.twitterImage = setting.value
          break
        case 'seo_canonical_url':
          seoSettings.canonicalUrl = setting.value
          break
        case 'seo_robots_txt':
          seoSettings.robotsTxt = setting.value
          break
      }
    })

    return seoSettings
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return defaultSEOSettings
  }
}

export function getFullImageUrl(imageUrl: string, canonicalUrl: string): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http')) return imageUrl
  return `${canonicalUrl.replace(/\/$/, '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}
