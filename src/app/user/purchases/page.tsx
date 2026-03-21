'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Eye, Download, Clock, CheckCircle2, XCircle, 
  RefreshCw, Loader2, FileText, Users, Truck, CreditCard, CheckCircle, AlertCircle
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatPrice, formatDateTime, cn } from '@/lib/utils'
import { useAuthStore } from '@/store'
import Link from 'next/link'

interface Purchase {
  id: string
  invoiceNumber: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  ticketPrice: number
  platformFee: number
  totalAmount: number
  courierFee: number | null
  paymentMethod: string
  deliveryType: string
  status: string
  transactionId: string | null
  createdAt: string
  ticket: {
    ticketId: string
    ticketType: string
    transportType: string
    transportCompany: string
    fromCity: string
    toCity: string
    travelDate: string
    departureTime: string
    seatNumber: string
    ticketImage: string | null
    ticketPdf: string | null
  }
  seller: {
    id: string
    name: string | null
    email: string
    phone: string | null
    isVerified: boolean
  }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  CANCELED: 'bg-red-500',
  FAILED: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
  FAILED: 'Failed',
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

const paymentMethodLabels: Record<string, string> = {
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  UPAY: 'Upay',
  SSLCOMMERZ: 'SSLCommerz',
  UDDOKTAPAY: 'UddoktaPay',
  PIPRAPAY: 'PipraPay',
}

export default function MyPurchasesPage() {
  const { token, isAuthenticated } = useAuthStore()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)

  const fetchPurchases = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  // Initial fetch
  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return
    
