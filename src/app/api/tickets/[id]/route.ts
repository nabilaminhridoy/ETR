import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            phone: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Hide sensitive info for non-purchased tickets
    const publicTicket = {
      ...ticket,
      pnrNumber: '******', // Hidden until purchase
      ticketImage: null, // Hidden until purchase
      seller: {
        ...ticket.seller,
        phone: undefined, // Hidden until purchase
      },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const ticket = await db.ticket.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.ticket.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
