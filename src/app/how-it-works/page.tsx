'use client'

import { motion } from 'framer-motion'
import { Search, Shield, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'

const steps = [
  {
    icon: Search,
    title: 'Search Tickets',
    description: 'Find tickets by transport type, route, and travel date from verified sellers.',
    details: [
      'Select transport type (Bus, Train, Launch, Air)',
      'Choose departure and destination cities',
      'Set your travel date',
      'Browse available tickets',
    ],
  },
  {
    icon: Shield,
    title: 'Verify & Book',
    description: 'Review ticket details, check seller verification, and book securely.',
    details: [
      'View ticket details and seller profile',
      'Check seller verification status',
      'Read seller ratings and reviews',
      'Select your preferred ticket',
    ],
  },
  {
    icon: CreditCard,
    title: 'Pay Safely',
    description: 'Pay via bKash, Nagad, or cash. Platform fee is only 1% (min ৳10).',
    details: [
      'Multiple payment options available',
      'Online payment via bKash/Nagad',
      'Cash on delivery available',
      'In-person cash payment option',
    ],
  },
  {
    icon: CheckCircle2,
    title: 'Get Your Ticket',
    description: 'Receive ticket instantly online, via courier, or meet in person.',
    details: [
      'Instant digital delivery for online payment',
      'Courier delivery for hard copies',
      'In-person exchange available',
      'Full ticket details revealed after purchase',
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function HowItWorksPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Buy or sell tickets in just a few simple steps. Our platform ensures safe and secure transactions.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div key={step.title} variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 bg-primary/10 p-6 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <span className="text-2xl font-bold text-primary">Step {index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* For Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80">
            <CardContent className="p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Selling Tickets</h2>
              <p className="mb-6 opacity-90 max-w-2xl mx-auto">
                Have unused tickets? List them on EidTicketResell and help fellow travelers while recovering your money.
                All sellers must complete ID verification for buyer safety.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/user/register">
                  <Button variant="secondary" className="gap-2">
                    Register as Seller
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/sell-tickets">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    List a Ticket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </MainLayout>
  )
}
