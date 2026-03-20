import { MetadataRoute } from 'next'
import { getSEOSettings } from '@/lib/seo'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSEOSettings()

  // Parse robots.txt content from settings
  const robotsContent = settings.robotsTxt

  // Default rules if parsing fails
  const defaultRules = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${settings.canonicalUrl.replace(/\/$/, '')}/sitemap.xml`,
  }

  try {
    // Parse the robots.txt content
    const lines = robotsContent.split('\n')
    const rules: Array<{
      userAgent: string | string[]
      allow?: string | string[]
      disallow?: string | string[]
    }> = []

    let currentUserAgents: string[] = []
    let allowPaths: string[] = []
    let disallowPaths: string[] = []
    let sitemapUrl = defaultRules.sitemap

    for (const line of lines) {
      const trimmedLine = line.trim()
      const lowerLine = trimmedLine.toLowerCase()

      if (lowerLine.startsWith('user-agent:')) {
        // If we have accumulated user agents with rules, save them
        if (currentUserAgents.length > 0 && (allowPaths.length > 0 || disallowPaths.length > 0)) {
          rules.push({
            userAgent: currentUserAgents.length === 1 ? currentUserAgents[0] : currentUserAgents,
            allow: allowPaths.length > 0 ? allowPaths : undefined,
            disallow: disallowPaths.length > 0 ? disallowPaths : undefined,
          })
        }
        // Start new user agent group
        currentUserAgents = [trimmedLine.substring(11).trim()]
        allowPaths = []
        disallowPaths = []
      } else if (lowerLine.startsWith('allow:')) {
        allowPaths.push(trimmedLine.substring(6).trim())
      } else if (lowerLine.startsWith('disallow:')) {
        disallowPaths.push(trimmedLine.substring(9).trim())
      } else if (lowerLine.startsWith('sitemap:')) {
        sitemapUrl = trimmedLine.substring(8).trim()
      }
    }

    // Don't forget the last group
    if (currentUserAgents.length > 0) {
      rules.push({
        userAgent: currentUserAgents.length === 1 ? currentUserAgents[0] : currentUserAgents,
        allow: allowPaths.length > 0 ? allowPaths : undefined,
        disallow: disallowPaths.length > 0 ? disallowPaths : undefined,
      })
    }

    // If no rules were parsed, use default
    if (rules.length === 0) {
      return defaultRules
    }

    return {
      rules,
      sitemap: sitemapUrl,
    }
  } catch (error) {
    console.error('Error parsing robots.txt:', error)
    return defaultRules
  }
}
