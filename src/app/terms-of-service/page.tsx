'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

export default function TermsOfServicePage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </motion.div>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using EidTicketResell, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              To sell tickets on our platform, you must register and complete ID verification. You are responsible for maintaining the confidentiality of your account and for all activities under your account.
            </p>
            <p>
              You must provide accurate and complete information during registration and keep your information updated.
            </p>

            <h2>3. Ticket Listings</h2>
            <p>
              Sellers must ensure that:
            </p>
            <ul>
              <li>All ticket information is accurate and complete</li>
              <li>The ticket is valid and legally obtained</li>
              <li>The ticket has not been sold elsewhere</li>
              <li>They have the right to sell the ticket</li>
            </ul>

            <h2>4. Platform Fee</h2>
            <p>
              EidTicketResell charges a 1% platform fee on all transactions, with a minimum fee of ৳10 BDT. This fee is collected from the buyer at the time of purchase.
            </p>

            <h2>5. Prohibited Activities</h2>
            <p>
              Users are prohibited from:
            </p>
            <ul>
              <li>Listing fake or invalid tickets</li>
              <li>Providing false information</li>
              <li>Attempting to circumvent platform fees</li>
              <li>Harassing or defrauding other users</li>
              <li>Using the platform for illegal purposes</li>
            </ul>

            <h2>6. Buyer Protection</h2>
            <p>
              Buyers are protected against:
            </p>
            <ul>
              <li>Invalid or fake tickets</li>
              <li>Seller non-delivery</li>
              <li>Significantly misrepresented tickets</li>
            </ul>
            <p>
              Claims must be filed within 24 hours of the transaction.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              EidTicketResell acts as an intermediary platform. We are not responsible for the actual tickets or the conduct of individual users beyond our stated verification processes.
            </p>

            <h2>8. Termination</h2>
            <p>
              We reserve the right to terminate or suspend accounts that violate these terms or engage in fraudulent activities without prior notice.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>

            <h2>10. Contact</h2>
            <p>
              For questions about these terms, contact us at:
            </p>
            <p>
              Email: legal@eidticketresell.com<br />
              Phone: +880 1234-567890
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}
