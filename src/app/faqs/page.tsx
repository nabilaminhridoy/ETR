'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is EidTicketResell?',
        a: 'EidTicketResell is Bangladesh\'s trusted platform for buying and selling unused Eid travel tickets (Bus, Train, Launch, Air). We provide a safe environment with verified sellers and secure payment options.',
      },
      {
        q: 'How does it work?',
        a: 'Sellers list their unused tickets with details and pricing. Buyers search for tickets, verify seller credentials, and purchase safely. We charge only 1% platform fee (minimum ৳10) from the buyer.',
      },
      {
        q: 'Is it safe to buy tickets here?',
        a: 'Yes! All sellers are ID-verified with NID, Driving License, or Passport. We offer buyer protection and secure payment options. If a ticket is invalid, you get a full refund.',
      },
    ],
  },
  {
    category: 'For Buyers',
    questions: [
      {
        q: 'How do I buy a ticket?',
        a: 'Browse available tickets, select one you like, enter your details, choose payment method, and complete the purchase. You\'ll receive the full ticket details after payment.',
      },
      {
        q: 'What payment methods are available?',
        a: 'We support bKash, Nagad, Rocket, and bank transfers. You can also pay cash in person or via courier (COD).',
      },
      {
        q: 'What is the platform fee?',
        a: 'We charge only 1% of the ticket price as platform fee, with a minimum of ৳10. This fee is paid by the buyer.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Yes, if the ticket is invalid or the seller fails to deliver, you\'re eligible for a full refund. Contact our support within 24 hours.',
      },
    ],
  },
  {
    category: 'For Sellers',
    questions: [
      {
        q: 'How do I sell a ticket?',
        a: 'Register, complete ID verification, then list your ticket with all details. Your listing will be reviewed and approved within 24 hours.',
      },
      {
        q: 'Why do I need ID verification?',
        a: 'ID verification ensures buyer safety and builds trust. It helps prevent fraud and fake listings on our platform.',
      },
      {
        q: 'When do I receive payment?',
        a: 'For online payments, the amount is added to your wallet balance after the transaction. You can withdraw anytime (minimum ৳100).',
      },
      {
        q: 'What documents are accepted for verification?',
        a: 'We accept NID (front and back), Driving License (front and back), or Passport (front page only).',
      },
    ],
  },
  {
    category: 'Delivery',
    questions: [
      {
        q: 'What delivery options are available?',
        a: 'Three options: Online Payment (ticket delivered via email/WhatsApp), In Person (meet and exchange), or Courier (hard copy via Pathao, Steadfast, etc.)',
      },
      {
        q: 'Who pays for courier?',
        a: 'Courier fee can be paid by either buyer or seller, as specified in the ticket listing.',
      },
    ],
  },
]

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about buying and selling tickets.
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((category) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold mb-3">{category.category}</h2>
              <div className="space-y-2">
                {category.questions.map((faq, index) => {
                  const id = `${category.category}-${index}`
                  const isOpen = openItems.includes(id)
                  return (
                    <Card key={id} className="overflow-hidden">
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto"
                        onClick={() => toggleItem(id)}
                      >
                        <span className="font-medium text-left">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        )}
                      </Button>
                      {isOpen && (
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </MainLayout>
  )
}
