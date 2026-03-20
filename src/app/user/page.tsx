'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Ticket, ShoppingBag, Wallet, TrendingUp, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store'
import { formatPrice, formatDate } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function UserDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalPurchases: 0,
    walletBalance: 0,
  })
  const [recentListings, setRecentListings] = useState<any[]>([])
  const [recentPurchases, setRecentPurchases] = useState<any[]>([])

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentListings(data.recentListings || [])
          setRecentPurchases(data.recentPurchases || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      title: 'My Listings',
      value: stats.totalListings,
      subtitle: `${stats.activeListings} active`,
      icon: Ticket,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Purchases',
      value: stats.totalPurchases,
      subtitle: 'Total orders',
      icon: ShoppingBag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Wallet Balance',
      value: formatPrice(stats.walletBalance),
      subtitle: 'Available',
      icon: Wallet,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Platform Trust',
      value: user?.isVerified ? 'Verified' : 'Pending',
      subtitle: user?.isVerified ? 'ID Verified' : 'ID not verified',
      icon: user?.isVerified ? CheckCircle2 : AlertCircle,
      color: user?.isVerified ? 'text-green-500' : 'text-amber-500',
      bgColor: user?.isVerified ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your account</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/sell-tickets">
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Sell Ticket
              </Button>
            </Link>
            <Link href="/find-tickets">
              <Button variant="outline" className="gap-2">
                <Ticket className="w-4 h-4" />
                Find Tickets
              </Button>
            </Link>
            {!user?.isVerified && (
              <Link href="/user/id-verification">
                <Button variant="outline" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verify ID
                </Button>
              </Link>
            )}
            <Link href="/user/wallet">
              <Button variant="outline" className="gap-2">
                <Wallet className="w-4 h-4" />
                View Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Listings</CardTitle>
              <Link href="/user/listings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentListings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No listings yet</p>
                  <Link href="/sell-tickets">
                    <Button variant="link" className="mt-2">
                      Create your first listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentListings.slice(0, 4).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{listing.fromCity} → {listing.toCity}</p>
                        <p className="text-xs text-muted-foreground">{listing.transportCompany}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatPrice(listing.sellingPrice)}</p>
                        <Badge variant={listing.status === 'APPROVED' ? 'default' : 'secondary'} className="text-xs">
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Purchases */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Purchases</CardTitle>
              <Link href="/user/purchases" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentPurchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No purchases yet</p>
                  <Link href="/find-tickets">
                    <Button variant="link" className="mt-2">
                      Find tickets
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPurchases.slice(0, 4).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{purchase.ticket?.fromCity} → {purchase.ticket?.toCity}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(purchase.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatPrice(purchase.totalAmount)}</p>
                        <Badge variant={purchase.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
