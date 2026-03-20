'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Search, Plus, Bus, Train, Ship, Plane, ArrowRight, 
  Shield, Users, Clock, CreditCard, CheckCircle2, Star,
  MapPin, Calendar, ChevronRight
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BANGLADESH_DISTRICTS } from '@/lib/constants'

const transportTypes = [
  { value: 'BUS', label: 'Bus', icon: Bus, color: 'bg-blue-500' },
  { value: 'TRAIN', label: 'Train', icon: Train, color: 'bg-purple-500' },
  { value: 'LAUNCH', label: 'Launch', icon: Ship, color: 'bg-cyan-500' },
  { value: 'AIR', label: 'Air', icon: Plane, color: 'bg-amber-500' },
]

const popularRoutes = [
  { from: 'Dhaka', to: 'Chittagong', type: 'BUS', price: '৳800 - ৳1,500', tickets: 45 },
  { from: 'Dhaka', to: 'Sylhet', type: 'TRAIN', price: '৳500 - ৳1,200', tickets: 32 },
  { from: 'Dhaka', to: 'Barisal', type: 'LAUNCH', price: '৳300 - ৳800', tickets: 28 },
  { from: 'Dhaka', to: 'Cox\'s Bazar', type: 'AIR', price: '৳3,500 - ৳6,000', tickets: 15 },
  { from: 'Chittagong', to: 'Dhaka', type: 'BUS', price: '৳800 - ৳1,500', tickets: 38 },
  { from: 'Sylhet', to: 'Dhaka', type: 'TRAIN', price: '৳500 - ৳1,200', tickets: 25 },
]

const howItWorks = [
  {
    icon: Search,
    title: 'Search Tickets',
    description: 'Find tickets by transport type, route, and travel date from verified sellers.',
    step: 1,
  },
  {
    icon: Shield,
    title: 'Verify & Book',
    description: 'Review ticket details, check seller verification, and book securely.',
    step: 2,
  },
  {
    icon: CreditCard,
    title: 'Pay Safely',
    description: 'Pay via bKash, Nagad, or cash. Platform fee is only 1% (min ৳10).',
    step: 3,
  },
  {
    icon: CheckCircle2,
    title: 'Get Your Ticket',
    description: 'Receive ticket instantly online, via courier, or meet in person.',
    step: 4,
  },
]

const trustFeatures = [
  {
    icon: Shield,
    title: 'ID Verified Sellers',
    description: 'All sellers are verified with NID, Driving License, or Passport',
  },
  {
    icon: Users,
    title: 'Secure Trading',
    description: 'Platform protects both buyers and sellers throughout the process',
  },
  {
    icon: CreditCard,
    title: 'Safe Payments',
    description: 'Multiple payment options with transparent 1% platform fee',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Dedicated support team to help you with any issues',
  },
]

// Use centralized district list
const cities = [...BANGLADESH_DISTRICTS]

