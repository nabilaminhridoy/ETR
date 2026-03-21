import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidTicketId } from '@/lib/ticket-utils'

export const dynamic = 'force-dynamic'

// GET - Get ticket by ticket ID (TKT-1001, TKT-1002, etc.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params

    // Validate ticket ID format
    if (!isValidTicketId(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID format. Expected format: TKT-XXXX' },
        { status: 400 }
      )
    }

    const ticket = await db.ticket.findUnique({
      where: { ticketId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Only show approved or sold tickets to public
    if (ticket.status !== 'APPROVED' && ticket.status !== 'SOLD') {
      return NextResponse.json(
        { error: 'Ticket not available' },
        { status: 404 }
      )
    }

    // Hide sensitive info for non-purchased tickets
    const publicTicket = {
      ...ticket,
      pnrNumber: '******', // Hidden until purchase
      ticketImage: null, // Hidden until purchase
      ticketPdf: null, // Hidden until purchase
    }

    return NextResponse.json({ ticket: publicTicket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}
