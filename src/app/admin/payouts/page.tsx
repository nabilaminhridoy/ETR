'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Download, CheckCircle2, Clock, XCircle, Wallet, Send, ArrowUpRight } from 'lucide-react'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { formatPrice, formatDate } from '@/lib/utils'

const mockPayouts = [
  {
    id: '1',
    requestId: 'WDR-001',
    seller: { name: 'Rahman Ahmed', email: 'rahman@example.com', phone: '+880171234567', walletBalance: 5250 },
    amount: 5000,
    method: 'bKash',
    accountNumber: '01712345678',
    status: 'PENDING',
    createdAt: '2025-01-14',
  },
  {
    id: '2',
    requestId: 'WDR-002',
    seller: { name: 'Fatima Khatun', email: 'fatima@example.com', phone: '+880181234567', walletBalance: 3200 },
    amount: 3500,
    method: 'Nagad',
    accountNumber: '01812345678',
    status: 'APPROVED',
    createdAt: '2025-01-13',
  },
  {
    id: '3',
    requestId: 'WDR-003',
    seller: { name: 'Mohammad Ali', email: 'ali@example.com', phone: '+880191234567', walletBalance: 8500 },
    amount: 8000,
    method: 'Bank Transfer',
    accountNumber: '1234567890',
    bankName: 'Dutch Bangla Bank',
    status: 'COMPLETED',
    processedAt: '2025-01-12',
    createdAt: '2025-01-12',
  },
  {
    id: '4',
    requestId: 'WDR-004',
    seller: { name: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '+880161234567', walletBalance: 2500 },
    amount: 2500,
    method: 'Rocket',
    accountNumber: '01612345678',
    status: 'REJECTED',
    rejectionReason: 'Invalid account number',
    createdAt: '2025-01-11',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-500">Completed</Badge>
    case 'APPROVED':
      return <Badge className="bg-blue-500">Approved</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function PayoutsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayout, setSelectedPayout] = useState<any>(null)

  const filteredPayouts = mockPayouts.filter((payout) => {
    const matchesSearch = payout.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter
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
          <h1 className="text-2xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Manage seller withdrawal requests</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All</p>
                <p className="text-xl font-bold">{mockPayouts.length}</p>
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
                <p className="text-xl font-bold">{mockPayouts.filter(p => p.status === 'PENDING').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">{mockPayouts.filter(p => p.status === 'APPROVED').length}</p>
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
                <p className="text-xl font-bold">{mockPayouts.filter(p => p.status === 'COMPLETED').length}</p>
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
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold">{mockPayouts.filter(p => p.status === 'REJECTED').length}</p>
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
                placeholder="Search by request ID or seller..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
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
                <TableHead>Request ID</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.requestId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payout.seller.name}</p>
                      <p className="text-xs text-muted-foreground">{payout.seller.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatPrice(payout.amount)}</TableCell>
                  <TableCell>{payout.method}</TableCell>
                  <TableCell className="text-sm">{payout.accountNumber}</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(payout.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPayout(payout)}
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
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout Details - {selectedPayout?.requestId}</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{selectedPayout.seller.name}</p>
                  <p className="text-sm">{selectedPayout.seller.email}</p>
                  <p className="text-sm">{selectedPayout.seller.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(selectedPayout.amount)}</p>
                  <p className="text-xs text-muted-foreground">Wallet: {formatPrice(selectedPayout.seller.walletBalance)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{selectedPayout.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{selectedPayout.accountNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayout.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{formatDate(selectedPayout.createdAt)}</p>
                </div>
              </div>
              {selectedPayout.rejectionReason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selectedPayout.rejectionReason}</p>
                </div>
              )}
              {selectedPayout.status === 'PENDING' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" className="text-red-600">Reject</Button>
                  <Button className="bg-primary">Approve</Button>
                </DialogFooter>
              )}
              {selectedPayout.status === 'APPROVED' && (
                <DialogFooter>
                  <Button className="bg-primary gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Completed
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
