'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Ticket, Plus, Edit, Trash2, Eye, MoreVertical, Bus, Train, Ship, Plane,
  Loader2, Clock, RefreshCw, FileText, Package, User, CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatPrice, formatDate, formatDateTime, cn } from '@/lib/utils'
import { useAuthStore } from '@/store'
import Link from 'next/link'

interface Listing {
  id: string
  ticketId: string
  ticketType: string
  transportType: string
  transportCompany: string
  fromCity: string
  toCity: string
  travelDate: string
  departureTime: string
  seatNumber: string
  sellingPrice: number
  originalPrice: number
  deliveryType: string
  status: string
  rejectionReason: string | null
  notes: string | null
  ticketImage: string | null
  ticketPdf: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  SOLD: 'bg-blue-500',
  EXPIRED: 'bg-gray-500',
}

const transportTypeColors: Record<string, string> = {
  BUS: 'bg-blue-500',
  TRAIN: 'bg-purple-500',
  LAUNCH: 'bg-cyan-500',
  AIR: 'bg-amber-500',
}

const transportTypeLabels: Record<string, string> = {
  BUS: 'Bus',
  TRAIN: 'Train',
  LAUNCH: 'Launch',
  AIR: 'Air',
}

const ticketTypeLabels: Record<string, string> = {
  ONLINE_COPY: 'Online Copy',
  COUNTER_COPY: 'Counter Copy',
}

const deliveryTypeLabels: Record<string, string> = {
  ONLINE_DELIVERY: 'Online Delivery',
  IN_PERSON: 'In Person',
  COURIER: 'Courier',
}

export default function MyListingsPage() {
  const { token, isAuthenticated } = useAuthStore()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Listing | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const fetchListings = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setListings(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  // Initial fetch
  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return
    
    const interval = setInterval(() => {
      fetchListings()
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchListings, isAuthenticated])

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'BUS': return Bus
      case 'TRAIN': return Train
      case 'LAUNCH': return Ship
      case 'AIR': return Plane
      default: return Bus
    }
  }

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'ONLINE_DELIVERY': return FileText
      case 'IN_PERSON': return User
      case 'COURIER': return Package
      default: return FileText
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Please login to view your listings
            </p>
            <Link href="/user/login">
              <Button className="btn-primary">Login Now</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your ticket listings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={autoRefresh ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Auto Refresh ON
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Auto Refresh OFF
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchListings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/sell-tickets">
            <Button className="btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading your listings...</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling your unused tickets
              </p>
              <Link href="/sell-tickets">
                <Button className="btn-primary">Sell Your First Ticket</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Travel</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => {
                    const TransportIcon = getTransportIcon(listing.transportType)
                    const DeliveryIcon = getDeliveryIcon(listing.deliveryType)
                    return (
                      <TableRow key={listing.id}>
                        {/* Ticket ID */}
                        <TableCell>
                          <span className="font-mono text-sm font-medium bg-muted px-2 py-1 rounded">
                            {listing.ticketId}
                          </span>
                        </TableCell>
                        
                        {/* Ticket Type */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ticketTypeLabels[listing.ticketType] || listing.ticketType}
                          </Badge>
                        </TableCell>
                        
                        {/* Transport */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', transportTypeColors[listing.transportType])}>
                              <TransportIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{listing.transportCompany}</p>
                              <p className="text-xs text-muted-foreground">{transportTypeLabels[listing.transportType]}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Route */}
                        <TableCell>
                          <p className="text-sm font-medium">{listing.fromCity}</p>
                          <p className="text-xs text-muted-foreground">→ {listing.toCity}</p>
                        </TableCell>
                        
                        {/* Travel */}
                        <TableCell>
                          <p className="text-sm">{formatDate(listing.travelDate)}</p>
                          <p className="text-xs text-muted-foreground">{listing.departureTime}</p>
                        </TableCell>
                        
                        {/* Delivery */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeliveryIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{deliveryTypeLabels[listing.deliveryType] || listing.deliveryType}</span>
                          </div>
                        </TableCell>
                        
                        {/* Price */}
                        <TableCell>
                          <p className="font-semibold text-primary">{formatPrice(listing.sellingPrice)}</p>
                          {listing.originalPrice !== listing.sellingPrice && (
                            <p className="text-xs text-muted-foreground line-through">{formatPrice(listing.originalPrice)}</p>
                          )}
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={cn('text-white', statusColors[listing.status])}>
                              {listing.status}
                            </Badge>
                            {listing.status === 'REJECTED' && listing.rejectionReason && (
                              <span className="text-xs text-red-600 truncate max-w-[100px]" title={listing.rejectionReason}>
                                {listing.rejectionReason}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Created */}
                        <TableCell>
                          <p className="text-sm">{formatDateTime(listing.createdAt)}</p>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedTicket(listing); setShowViewDialog(true) }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>Complete information about your ticket</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ticket ID</Label>
                  <p className="font-mono font-medium">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ticket Type</Label>
                  <p className="font-medium">{ticketTypeLabels[selectedTicket.ticketType] || selectedTicket.ticketType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transport</Label>
                  <p className="font-medium">{transportTypeLabels[selectedTicket.transportType]} - {selectedTicket.transportCompany}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PNR Number</Label>
                  <p className="font-medium">{selectedTicket.pnrNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Route</Label>
                  <p className="font-medium">{selectedTicket.fromCity} → {selectedTicket.toCity}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seat Number</Label>
                  <p className="font-medium">{selectedTicket.seatNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Travel Date</Label>
                  <p className="font-medium">{formatDate(selectedTicket.travelDate)} at {selectedTicket.departureTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Delivery Type</Label>
                  <p className="font-medium">{deliveryTypeLabels[selectedTicket.deliveryType] || selectedTicket.deliveryType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Original Price</Label>
                  <p className="font-medium">{formatPrice(selectedTicket.originalPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Selling Price</Label>
                  <p className="font-medium text-primary">{formatPrice(selectedTicket.sellingPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={cn('text-white', statusColors[selectedTicket.status])}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{formatDateTime(selectedTicket.createdAt)}</p>
                </div>
              </div>
              
              {selectedTicket.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{selectedTicket.notes}</p>
                </div>
              )}

              {selectedTicket.rejectionReason && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="font-medium text-red-600">{selectedTicket.rejectionReason}</p>
                </div>
              )}

              {selectedTicket.ticketImage && (
                <div>
                  <Label className="text-muted-foreground">Ticket Image</Label>
                  <img
                    src={selectedTicket.ticketImage}
                    alt="Ticket"
                    className="mt-2 rounded-lg border max-h-64 object-contain"
                  />
                </div>
              )}

              {selectedTicket.ticketPdf && (
                <div>
                  <Label className="text-muted-foreground">Ticket PDF</Label>
                  <a 
                    href={selectedTicket.ticketPdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
