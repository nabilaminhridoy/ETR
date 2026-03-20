import { MetadataRoute } from 'next'
import { getSEOSettings } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSEOSettings()
  const baseUrl = settings.canonicalUrl.replace(/\/$/, '')

  // Static pages
  const staticPages = [
    '',
    '/about-us',
    '/contact-us',
    '/faqs',
    '/help',
    '/how-it-works',
    '/find-tickets',
    '/sell-tickets',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/refund-policy',
    '/safety-guidelines',
    '/user/login',
    '/user/register',
  ]

  return staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1 : page === '/find-tickets' || page === '/sell-tickets' ? 0.9 : 0.8,
  }))
}
