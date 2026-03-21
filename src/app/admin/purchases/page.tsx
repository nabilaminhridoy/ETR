'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Eye, Download, CheckCircle2, Clock, XCircle, CreditCard, 
  Users, Truck, RefreshCw, Loader2, FileText, CheckCircle, AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface Transaction {
  id: string
  invoiceNumber: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  buyerAddress: string
  ticketPrice: number
  platformFee: number
  totalAmount: number
  courierFee: number | null
  paymentMethod: string
  deliveryType: string
  status: string
  transactionId: string | null
  sellerPaid: boolean
  sellerConfirmedAt: string | null
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
  }
  buyer: {
    id: string
    name: string | null
    email: string
    phone: string | null
    isVerified: boolean
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

export default function PurchasesPage() {
  const { toast } = useToast()
  const { token } = useAuthStore()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/purchases?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, token])

  // Initial fetch
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchTransactions()
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchTransactions])

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'ONLINE_DELIVERY': return FileText
      case 'IN_PERSON': return Users
      case 'COURIER': return Truck
      default: return CreditCard
    }
  }

  // Calculate stats
  const stats = {
    all: transactions.length,
    completed: transactions.filter(t => t.status === 'COMPLETED').length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    canceled: transactions.filter(t => t.status === 'CANCELED' || t.status === 'FAILED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Manage all ticket purchases</p>
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
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All</p>
                <p className="text-xl font-bold">{stats.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canceled</p>
                <p className="text-xl font-bold">{stats.canceled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Invoice, Buyer Name, Phone, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading purchases...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No purchases found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Buyer</TableHead>
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
                  {transactions.map((transaction) => {
                    const DeliveryIcon = getDeliveryIcon(transaction.deliveryType)
                    return (
                      <TableRow key={transaction.id}>
                        {/* Invoice */}
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            {transaction.invoiceNumber}
                          </span>
                        </TableCell>
                        
                        {/* Buyer */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-sm">{transaction.buyerName}</p>
                              <p className="text-xs text-muted-foreground">{transaction.buyerPhone}</p>
                            </div>
                            {transaction.buyer.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Seller */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-sm">{transaction.seller.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{transaction.seller.phone || transaction.seller.email}</p>
                            </div>
                            {transaction.seller.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Ticket ID */}
                        <TableCell>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {transaction.ticket?.ticketId || 'N/A'}
                          </span>
                        </TableCell>
                        
                        {/* Ticket Type */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ticketTypeLabels[transaction.ticket?.ticketType] || transaction.ticket?.ticketType || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        {/* Transport */}
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{transaction.ticket?.transportCompany}</p>
                            <p className="text-xs text-muted-foreground">
                              {transportTypeLabels[transaction.ticket?.transportType]} • {transaction.ticket?.fromCity} → {transaction.ticket?.toCity}
                            </p>
                          </div>
                        </TableCell>
                        
                        {/* Travel */}
                        <TableCell>
                          <p className="text-sm">{formatDateTime(transaction.ticket?.travelDate)}</p>
                          <p className="text-xs text-muted-foreground">{transaction.ticket?.departureTime}</p>
                        </TableCell>
                        
                        {/* Delivery */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeliveryIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{deliveryTypeLabels[transaction.deliveryType] || transaction.deliveryType}</span>
                          </div>
                        </TableCell>
                        
                        {/* Amount */}
                        <TableCell>
                          <p className="font-semibold text-primary">{formatPrice(transaction.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            Price: {formatPrice(transaction.ticketPrice)} | Fee: {formatPrice(transaction.platformFee)}
                          </p>
                        </TableCell>
                        
                        {/* Payment */}
                        <TableCell>
                          <span className="text-sm">{paymentMethodLabels[transaction.paymentMethod] || transaction.paymentMethod}</span>
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          <Badge className={cn('text-white', statusColors[transaction.status])}>
                            {statusLabels[transaction.status] || transaction.status}
                          </Badge>
                        </TableCell>
                        
                        {/* Purchase Date */}
                        <TableCell>
                          <p className="text-sm">{formatDateTime(transaction.createdAt)}</p>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>Invoice: {selectedTransaction?.invoiceNumber}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={cn(
                'p-4 rounded-lg flex items-center gap-3',
                selectedTransaction.status === 'COMPLETED' ? 'bg-green-50 text-green-800' :
                selectedTransaction.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800' :
                'bg-red-50 text-red-800'
              )}>
                {selectedTransaction.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : selectedTransaction.status === 'PENDING' ? (
                  <Clock className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <div>
                  <p className="font-semibold">{statusLabels[selectedTransaction.status]}</p>
                  <p className="text-sm opacity-80">
                    {selectedTransaction.status === 'COMPLETED' 
                      ? 'Payment received and ticket delivered' 
                      : selectedTransaction.status === 'PENDING'
                      ? 'Awaiting payment confirmation'
                      : 'Transaction was not completed'}
                  </p>
                </div>
              </div>

              {/* Buyer & Seller Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Buyer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedTransaction.buyerName}</p>
                      {selectedTransaction.buyer.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.buyerPhone}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.buyerEmail}</p>
                    {selectedTransaction.buyerAddress && (
                      <p className="text-sm text-muted-foreground">{selectedTransaction.buyerAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Seller Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedTransaction.seller.name || 'N/A'}</p>
                      {selectedTransaction.seller.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.seller.phone || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.seller.email}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ticket Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ticket ID</Label>
                    <p className="font-mono font-medium">{selectedTransaction.ticket?.ticketId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ticket Type</Label>
                    <p>{ticketTypeLabels[selectedTransaction.ticket?.ticketType] || selectedTransaction.ticket?.ticketType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transport</Label>
                    <p>{transportTypeLabels[selectedTransaction.ticket?.transportType]} - {selectedTransaction.ticket?.transportCompany}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Route</Label>
                    <p>{selectedTransaction.ticket?.fromCity} → {selectedTransaction.ticket?.toCity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Travel Date</Label>
                    <p>{formatDateTime(selectedTransaction.ticket?.travelDate)} at {selectedTransaction.ticket?.departureTime}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Seat</Label>
                    <p>{selectedTransaction.ticket?.seatNumber}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Payment Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ticket Price</Label>
                    <p className="font-medium">{formatPrice(selectedTransaction.ticketPrice)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Platform Fee</Label>
                    <p className="font-medium">{formatPrice(selectedTransaction.platformFee)}</p>
                  </div>
                  {selectedTransaction.courierFee && (
                    <div>
                      <Label className="text-muted-foreground">Courier Fee</Label>
                      <p className="font-medium">{formatPrice(selectedTransaction.courierFee)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-bold text-lg text-primary">{formatPrice(selectedTransaction.totalAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p>{paymentMethodLabels[selectedTransaction.paymentMethod] || selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Delivery Type</Label>
                    <p>{deliveryTypeLabels[selectedTransaction.deliveryType] || selectedTransaction.deliveryType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transaction ID</Label>
                    <p className="font-mono">{selectedTransaction.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Purchase Date</Label>
                    <p>{formatDateTime(selectedTransaction.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Seller Paid</Label>
                    <p>{selectedTransaction.sellerPaid ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
