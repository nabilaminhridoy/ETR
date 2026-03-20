import { NextResponse } from 'next/server'

export async function GET() {
  // Mock admin dashboard data for demo
  const stats = {
    totalSales: 245000,
    platformFees: 2450,
    totalTickets: 156,
    activeUsers: 1250,
    verifiedSellers: 89,
    pendingTickets: 12,
    pendingPayouts: 5,
    openReports: 3,
  }

  const recentTickets = [
    {
      id: '1',
      fromCity: 'Dhaka',
      toCity: 'Chittagong',
      transportCompany: 'Green Line Paribahan',
      sellingPrice: 1000,
      status: 'APPROVED',
    },
    {
      id: '2',
      fromCity: 'Dhaka',
      toCity: 'Sylhet',
      transportCompany: 'Bangladesh Railway',
      sellingPrice: 750,
      status: 'PENDING',
    },
    {
      id: '3',
      fromCity: 'Dhaka',
      toCity: 'Barisal',
      transportCompany: 'Sundarban Launch',
      sellingPrice: 500,
      status: 'PENDING',
    },
  ]

  const recentPurchases = [
    {
      id: '1',
      invoiceNumber: 'ETR-ABC123-XYZ',
      totalAmount: 1010,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      invoiceNumber: 'ETR-DEF456-UVW',
      totalAmount: 760,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ]

  return NextResponse.json({
    stats,
    recentTickets,
    recentPurchases,
  })
}
