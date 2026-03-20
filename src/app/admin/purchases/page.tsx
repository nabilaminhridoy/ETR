'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Download, CheckCircle2, Clock, XCircle, CreditCard, Users, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice, formatDate } from '@/lib/utils'

const mockPurchases = [
  {
    id: '1',
    invoiceNumber: 'ETR-ABC123',
    buyer: { name: 'John Doe', email: 'john@example.com', phone: '+880171234567' },
    seller: { name: 'Rahman Ahmed', email: 'rahman@example.com' },
    ticket: { company: 'Green Line', type: 'BUS', route: 'Dhaka → Chittagong', date: '2025-01-15' },
    amount: 1010,
    platformFee: 10,
    totalAmount: 1020,
    deliveryType: 'ONLINE_PAYMENT',
    status: 'COMPLETED',
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    invoiceNumber: 'ETR-DEF456',
    buyer: { name: 'Jane Smith', email: 'jane@example.com', phone: '+880181234567' },
    seller: { name: 'Fatima Khatun', email: 'fatima@example.com' },
    ticket: { company: 'Bangladesh Railway', type: 'TRAIN', route: 'Dhaka → Sylhet', date: '2025-01-16' },
    amount: 760,
    platformFee: 10,
    totalAmount: 770,
    deliveryType: 'IN_PERSON',
    status: 'PENDING',
    createdAt: '2025-01-12',
  },
  {
    id: '3',
    invoiceNumber: 'ETR-GHI789',
    buyer: { name: 'Ali Hassan', email: 'ali@example.com', phone: '+880191234567' },
    seller: { name: 'Mohammad Ali', email: 'ali@example.com' },
    ticket: { company: 'Sundarban Launch', type: 'LAUNCH', route: 'Dhaka → Barisal', date: '2025-01-17' },
    amount: 510,
    platformFee: 10,
    totalAmount: 520,
    deliveryType: 'COURIER',
    status: 'PENDING',
    createdAt: '2025-01-13',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-500">Completed</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'CANCELED':
      return <Badge variant="destructive">Canceled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getDeliveryIcon = (type: string) => {
  switch (type) {
    case 'ONLINE_PAYMENT':
      return <CreditCard className="w-4 h-4" />
    case 'IN_PERSON':
      return <Users className="w-4 h-4" />
    case 'COURIER':
      return <Truck className="w-4 h-4" />
    default:
      return <CreditCard className="w-4 h-4" />
  }
}

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)

  const filteredPurchases = mockPurchases.filter((purchase) => {
    const matchesSearch = purchase.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">Manage all ticket purchases</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
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
                <p className="text-xl font-bold">{mockPurchases.length}</p>
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
                <p className="text-xl font-bold">{mockPurchases.filter(p => p.status === 'COMPLETED').length}</p>
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
                <p className="text-xl font-bold">{mockPurchases.filter(p => p.status === 'PENDING').length}</p>
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
                <p className="text-xl font-bold">{mockPurchases.filter(p => p.status === 'CANCELED').length}</p>
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
                placeholder="Search by invoice or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{purchase.buyer.name}</p>
                      <p className="text-xs text-muted-foreground">{purchase.buyer.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{purchase.ticket.company}</p>
                      <p className="text-xs text-muted-foreground">{purchase.ticket.route}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatPrice(purchase.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Fee: {formatPrice(purchase.platformFee)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeliveryIcon(purchase.deliveryType)}
                      <span className="text-sm">{purchase.deliveryType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(purchase.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details - {selectedPurchase?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Buyer Information</h4>
                  <p className="text-sm">{selectedPurchase.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPurchase.buyer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedPurchase.buyer.phone}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seller Information</h4>
                  <p className="text-sm">{selectedPurchase.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPurchase.seller.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ticket Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Company:</span> {selectedPurchase.ticket.company}</p>
                  <p><span className="text-muted-foreground">Type:</span> {selectedPurchase.ticket.type}</p>
                  <p><span className="text-muted-foreground">Route:</span> {selectedPurchase.ticket.route}</p>
                  <p><span className="text-muted-foreground">Date:</span> {selectedPurchase.ticket.date}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Ticket Price:</span> {formatPrice(selectedPurchase.amount)}</p>
                  <p><span className="text-muted-foreground">Platform Fee:</span> {formatPrice(selectedPurchase.platformFee)}</p>
                  <p><span className="text-muted-foreground">Total:</span> {formatPrice(selectedPurchase.totalAmount)}</p>
                  <p><span className="text-muted-foreground">Delivery:</span> {selectedPurchase.deliveryType.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
