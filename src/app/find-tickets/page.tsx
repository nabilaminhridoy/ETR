'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { 
  Search, Filter, Bus, Train, Ship, Plane, ArrowRight, 
  Star, Shield, MapPin, Calendar, Clock, X, SlidersHorizontal
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatPrice, formatDate, getTransportTypeLabel, getClassTypeLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { BANGLADESH_DISTRICTS } from '@/lib/constants'

const transportTypes = [
  { value: 'BUS', label: 'Bus', icon: Bus, color: 'bg-blue-500' },
  { value: 'TRAIN', label: 'Train', icon: Train, color: 'bg-purple-500' },
  { value: 'LAUNCH', label: 'Launch', icon: Ship, color: 'bg-cyan-500' },
  { value: 'AIR', label: 'Air', icon: Plane, color: 'bg-amber-500' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function FindTicketsContent() {
  const searchParams = useSearchParams()
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    transportType: searchParams.get('transportType') || '',
    fromCity: searchParams.get('fromCity') || '',
    toCity: searchParams.get('toCity') || '',
    travelDate: searchParams.get('travelDate') || '',
    priceMin: '',
    priceMax: '',
    classType: '',
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await fetch(`/api/tickets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchTickets()
  }

  const clearFilters = () => {
    setFilters({
      transportType: '',
      fromCity: '',
      toCity: '',
      travelDate: '',
      priceMin: '',
      priceMax: '',
      classType: '',
    })
  }

  const getTransportIcon = (type: string) => {
    const t = transportTypes.find((tt) => tt.value === type)
    return t?.icon || Bus
  }

  const getTransportColor = (type: string) => {
    const t = transportTypes.find((tt) => tt.value === type)
    return t?.color || 'bg-slate-500'
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Transport Type</Label>
        <div className="grid grid-cols-4 gap-2">
          {transportTypes.map((type) => {
            const Icon = type.icon
            const isSelected = filters.transportType === type.value
            return (
              <button
                key={type.value}
                onClick={() => setFilters({ ...filters, transportType: isSelected ? '' : type.value })}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Icon className={cn('w-5 h-5', isSelected && 'text-primary')} />
                <span className="text-xs">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>From</Label>
          <Select
            value={filters.fromCity}
            onValueChange={(value) => setFilters({ ...filters, fromCity: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {BANGLADESH_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Select
            value={filters.toCity}
            onValueChange={(value) => setFilters({ ...filters, toCity: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {BANGLADESH_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Travel Date</Label>
        <Input
          type="date"
          value={filters.travelDate}
          onChange={(e) => setFilters({ ...filters, travelDate: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min Price</Label>
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Price</Label>
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Clear
        </Button>
        <Button className="btn-primary flex-1" onClick={handleSearch}>
          Apply Filters
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Find Tickets</h1>
            <p className="text-muted-foreground">
              {tickets.length} tickets available
            </p>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button className="btn-primary gap-2" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Filters</h3>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Tickets Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {tickets.map((ticket) => {
                  const Icon = getTransportIcon(ticket.transportType)
                  const colorClass = getTransportColor(ticket.transportType)
                  return (
                    <motion.div key={ticket.id} variants={itemVariants}>
                      <Card className="overflow-hidden card-hover group">
                        <div className={cn('h-2', colorClass)} />
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', colorClass)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {getTransportTypeLabel(ticket.transportType)}
                            </Badge>
                          </div>

                          {/* Company */}
                          <h3 className="font-semibold text-sm mb-2 truncate">{ticket.transportCompany}</h3>

                          {/* Route */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{ticket.fromCity}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{ticket.toCity}</span>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(ticket.travelDate)}
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
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(ticket.originalPrice)}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(ticket.sellingPrice)}
                              </p>
                            </div>
                            <Link href={`/find-tickets/${ticket.ticketId}`}>
                              <Button size="sm" className="btn-primary">
                                View
                              </Button>
                            </Link>
                          </div>

                          {/* Seller Info */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {ticket.seller?.name?.charAt(0) || 'S'}
                            </div>
                            <span className="text-xs flex-1 truncate">{ticket.seller?.name}</span>
                            {ticket.seller?.isVerified && (
                              <Shield className="w-3 h-3 text-primary" />
                            )}
                            {ticket.seller?.rating && (
                              <span className="text-xs text-muted-foreground">
                                <Star className="w-3 h-3 inline text-amber-500" />
                                {ticket.seller.rating}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FindTicketsFallback() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default function FindTicketsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<FindTicketsFallback />}>
        <FindTicketsContent />
      </Suspense>
    </MainLayout>
  )
}
