import { NextResponse } from 'next/server'

export async function GET() {
  // Mock dashboard data for demo
  const stats = {
    totalListings: 12,
    activeListings: 8,
    totalPurchases: 5,
    walletBalance: 15000,
  }

  const recentListings = [
    {
      id: '1',
      fromCity: 'Dhaka',
      toCity: 'Chittagong',
      transportCompany: 'Green Line',
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
  ]

  const recentPurchases = [
    {
      id: '1',
      totalAmount: 1050,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
  ]

  return NextResponse.json({
    stats,
    recentListings,
    recentPurchases,
  })
}
