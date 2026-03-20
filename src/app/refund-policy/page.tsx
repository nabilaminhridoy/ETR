'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

export default function RefundPolicyPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </motion.div>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>1. Eligibility for Refund</h2>
            <p>
              Refunds are available under the following circumstances:
            </p>
            <ul>
              <li>The ticket is invalid or fake</li>
              <li>The seller fails to deliver the ticket</li>
              <li>The ticket details are significantly different from the listing</li>
              <li>The travel is canceled by the transport company</li>
            </ul>

            <h2>2. Refund Process</h2>
            <p>
              To request a refund:
            </p>
            <ol>
              <li>Log into your account and go to My Purchases</li>
              <li>Select the transaction and click "Request Refund"</li>
              <li>Provide reason and supporting evidence</li>
              <li>Our team will review within 24-48 hours</li>
            </ol>

            <h2>3. Refund Timeline</h2>
            <p>
              Approved refunds are processed within 5-7 business days. The refund will be credited to your original payment method or wallet balance.
            </p>

            <h2>4. Non-Refundable Situations</h2>
            <p>
              Refunds are not available for:
            </p>
            <ul>
              <li>Change of travel plans</li>
              <li>Missing the departure time</li>
              <li>Claims made more than 24 hours after transaction</li>
              <li>Platform fees (non-refundable)</li>
            </ul>

            <h2>5. Partial Refunds</h2>
            <p>
              In some cases, partial refunds may be offered based on the circumstances and evidence provided. The platform fee is always non-refundable.
            </p>

            <h2>6. Contact</h2>
            <p>
              For refund inquiries, contact us at:
            </p>
            <p>
              Email: refunds@eidticketresell.com<br />
              Phone: +880 1234-567890
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}
