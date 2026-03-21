import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin auth
function getAdminFromRequest(request: NextRequest): { id: string; role: string } | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    
    if (parts.length >= 2) {
      const [userId, part2, part3] = parts
      if (part2 === 'ADMIN' || part2 === 'SUPER_ADMIN') {
        return { id: userId, role: part2 }
      }
      if (part3 === 'ADMIN' || part3 === 'SUPER_ADMIN') {
        return { id: userId, role: part3 }
      }
    }
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin auth
    const admin = getAdminFromRequest(request)
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { buyerName: { contains: search, mode: 'insensitive' } },
        { buyerPhone: { contains: search, mode: 'insensitive' } },
        { buyerEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        ticket: {
          select: {
            ticketId: true,
            ticketType: true,
            transportType: true,
            transportCompany: true,
            fromCity: true,
            toCity: true,
            travelDate: true,
            departureTime: true,
            seatNumber: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching admin purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
