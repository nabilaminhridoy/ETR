'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice, formatDate, getTransportTypeLabel } from '@/lib/utils'
import Link from 'next/link'

const mockListings = [
  {
    id: '1',
    transportType: 'BUS',
    transportCompany: 'Green Line Paribahan',
    fromCity: 'Dhaka',
    toCity: 'Chittagong',
    travelDate: '2025-06-15',
    seatNumber: 'A1',
    sellingPrice: 1000,
    status: 'APPROVED',
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    transportType: 'TRAIN',
    transportCompany: 'Bangladesh Railway',
    fromCity: 'Dhaka',
    toCity: 'Sylhet',
    travelDate: '2025-06-16',
    seatNumber: 'S-5',
    sellingPrice: 750,
    status: 'PENDING',
    createdAt: '2025-01-12',
  },
]

export default function MyListingsPage() {
  const [listings, setListings] = useState(mockListings)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'default'
      case 'PENDING': return 'secondary'
      case 'REJECTED': return 'destructive'
      case 'SOLD': return 'outline'
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
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your ticket listings</p>
        </div>
        <Link href="/sell-tickets">
          <Button className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start selling your unused tickets
            </p>
            <Link href="/sell-tickets">
              <Button className="btn-primary">Sell Your First Ticket</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{listing.transportCompany}</h3>
                        <Badge variant="secondary">{getTransportTypeLabel(listing.transportType)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {listing.fromCity} → {listing.toCity}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{formatDate(listing.travelDate)}</span>
                        <span>Seat: {listing.seatNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">
                      {formatPrice(listing.sellingPrice)}
                    </p>
                    <Badge variant={getStatusColor(listing.status)} className="mt-1">
                      {listing.status}
                    </Badge>
                    <div className="mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
