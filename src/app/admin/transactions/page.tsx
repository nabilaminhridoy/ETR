'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Filter, CreditCard, Users, Truck, XCircle, ArrowUpDown } from 'lucide-react'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice, formatDate } from '@/lib/utils'

const mockTransactions = [
  {
    id: '1',
    transactionId: 'TXN-202501140001',
    type: 'ONLINE_PAYMENT',
    buyer: { name: 'John Doe', email: 'john@example.com' },
    seller: { name: 'Rahman Ahmed', email: 'rahman@example.com' },
    ticket: { company: 'Green Line', route: 'Dhaka → Chittagong' },
    amount: 1000,
    platformFee: 10,
    totalAmount: 1010,
    status: 'COMPLETED',
    createdAt: '2025-01-14 10:30:00',
  },
  {
    id: '2',
    transactionId: 'TXN-202501140002',
    type: 'IN_PERSON',
    buyer: { name: 'Jane Smith', email: 'jane@example.com' },
    seller: { name: 'Fatima Khatun', email: 'fatima@example.com' },
    ticket: { company: 'Bangladesh Railway', route: 'Dhaka → Sylhet' },
    amount: 750,
    platformFee: 10,
    totalAmount: 10,
    status: 'PENDING',
    createdAt: '2025-01-14 11:45:00',
  },
  {
    id: '3',
    transactionId: 'TXN-202501140003',
    type: 'COURIER',
    buyer: { name: 'Ali Hassan', email: 'ali@example.com' },
    seller: { name: 'Mohammad Ali', email: 'ali@example.com' },
    ticket: { company: 'Sundarban Launch', route: 'Dhaka → Barisal' },
    amount: 500,
    platformFee: 10,
    courierFee: 60,
    totalAmount: 570,
    status: 'COMPLETED',
    createdAt: '2025-01-14 12:15:00',
  },
  {
    id: '4',
    transactionId: 'TXN-202501140004',
    type: 'ONLINE_PAYMENT',
    buyer: { name: 'Nusrat Jahan', email: 'nusrat@example.com' },
    seller: { name: 'Karim Uddin', email: 'karim@example.com' },
    ticket: { company: 'Biman Bangladesh', route: "Dhaka → Cox's Bazar" },
    amount: 4500,
    platformFee: 45,
    totalAmount: 4545,
    status: 'CANCELED',
    createdAt: '2025-01-14 09:00:00',
  },
]

const getTypeIcon = (type: string) => {
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-500">Completed</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'CANCELED':
      return <Badge variant="destructive">Canceled</Badge>
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch = txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || txn.type === typeFilter
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
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
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View all platform transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUpDown className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All</p>
                <p className="text-xl font-bold">{mockTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-xl font-bold">{mockTransactions.filter(t => t.type === 'ONLINE_PAYMENT').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Person</p>
                <p className="text-xl font-bold">{mockTransactions.filter(t => t.type === 'IN_PERSON').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courier</p>
                <p className="text-xl font-bold">{mockTransactions.filter(t => t.type === 'COURIER').length}</p>
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
                <p className="text-xl font-bold">{mockTransactions.filter(t => t.status === 'CANCELED').length}</p>
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
                placeholder="Search by transaction ID or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ONLINE_PAYMENT">Online Payment</SelectItem>
                <SelectItem value="IN_PERSON">In Person</SelectItem>
                <SelectItem value="COURIER">Courier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.transactionId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(txn.type)}
                      <span className="text-sm">{txn.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{txn.buyer.name}</p>
                      <p className="text-xs text-muted-foreground">{txn.buyer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{txn.seller.name}</p>
                      <p className="text-xs text-muted-foreground">{txn.seller.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{txn.ticket.company}</p>
                      <p className="text-xs text-muted-foreground">{txn.ticket.route}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatPrice(txn.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Fee: {formatPrice(txn.platformFee)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(txn.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(txn.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(txn)}>
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
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="font-mono font-medium">{selectedTransaction.transactionId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{selectedTransaction.buyer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTransaction.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{selectedTransaction.seller.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTransaction.seller.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <span>{selectedTransaction.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket Price</span>
                  <span>{formatPrice(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (1%)</span>
                  <span>{formatPrice(selectedTransaction.platformFee)}</span>
                </div>
                {selectedTransaction.courierFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Courier Fee</span>
                    <span>{formatPrice(selectedTransaction.courierFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedTransaction.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
