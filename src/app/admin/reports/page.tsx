'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, AlertTriangle, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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

const mockReports = [
  {
    id: '1',
    reportId: 'RPT-001',
    reporter: { name: 'John Doe', email: 'john@example.com' },
    reportedUser: { name: 'Rahman Ahmed', email: 'rahman@example.com' },
    ticket: { id: 'TKT-001', company: 'Green Line', route: 'Dhaka → Chittagong' },
    reason: 'Fake ticket - PNR number does not exist',
    description: 'I tried to verify the PNR with the transport company and they said it does not exist. The seller is refusing to refund.',
    status: 'PENDING',
    createdAt: '2025-01-14',
  },
  {
    id: '2',
    reportId: 'RPT-002',
    reporter: { name: 'Jane Smith', email: 'jane@example.com' },
    reportedUser: { name: 'Fatima Khatun', email: 'fatima@example.com' },
    ticket: { id: 'TKT-002', company: 'Bangladesh Railway', route: 'Dhaka → Sylhet' },
    reason: 'Seller not responding after payment',
    description: 'Paid for the ticket 3 days ago but seller is not responding to calls or messages. The travel date is tomorrow.',
    status: 'PROCESSING',
    createdAt: '2025-01-13',
  },
  {
    id: '3',
    reportId: 'RPT-003',
    reporter: { name: 'Ali Hassan', email: 'ali@example.com' },
    reportedUser: { name: 'Mohammad Ali', email: 'ali@example.com' },
    ticket: { id: 'TKT-003', company: 'Sundarban Launch', route: 'Dhaka → Barisal' },
    reason: 'Ticket details do not match listing',
    description: 'The seat number on the ticket is different from what was listed. The class is also different.',
    status: 'RESOLVED',
    resolution: 'Full refund issued to buyer. Seller account suspended for 7 days.',
    createdAt: '2025-01-12',
  },
  {
    id: '4',
    reportId: 'RPT-004',
    reporter: { name: 'Nusrat Jahan', email: 'nusrat@example.com' },
    reportedUser: { name: 'Karim Uddin', email: 'karim@example.com' },
    ticket: { id: 'TKT-004', company: 'Biman Bangladesh', route: "Dhaka → Cox's Bazar" },
    reason: 'Suspicious seller behavior',
    description: 'Seller asking for payment outside the platform via personal bKash.',
    status: 'REJECTED',
    rejectionReason: 'Insufficient evidence provided. Please provide screenshots of the conversation.',
    createdAt: '2025-01-11',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'RESOLVED':
      return <Badge className="bg-green-500">Resolved</Badge>
    case 'PROCESSING':
      return <Badge className="bg-blue-500">Processing</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
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
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Handle reported tickets and users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All</p>
                <p className="text-xl font-bold">{mockReports.length}</p>
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
                <p className="text-xl font-bold">{mockReports.filter(r => r.status === 'PENDING').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-xl font-bold">{mockReports.filter(r => r.status === 'PROCESSING').length}</p>
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
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{mockReports.filter(r => r.status === 'RESOLVED').length}</p>
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
                <p className="text-xl font-bold">{mockReports.filter(r => r.status === 'REJECTED').length}</p>
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
                placeholder="Search by report ID or reporter..."
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
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
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
                <TableHead>Report ID</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.reportId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.reporter.name}</p>
                      <p className="text-xs text-muted-foreground">{report.reporter.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.reportedUser.name}</p>
                      <p className="text-xs text-muted-foreground">{report.reportedUser.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.ticket.company}</p>
                      <p className="text-xs text-muted-foreground">{report.ticket.route}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
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
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details - {selectedReport?.reportId}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50">
                  <h4 className="font-semibold mb-2">Reporter</h4>
                  <p className="text-sm">{selectedReport.reporter.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter.email}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50">
                  <h4 className="font-semibold mb-2 text-red-800">Reported User</h4>
                  <p className="text-sm text-red-900">{selectedReport.reportedUser.name}</p>
                  <p className="text-sm text-red-600">{selectedReport.reportedUser.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ticket</h4>
                <p className="text-sm">{selectedReport.ticket.company} - {selectedReport.ticket.route}</p>
                <p className="text-xs text-muted-foreground">ID: {selectedReport.ticket.id}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-sm font-medium">{selectedReport.reason}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
              </div>
              {selectedReport.resolution && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-semibold mb-1 text-green-800">Resolution</h4>
                  <p className="text-sm text-green-700">{selectedReport.resolution}</p>
                </div>
              )}
              {selectedReport.rejectionReason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <h4 className="font-semibold mb-1 text-red-800">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{selectedReport.rejectionReason}</p>
                </div>
              )}
              {selectedReport.status === 'PENDING' && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Admin Notes</h4>
                    <Textarea placeholder="Add notes about this report..." />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" className="text-red-600">Reject</Button>
                    <Button variant="outline">Start Processing</Button>
                    <Button className="bg-primary">Resolve</Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
