'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

export default function CookiePolicyPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </motion.div>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.
            </p>

            <h2>2. Types of Cookies We Use</h2>
            <h3>Essential Cookies</h3>
            <p>
              Required for the website to function properly. These include:
            </p>
            <ul>
              <li>Authentication cookies</li>
              <li>Security tokens</li>
              <li>Session management</li>
            </ul>

            <h3>Functional Cookies</h3>
            <p>
              Remember your preferences and settings:
            </p>
            <ul>
              <li>Language preference</li>
              <li>Theme settings (light/dark mode)</li>
              <li>Search filters</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <p>
              Help us understand how visitors use our site:
            </p>
            <ul>
              <li>Page views</li>
              <li>User journey tracking</li>
              <li>Performance metrics</li>
            </ul>

            <h2>3. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.
            </p>

            <h2>4. Third-Party Cookies</h2>
            <p>
              We use third-party services that may set cookies:
            </p>
            <ul>
              <li>Payment gateways (bKash, Nagad)</li>
              <li>Analytics providers</li>
              <li>Social media platforms</li>
            </ul>

            <h2>5. Contact</h2>
            <p>
              For questions about our cookie policy:
            </p>
            <p>
              Email: privacy@eidticketresell.com<br />
              Phone: +880 1234-567890
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}
