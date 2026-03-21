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
    // Token format: base64(userId:timestamp) or base64(userId:role:timestamp)
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    // First part is always userId
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

    // Fetch user's tickets
    const tickets = await db.ticket.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching user listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}
