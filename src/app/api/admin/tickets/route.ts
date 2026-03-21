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
    
    // Handle both formats: userId:role:timestamp and userId:timestamp:role
    if (parts.length === 3) {
      const [userId, part2, part3] = parts
      // Check if part2 is a role (ADMIN or SUPER_ADMIN)
      if (part2 === 'ADMIN' || part2 === 'SUPER_ADMIN') {
        return { id: userId, role: part2 }
      }
      // Otherwise part3 is the role
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
    const transportType = searchParams.get('transportType')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (transportType && transportType !== 'all') {
      where.transportType = transportType
    }

    if (search) {
      where.OR = [
        { transportCompany: { contains: search, mode: 'insensitive' } },
        { pnrNumber: { contains: search, mode: 'insensitive' } },
        { fromCity: { contains: search, mode: 'insensitive' } },
        { toCity: { contains: search, mode: 'insensitive' } },
        { ticketId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
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

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching admin tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}
