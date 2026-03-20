'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle2, AlertTriangle, Lock, Users, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'

const safetyFeatures = [
  {
    icon: Shield,
    title: 'ID Verified Sellers',
    description: 'All sellers are verified with NID, Driving License, or Passport before they can list tickets.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Multiple payment options with encrypted transactions. Your financial information is always protected.',
  },
  {
    icon: Users,
    title: 'Buyer Protection',
    description: 'Full refund guaranteed if the ticket is invalid or seller fails to deliver.',
  },
  {
    icon: FileCheck,
    title: 'Ticket Verification',
    description: 'Our team reviews reported tickets and takes action against fake listings.',
  },
]

const safetyTips = [
  'Always verify the seller has a verified badge before purchasing',
  'Check the ticket details carefully before making payment',
  'For in-person exchanges, meet in a safe, public location',
  'Keep all transaction records and communication',
  'Report any suspicious activity immediately',
  'Never share your personal financial information',
]

const reportReasons = [
  'Fake or invalid ticket',
  'Seller not responding after payment',
  'Ticket details do not match listing',
  'Suspicious seller behavior',
  'Other safety concerns',
]

export default function SafetyGuidelinesPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Your Safety Matters</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Safety Guidelines</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We prioritize your safety with multiple layers of protection. Learn how to trade safely on our platform.
          </p>
        </motion.div>

        {/* Safety Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {safetyFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Safety Tips for Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {safetyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Report Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Report a Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you encounter any issues with a ticket or seller, you can report it for our team to review:
              </p>
              <ul className="space-y-2">
                {reportReasons.map((reason, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {reason}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Our support team will investigate all reports within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </MainLayout>
  )
}
