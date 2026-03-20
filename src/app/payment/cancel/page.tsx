'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, Ticket, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get transaction details from URL params
  const transactionId = searchParams.get('transaction_id')
  const invoiceNumber = searchParams.get('invoice')
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')
  const reason = searchParams.get('reason')

  const handleRetry = () => {
    // Go back to the checkout page
    if (invoiceNumber) {
      router.push(`/checkout?invoice=${invoiceNumber}`)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Cancel Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
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
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              Payment Cancelled
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-red-100 mt-2"
            >
              Your payment was not completed
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
                  <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                  <p className="text-3xl font-bold text-red-600">৳{parseFloat(amount).toLocaleString()}</p>
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
                {reason && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Reason</span>
                    <span className="text-sm font-medium">{reason}</span>
                  </div>
                )}
              </div>

              {/* Info Message */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your payment was cancelled and no money has been deducted from your account. 
                  You can retry the payment or choose a different payment method.
                </p>
              </div>

              {/* Possible Reasons */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Possible reasons for cancellation:
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>You cancelled the payment manually</li>
                  <li>Payment session expired</li>
                  <li>Insufficient balance</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Payment
                </Button>
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href="/dashboard/my-tickets">
                      <Ticket className="w-4 h-4 mr-2" />
                      My Tickets
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
            <p className="text-red-100 mt-2">Loading...</p>
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

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCancelContent />
    </Suspense>
  )
}
