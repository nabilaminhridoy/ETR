'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
  Bus,
  Train,
  Ship,
  Plane,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Ticket {
  id: string
  transportType: string
  transportCompany: string
  pnrNumber: string
  fromCity: string
  toCity: string
  travelDate: string
  departureTime: string
  seatNumber: string
  classType: string
  originalPrice: number
  sellingPrice: number
  status: string
  ticketImage: string | null
  notes: string | null
  rejectionReason: string | null
  createdAt: string
  seller: {
    id: string
    name: string | null
    email: string
    isVerified: boolean
  }
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

export default function TicketsManagementPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [transportFilter, setTransportFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (transportFilter !== 'all') params.set('transportType', transportFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/tickets?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, transportFilter, search])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleApprove = async (ticketId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Ticket approved successfully' })
        fetchTickets()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to approve ticket')
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTicket || !rejectionReason.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a rejection reason' })
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Ticket rejected successfully' })
        setShowRejectDialog(false)
        setRejectionReason('')
        fetchTickets()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reject ticket')
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTicket) return

    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Ticket deleted successfully' })
        setShowDeleteDialog(false)
        fetchTickets()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete ticket')
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setProcessing(false)
    }
  }

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'BUS': return Bus
      case 'TRAIN': return Train
      case 'LAUNCH': return Ship
      case 'AIR': return Plane
      default: return Bus
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.transportCompany.toLowerCase().includes(search.toLowerCase()) ||
      ticket.pnrNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.fromCity.toLowerCase().includes(search.toLowerCase()) ||
      ticket.toCity.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tickets Management</h1>
          <p className="text-muted-foreground">Manage all tickets listed on the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTickets}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company, PNR, or route..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transportFilter} onValueChange={setTransportFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Transport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BUS">Bus</SelectItem>
                <SelectItem value="TRAIN">Train</SelectItem>
                <SelectItem value="LAUNCH">Launch</SelectItem>
                <SelectItem value="AIR">Air</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading tickets...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const Icon = getTransportIcon(ticket.transportType)
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', transportTypeColors[ticket.transportType])}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{ticket.transportCompany}</p>
                            <p className="text-xs text-muted-foreground">PNR: {ticket.pnrNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p>{ticket.fromCity} → {ticket.toCity}</p>
                        <p className="text-xs text-muted-foreground">Seat: {ticket.seatNumber}</p>
                      </TableCell>
                      <TableCell>
                        <p>{formatDate(ticket.travelDate)}</p>
                        <p className="text-xs text-muted-foreground">{ticket.departureTime}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatPrice(ticket.sellingPrice)}</p>
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(ticket.originalPrice)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p>{ticket.seller.name || 'N/A'}</p>
                          {ticket.seller.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{ticket.seller.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-white', statusColors[ticket.status])}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setShowViewDialog(true) }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {ticket.status === 'PENDING' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(ticket.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setShowRejectDialog(true) }}>
                                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setShowDeleteDialog(true) }} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>Complete information about this ticket</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Transport Type</Label>
                  <p className="font-medium">{selectedTicket.transportType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedTicket.transportCompany}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PNR Number</Label>
                  <p className="font-medium">{selectedTicket.pnrNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seat Number</Label>
                  <p className="font-medium">{selectedTicket.seatNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Route</Label>
                  <p className="font-medium">{selectedTicket.fromCity} → {selectedTicket.toCity}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Class</Label>
                  <p className="font-medium">{selectedTicket.classType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Travel Date</Label>
                  <p className="font-medium">{formatDate(selectedTicket.travelDate)} at {selectedTicket.departureTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={cn('text-white', statusColors[selectedTicket.status])}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Original Price</Label>
                  <p className="font-medium">{formatPrice(selectedTicket.originalPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Selling Price</Label>
                  <p className="font-medium text-primary">{formatPrice(selectedTicket.sellingPrice)}</p>
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

              <div>
                <Label className="text-muted-foreground">Seller</Label>
                <p className="font-medium">{selectedTicket.seller.name} ({selectedTicket.seller.email})</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            {selectedTicket?.status === 'PENDING' && (
              <>
                <Button variant="destructive" onClick={() => { setShowViewDialog(false); setShowRejectDialog(true) }}>
                  Reject
                </Button>
                <Button onClick={() => { setShowViewDialog(false); handleApprove(selectedTicket.id) }}>
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Ticket</DialogTitle>
            <DialogDescription>Please provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason('') }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Reject Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
              {processing ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
