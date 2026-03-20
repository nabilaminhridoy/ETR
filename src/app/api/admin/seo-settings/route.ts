import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch SEO settings
export async function GET() {
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

    // Default values
    const seoSettings: Record<string, string> = {
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

    return NextResponse.json({ settings: seoSettings })
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO settings' }, { status: 500 })
  }
}

// POST - Save SEO settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const settingsMap: Record<string, string> = {
      metaTitle: 'seo_meta_title',
      metaDescription: 'seo_meta_description',
      metaKeywords: 'seo_meta_keywords',
      metaImage: 'seo_meta_image',
      ogTitle: 'seo_og_title',
      ogDescription: 'seo_og_description',
      ogImage: 'seo_og_image',
      twitterCard: 'seo_twitter_card',
      twitterTitle: 'seo_twitter_title',
      twitterDescription: 'seo_twitter_description',
      twitterImage: 'seo_twitter_image',
      canonicalUrl: 'seo_canonical_url',
      robotsTxt: 'seo_robots_txt',
    }

    for (const [key, dbKey] of Object.entries(settingsMap)) {
      if (data[key] !== undefined) {
        await db.systemSetting.upsert({
          where: { key: dbKey },
          update: { value: data[key] },
          create: { key: dbKey, value: data[key] },
        })
      }
    }

    return NextResponse.json({ success: true, message: 'SEO settings saved successfully' })
  } catch (error) {
    console.error('Error saving SEO settings:', error)
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 })
  }
}
