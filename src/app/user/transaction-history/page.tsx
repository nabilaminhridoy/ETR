'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Filter, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice, formatDate } from '@/lib/utils'

const mockTransactions = [
  {
    id: '1',
    invoiceNumber: 'ETR-ABC123-XYZ',
    transportCompany: 'Green Line Paribahan',
    transportType: 'BUS',
    route: 'Dhaka → Chittagong',
    travelDate: '2025-06-15',
    ticketPrice: 1000,
    platformFee: 10,
    totalAmount: 1010,
    type: 'PURCHASE',
    status: 'COMPLETED',
    paymentMethod: 'bKash',
    deliveryType: 'ONLINE_PAYMENT',
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    invoiceNumber: 'ETR-DEF456-UVW',
    transportCompany: 'Bangladesh Railway',
    transportType: 'TRAIN',
    route: 'Dhaka → Sylhet',
    travelDate: '2025-06-16',
    ticketPrice: 750,
    platformFee: 10,
    totalAmount: 760,
    type: 'SALE',
    status: 'COMPLETED',
    paymentMethod: 'Nagad',
    deliveryType: 'IN_PERSON',
    createdAt: '2025-01-12',
  },
]

export default function TransactionHistoryPage() {
  const [transactions] = useState(mockTransactions)
  const [filter, setFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'PENDING': return 'secondary'
      case 'CANCELED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your transactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PURCHASE">Purchases</SelectItem>
                <SelectItem value="SALE">Sales</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" className="w-40" placeholder="From Date" />
            <Input type="date" className="w-40" placeholder="To Date" />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Invoice</th>
                  <th className="text-left p-4 text-sm font-medium">Details</th>
                  <th className="text-left p-4 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-sm font-medium">Amount</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <p className="font-medium text-sm">{tx.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{tx.transportCompany}</p>
                      <p className="text-xs text-muted-foreground">{tx.route}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{tx.type}</Badge>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{formatPrice(tx.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Fee: {formatPrice(tx.platformFee)}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(tx.status)}>{tx.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
