'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Ticket, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get transaction details from URL params
  const transactionId = searchParams.get('transaction_id')
  const invoiceNumber = searchParams.get('invoice')
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              Payment Successful!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-green-100 mt-2"
            >
              Your payment has been processed successfully
            </motion.p>
          </div>

          <CardContent className="p-6">
            {/* Transaction Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Amount */}
              {amount && (
                <div className="text-center py-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-3xl font-bold text-green-600">৳{parseFloat(amount).toLocaleString()}</p>
                </div>
              )}

              {/* Transaction Info */}
              <div className="space-y-3">
                {transactionId && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {transactionId}
                    </Badge>
                  </div>
                )}
                {invoiceNumber && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Invoice Number</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {invoiceNumber}
                    </Badge>
                  </div>
                )}
                {method && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium capitalize">{method}</span>
                  </div>
                )}
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  A confirmation email has been sent to your registered email address. 
                  You can view your ticket details in your dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  asChild
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Link href="/dashboard/my-tickets">
                    <Ticket className="w-4 h-4 mr-2" />
                    View My Tickets
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-green-100 mt-2">Loading...</p>
          </div>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
