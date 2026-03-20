'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </motion.div>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email, phone number, profile picture</li>
              <li><strong>ID Verification:</strong> NID, Driving License, or Passport images</li>
              <li><strong>Transaction Data:</strong> Ticket purchases, sales, payments</li>
              <li><strong>Device Information:</strong> IP address, browser type, device type</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Process transactions and deliver tickets</li>
              <li>Verify seller identity for platform safety</li>
              <li>Communicate about your transactions</li>
              <li>Improve our services and user experience</li>
              <li>Prevent fraud and unauthorized access</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We share information only as necessary:
            </p>
            <ul>
              <li>With counterparties in a transaction (limited details)</li>
              <li>With payment processors for transactions</li>
              <li>With law enforcement when required by law</li>
              <li>With your consent for other purposes</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul>
              <li>SSL encryption for data transmission</li>
              <li>Secure storage for sensitive documents</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies to improve user experience, analyze traffic, and personalize content. You can manage cookie preferences in your browser settings.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              Our platform integrates with third-party services (payment gateways, analytics). These services have their own privacy policies.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly collect information from minors.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. We will notify users of significant changes via email or platform notification.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              For privacy-related questions or concerns:
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
