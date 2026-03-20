import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transportType = searchParams.get('transportType')
    const fromCity = searchParams.get('fromCity')
    const toCity = searchParams.get('toCity')
    const travelDate = searchParams.get('travelDate')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')

    const where: any = {
      status: 'APPROVED',
    }

    if (transportType) where.transportType = transportType
    if (fromCity) where.fromCity = { contains: fromCity }
    if (toCity) where.toCity = { contains: toCity }
    if (travelDate) {
      const date = new Date(travelDate)
      where.travelDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      }
    }
    if (priceMin || priceMax) {
      where.sellingPrice = {}
      if (priceMin) where.sellingPrice.gte = parseFloat(priceMin)
      if (priceMax) where.sellingPrice.lte = parseFloat(priceMax)
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Calculate seller ratings (mock for now)
    const ticketsWithRatings = tickets.map((ticket) => ({
      ...ticket,
      seller: {
        ...ticket.seller,
        rating: 4.5 + Math.random() * 0.5,
      },
    }))

    return NextResponse.json({ tickets: ticketsWithRatings })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const transportType = formData.get('transportType') as string
    const transportCompany = formData.get('transportCompany') as string
    const pnrNumber = formData.get('pnrNumber') as string
    const fromCity = formData.get('fromCity') as string
    const toCity = formData.get('toCity') as string
    const travelDate = formData.get('travelDate') as string
    const departureTime = formData.get('departureTime') as string
    const seatNumber = formData.get('seatNumber') as string
    const classType = formData.get('classType') as string
    const originalPrice = parseFloat(formData.get('originalPrice') as string)
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string)
    const notes = formData.get('notes') as string
    const deliveryType = formData.get('deliveryType') as string

    // Get user from auth (simplified for demo)
    // In production, get from session/token
    const sellerId = 'demo-user-id'

    const ticket = await db.ticket.create({
      data: {
        sellerId,
        transportType: transportType as any,
        transportCompany,
        pnrNumber,
        fromCity,
        toCity,
        travelDate: new Date(travelDate),
        departureTime,
        seatNumber,
        classType,
        originalPrice,
        sellingPrice,
        notes,
        deliveryType: deliveryType as any,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
