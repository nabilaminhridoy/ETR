'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'

export default function AdminLogoutPage() {
  const router = useRouter()
  const { logout } = useAuthStore()

  useEffect(() => {
    // Perform logout
    logout()
    
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      router.push('/admin/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [logout, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <LogOut className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Logging Out...</h1>
        <p className="text-slate-400 mb-4">You are being securely logged out.</p>
        <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
      </motion.div>
    </div>
  )
}
