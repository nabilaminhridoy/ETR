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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin auth
    const admin = getAdminFromRequest(request)
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const ticket = await db.ticket.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error('Error rejecting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to reject ticket' },
      { status: 500 }
    )
  }
}
