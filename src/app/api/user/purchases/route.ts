import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to get user ID from auth token
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    return parts[0] || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Fetch user's purchases (as buyer)
    const purchases = await db.transaction.findMany({
      where: { buyerId: userId },
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
            ticketImage: true,
            ticketPdf: true,
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
    })

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error('Error fetching user purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
