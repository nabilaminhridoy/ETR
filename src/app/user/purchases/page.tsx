'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, Download, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

const mockPurchases = [
  {
    id: '1',
    invoiceNumber: 'ETR-ABC123-XYZ',
    transportCompany: 'Green Line Paribahan',
    transportType: 'BUS',
    fromCity: 'Dhaka',
    toCity: 'Chittagong',
    travelDate: '2025-06-15',
    totalAmount: 1010,
    platformFee: 10,
    status: 'COMPLETED',
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    invoiceNumber: 'ETR-DEF456-UVW',
    transportCompany: 'Bangladesh Railway',
    transportType: 'TRAIN',
    fromCity: 'Dhaka',
    toCity: 'Sylhet',
    travelDate: '2025-06-16',
    totalAmount: 760,
    platformFee: 10,
    status: 'PENDING',
    createdAt: '2025-01-12',
  },
]

export default function MyPurchasesPage() {
  const [purchases] = useState(mockPurchases)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'PENDING': return 'secondary'
      case 'CANCELED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle2
      case 'PENDING': return Clock
      case 'CANCELED': return XCircle
      default: return Clock
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <p className="text-muted-foreground">View your ticket purchase history</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground">
              Your purchased tickets will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const StatusIcon = getStatusIcon(purchase.status)
            return (
              <Card key={purchase.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{purchase.transportCompany}</h3>
                          <Badge variant="secondary">{purchase.transportType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {purchase.fromCity} → {purchase.toCity}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{formatDate(purchase.travelDate)}</span>
                          <span>Invoice: {purchase.invoiceNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {formatPrice(purchase.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatPrice(purchase.platformFee)}
                      </p>
                      <Badge variant={getStatusColor(purchase.status)} className="mt-1">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {purchase.status}
                      </Badge>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