    const interval = setInterval(() => {
      fetchPurchases()
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchPurchases, isAuthenticated])

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'ONLINE_DELIVERY': return FileText
      case 'IN_PERSON': return Users
      case 'COURIER': return Truck
      default: return CreditCard
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Please login to view your purchases
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
          <h1 className="text-2xl font-bold">My Purchases</h1>
          <p className="text-muted-foreground">View your ticket purchase history</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={autoRefresh ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPurchases}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading your purchases...</span>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">
                Your purchased tickets will appear here
              </p>
              <Link href="/find-tickets">
                <Button className="btn-primary">Browse Tickets</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Travel</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => {
                    const DeliveryIcon = getDeliveryIcon(purchase.deliveryType)
                    return (
                      <TableRow key={purchase.id}>
                        {/* Invoice */}
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            {purchase.invoiceNumber}
                          </span>
                        </TableCell>
                        
                        {/* Seller */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-sm">{purchase.seller.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{purchase.seller.phone || purchase.seller.email}</p>
                            </div>
                            {purchase.seller.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Ticket ID */}
                        <TableCell>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {purchase.ticket?.ticketId || 'N/A'}
                          </span>
                        </TableCell>
                        
                        {/* Ticket Type */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ticketTypeLabels[purchase.ticket?.ticketType] || purchase.ticket?.ticketType || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        {/* Transport */}
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{purchase.ticket?.transportCompany}</p>
                            <p className="text-xs text-muted-foreground">
                              {transportTypeLabels[purchase.ticket?.transportType]} • {purchase.ticket?.fromCity} → {purchase.ticket?.toCity}
                            </p>
                          </div>
                        </TableCell>
                        
                        {/* Travel */}
                        <TableCell>
                          <p className="text-sm">{formatDateTime(purchase.ticket?.travelDate)}</p>
                          <p className="text-xs text-muted-foreground">{purchase.ticket?.departureTime}</p>
                        </TableCell>
                        
                        {/* Delivery */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeliveryIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{deliveryTypeLabels[purchase.deliveryType] || purchase.deliveryType}</span>
                          </div>
                        </TableCell>
                        
                        {/* Amount */}
                        <TableCell>
                          <p className="font-semibold text-primary">{formatPrice(purchase.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            Price: {formatPrice(purchase.ticketPrice)} | Fee: {formatPrice(purchase.platformFee)}
                          </p>
                        </TableCell>
                        
                        {/* Payment */}
                        <TableCell>
                          <span className="text-sm">{paymentMethodLabels[purchase.paymentMethod] || purchase.paymentMethod}</span>
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <Badge className={cn('text-white', statusColors[purchase.status])}>
                            {statusLabels[purchase.status] || purchase.status}
                          </Badge>
                        </TableCell>
                        
                        {/* Purchase Date */}
                        <TableCell>
                          <p className="text-sm">{formatDateTime(purchase.createdAt)}</p>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPurchase(purchase)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {purchase.status === 'COMPLETED' && (
                              <Button variant="ghost" size="sm" title="Download Invoice">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>Invoice: {selectedPurchase?.invoiceNumber}</DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={cn(
                'p-4 rounded-lg flex items-center gap-3',
                selectedPurchase.status === 'COMPLETED' ? 'bg-green-50 text-green-800' :
                selectedPurchase.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800' :
                'bg-red-50 text-red-800'
              )}>
                {selectedPurchase.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : selectedPurchase.status === 'PENDING' ? (
                  <Clock className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <div>
                  <p className="font-semibold">{statusLabels[selectedPurchase.status]}</p>
                  <p className="text-sm opacity-80">
                    {selectedPurchase.status === 'COMPLETED' 
                      ? 'Payment received and ticket delivered' 
                      : selectedPurchase.status === 'PENDING'
                      ? 'Awaiting payment confirmation'
                      : 'Transaction was not completed'}
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Seller Information</h4>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedPurchase.seller.name || 'N/A'}</p>
                      {selectedPurchase.seller.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPurchase.seller.phone || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{selectedPurchase.seller.email}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ticket Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ticket ID</Label>
                    <p className="font-mono font-medium">{selectedPurchase.ticket?.ticketId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ticket Type</Label>
                    <p>{ticketTypeLabels[selectedPurchase.ticket?.ticketType] || selectedPurchase.ticket?.ticketType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transport</Label>
                    <p>{transportTypeLabels[selectedPurchase.ticket?.transportType]} - {selectedPurchase.ticket?.transportCompany}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Route</Label>
                    <p>{selectedPurchase.ticket?.fromCity} → {selectedPurchase.ticket?.toCity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Travel Date</Label>
                    <p>{formatDateTime(selectedPurchase.ticket?.travelDate)} at {selectedPurchase.ticket?.departureTime}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Seat</Label>
                    <p>{selectedPurchase.ticket?.seatNumber}</p>
                  </div>
                </div>
              </div>

              {/* Ticket File */}
              {selectedPurchase.ticket?.ticketPdf && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ticket File</h4>
                  <a 
                    href={selectedPurchase.ticket.ticketPdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View/Download Ticket PDF
                  </a>
                </div>
              )}

              {selectedPurchase.ticket?.ticketImage && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ticket Image</h4>
                  <img 
                    src={selectedPurchase.ticket.ticketImage} 
                    alt="Ticket" 
                    className="max-h-64 rounded-lg border"
                  />
                </div>
              )}

              {/* Payment Information */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Payment Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ticket Price</Label>
                    <p className="font-medium">{formatPrice(selectedPurchase.ticketPrice)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Platform Fee</Label>
                    <p className="font-medium">{formatPrice(selectedPurchase.platformFee)}</p>
                  </div>
                  {selectedPurchase.courierFee && (
                    <div>
                      <Label className="text-muted-foreground">Courier Fee</Label>
                      <p className="font-medium">{formatPrice(selectedPurchase.courierFee)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-bold text-lg text-primary">{formatPrice(selectedPurchase.totalAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p>{paymentMethodLabels[selectedPurchase.paymentMethod] || selectedPurchase.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Delivery Type</Label>
                    <p>{deliveryTypeLabels[selectedPurchase.deliveryType] || selectedPurchase.deliveryType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transaction ID</Label>
                    <p className="font-mono">{selectedPurchase.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Purchase Date</Label>
                    <p>{formatDateTime(selectedPurchase.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedPurchase.status === 'COMPLETED' && (
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  {selectedPurchase.ticket?.ticketPdf && (
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Ticket
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