// Mock tickets for demo
const recentTickets = [
  {
    id: '1',
    transportType: 'BUS',
    company: 'Green Line Paribahan',
    from: 'Dhaka',
    to: 'Chittagong',
    seatNumber: 'A1',
    classType: 'AC Business',
    departureDate: '2025-06-15',
    departureTime: '22:00',
    originalPrice: 1200,
    sellingPrice: 1000,
    seller: { name: 'Rahman Ahmed', verified: true, rating: 4.8 },
  },
  {
    id: '2',
    transportType: 'TRAIN',
    company: 'Bangladesh Railway',
    from: 'Dhaka',
    to: 'Sylhet',
    seatNumber: 'S-5',
    classType: 'Snigdha',
    departureDate: '2025-06-16',
    departureTime: '07:30',
    originalPrice: 850,
    sellingPrice: 750,
    seller: { name: 'Fatima Khatun', verified: true, rating: 4.9 },
  },
  {
    id: '3',
    transportType: 'LAUNCH',
    company: 'Sundarban Launch Service',
    from: 'Dhaka',
    to: 'Barisal',
    seatNumber: 'Cabin-12',
    classType: 'AC Cabin',
    departureDate: '2025-06-17',
    departureTime: '20:00',
    originalPrice: 600,
    sellingPrice: 500,
    seller: { name: 'Mohammad Ali', verified: false, rating: 4.5 },
  },
  {
    id: '4',
    transportType: 'AIR',
    company: 'Biman Bangladesh Airlines',
    from: 'Dhaka',
    to: 'Cox\'s Bazar',
    seatNumber: '14A',
    classType: 'Economy',
    departureDate: '2025-06-18',
    departureTime: '10:00',
    originalPrice: 5500,
    sellingPrice: 4500,
    seller: { name: 'Nusrat Jahan', verified: true, rating: 4.7 },
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function HomePage() {
  const [searchForm, setSearchForm] = useState({
    transportType: '',
    fromCity: '',
    toCity: '',
    travelDate: '',
  })

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'BUS': return Bus
      case 'TRAIN': return Train
      case 'LAUNCH': return Ship
      case 'AIR': return Plane
      default: return Bus
    }
  }

  const getTransportColor = (type: string) => {
    switch (type) {
      case 'BUS': return 'bg-blue-500'
      case 'TRAIN': return 'bg-purple-500'
      case 'LAUNCH': return 'bg-cyan-500'
      case 'AIR': return 'bg-amber-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <MainLayout>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 hero-pattern">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              🎉 Trusted by 10,000+ travelers in Bangladesh
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Buy & Sell Unused
              <span className="text-gradient block mt-2">Eid Travel Tickets Safely</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most trusted platform in Bangladesh for secure ticket trading. 
              All sellers verified, payments protected.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="max-w-4xl mx-auto shadow-xl border-0">
              <CardContent className="p-6">
                {/* Transport Type Selection */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {transportTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = searchForm.transportType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSearchForm({ ...searchForm, transportType: type.value })}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <Icon className={cn('w-6 h-6', isSelected && 'text-primary')} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Search Fields */}
                <div className="space-y-4 mb-6">
                  {/* From and To - Side by Side */}
                  <div className="space-y-2">
                    {/* Labels */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">From</label>
                      </div>
                      <div>
                        <label className="text-sm font-medium">To</label>
                      </div>
                    </div>
                    {/* Inputs */}
                    <div className="relative grid grid-cols-2 gap-4">
                      <Select
                        value={searchForm.fromCity}
                        onValueChange={(value) => setSearchForm({ ...searchForm, fromCity: value })}
                      >
                        <SelectTrigger>
                          <MapPin className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Arrow - absolutely positioned in center */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background px-1">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <Select
                        value={searchForm.toCity}
                        onValueChange={(value) => setSearchForm({ ...searchForm, toCity: value })}
                      >
                        <SelectTrigger>
                          <MapPin className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date and Search Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Travel Date</label>
                      <Input
                        type="date"
                        value={searchForm.travelDate}
                        onChange={(e) => setSearchForm({ ...searchForm, travelDate: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium invisible">Search</label>
                      <Link
                        href={{
                          pathname: '/find-tickets',
                          query: searchForm,
                        }}
                      >
                        <Button className="w-full btn-primary gap-2">
                          <Search className="w-4 h-4" />
                          Find Tickets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Link href="/find-tickets" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Search className="w-4 h-4" />
                      Browse All Tickets
                    </Button>
                  </Link>
                  <Link href="/sell-tickets" className="flex-1">
                    <Button className="w-full btn-secondary gap-2">
                      <Plus className="w-4 h-4" />
                      Sell Your Ticket
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
          >
            {[
              { value: '10,000+', label: 'Happy Travelers' },
              { value: '5,000+', label: 'Tickets Sold' },
              { value: '500+', label: 'Verified Sellers' },
              { value: '99%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy or sell tickets in just a few simple steps. Our platform ensures safe and secure transactions.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {howItWorks.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.step} variants={itemVariants}>
                  <Card className="h-full card-hover relative">
                    <CardContent className="p-6 text-center">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Trending</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Popular Routes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most searched travel routes for this Eid season
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {popularRoutes.map((route, index) => {
              const Icon = getTransportIcon(route.type)
              const colorClass = getTransportColor(route.type)
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="card-hover cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', colorClass)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{route.from}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span>{route.to}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{route.price}</span>
                            <span>•</span>
                            <span>{route.tickets} tickets</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="text-center mt-8">
            <Link href="/find-tickets">
              <Button variant="outline" className="gap-2">
                View All Routes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Your Safety Matters</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Safety & Trust</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We prioritize your safety with multiple layers of protection
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full text-center border-0 shadow-lg bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="text-center mt-8">
            <Link href="/safety-guidelines">
              <Button variant="link" className="text-primary">
                Read our Safety Guidelines
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Tickets */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Fresh Listings</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Recently Added Tickets</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Latest tickets listed by verified sellers
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recentTickets.map((ticket) => {
              const Icon = getTransportIcon(ticket.transportType)
              const colorClass = getTransportColor(ticket.transportType)
              return (
                <motion.div key={ticket.id} variants={itemVariants}>
                  <Card className="h-full card-hover overflow-hidden group">
                    <div className={cn('h-2', colorClass)} />
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', colorClass)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {ticket.transportType}
                        </Badge>
                      </div>

                      {/* Company */}
                      <h3 className="font-semibold text-sm mb-2 truncate">{ticket.company}</h3>

                      {/* Route */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{ticket.from}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{ticket.to}</span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ticket.departureDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ticket.departureTime}
                        </div>
                        <div>Seat: {ticket.seatNumber}</div>
                        <div>{ticket.classType}</div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end justify-between pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground line-through">৳{ticket.originalPrice}</p>
                          <p className="text-lg font-bold text-primary">৳{ticket.sellingPrice}</p>
                        </div>
                        <Link href={`/find-tickets/${ticket.id}`}>
                          <Button size="sm" className="btn-primary">
                            View
                          </Button>
                        </Link>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {ticket.seller.name.charAt(0)}
                        </div>
                        <span className="text-xs flex-1 truncate">{ticket.seller.name}</span>
                        {ticket.seller.verified && (
                          <Shield className="w-3 h-3 text-primary" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          <Star className="w-3 h-3 inline text-amber-500" />
                          {ticket.seller.rating}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="text-center mt-8">
            <Link href="/find-tickets">
              <Button className="btn-primary gap-2">
                Browse All Tickets
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Have Unused Tickets to Sell?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Don't let your unused tickets go to waste. List them on EidTicketResell and help fellow travelers while recovering your money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sell-tickets">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Sell Your Ticket Now
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </MainLayout>
  )
}
