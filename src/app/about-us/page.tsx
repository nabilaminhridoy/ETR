'use client'

import { motion } from 'framer-motion'
import { Users, Target, Heart, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

const values = [
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'We prioritize secure transactions and verify all sellers to protect our users.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Built by Bangladeshis for Bangladeshis, understanding local travel needs.',
  },
  {
    icon: Heart,
    title: 'Helping Hand',
    description: 'Helping travelers recover costs while helping others reach home for Eid.',
  },
  {
    icon: Target,
    title: 'Simple & Fair',
    description: 'Just 1% platform fee (min ৳10). No hidden charges, no surprises.',
  },
]

const stats = [
  { value: '10,000+', label: 'Happy Travelers' },
  { value: '5,000+', label: 'Tickets Sold' },
  { value: '500+', label: 'Verified Sellers' },
  { value: '99%', label: 'Satisfaction Rate' },
]

export default function AboutUsPage() {
  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">About EidTicketResell</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Bangladesh's most trusted platform for buying and selling unused Eid travel tickets.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Our Mission</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                Every Eid, thousands of travelers in Bangladesh buy tickets in advance, only to have their plans change.
                These tickets often go to waste, and the money is lost. We created EidTicketResell to solve this problem
                by connecting ticket sellers with buyers who need them, all in a safe and verified environment.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  EidTicketResell was born from a simple observation: every Eid season, social media is flooded with
                  people trying to sell their unused bus, train, and launch tickets. The process was chaotic,
                  unorganized, and risky for both buyers and sellers.
                </p>
                <p>
                  We saw an opportunity to create a dedicated platform that brings trust, verification, and ease
                  to this process. With mandatory ID verification for sellers, secure payment options, and a
                  transparent platform fee structure, we've built a solution that works for everyone.
                </p>
                <p>
                  Today, EidTicketResell has helped thousands of travelers across Bangladesh save money and reach
                  their loved ones during the most important festival of the year.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </MainLayout>
  )
}
