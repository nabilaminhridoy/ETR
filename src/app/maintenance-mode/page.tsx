'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, RefreshCw, Mail, Phone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 30, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">EidTicketResell</h1>
          <p className="text-slate-400 mt-1">Buy & Sell Unused Eid Travel Tickets</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
          >
            <Wrench className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            We&apos;re Under Maintenance
          </h2>
          <p className="text-slate-400 mb-6">
            We&apos;re performing scheduled maintenance to improve your experience. 
            Please check back soon!
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-slate-700/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</div>
              <div className="text-xs text-slate-400 mt-1">Hours</div>
            </div>
            <div className="flex items-center text-2xl text-slate-500">:</div>
            <div className="bg-slate-700/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-slate-400 mt-1">Minutes</div>
            </div>
            <div className="flex items-center text-2xl text-slate-500">:</div>
            <div className="bg-slate-700/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-white">{String(countdown.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-slate-400 mt-1">Seconds</div>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            className="w-full bg-primary hover:bg-primary/90 text-white mb-6"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Again
          </Button>

          {/* Contact Info */}
          <div className="border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-400 mb-4">
              Need urgent assistance? Contact us:
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:support@eidticketresell.com"
                className="flex items-center justify-center gap-2 text-slate-300 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@eidticketresell.com
              </a>
              <a
                href="tel:+8801234567890"
                className="flex items-center justify-center gap-2 text-slate-300 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +880 1234-567890
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Estimated time: 2-3 hours
          </p>
        </div>
      </motion.div>
    </div>
  )
}
