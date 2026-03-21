import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateTicketId } from '@/lib/ticket-utils'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

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

// Ensure upload directory exists
function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tickets')
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }
  return uploadDir
}

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
    // Get authenticated user
    const sellerId = getUserIdFromToken(request)
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Authentication required. Please login to sell tickets.' },
        { status: 401 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: sellerId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please login again.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    // Extract form fields
    const transportType = formData.get('transportType') as string
    const ticketType = formData.get('ticketType') as string // ONLINE_COPY or COUNTER_COPY
    const pnrNumber = formData.get('pnrNumber') as string
    const transportCompany = formData.get('transportCompany') as string
    const fromCity = formData.get('fromCity') as string
    const toCity = formData.get('toCity') as string
    const boardingPoint = formData.get('boardingPoint') as string
    const travelDate = formData.get('travelDate') as string
    const departureTime = formData.get('departureTime') as string
    const seatNumber = formData.get('seatNumber') as string
    const classType = formData.get('classType') as string
    const sleeperPosition = formData.get('sleeperPosition') as string | null
    const originalPrice = parseFloat(formData.get('originalPrice') as string)
    const sellingPriceStr = formData.get('sellingPrice') as string
    const sellingPrice = sellingPriceStr ? parseFloat(sellingPriceStr) : originalPrice
    const notes = formData.get('notes') as string
    const deliveryType = formData.get('deliveryType') as string
    const location = formData.get('location') as string | null
    const courierService = formData.get('courierService') as string | null
    const courierFeeStr = formData.get('courierFee') as string | null
    const courierFee = courierFeeStr ? parseFloat(courierFeeStr) : null
    const courierFeePaidBy = formData.get('courierFeePaidBy') as string | null

    // Get the uploaded file
    const ticketFile = formData.get('ticketFile') as File | null

    // Validate required fields
    if (!transportType || !pnrNumber || !transportCompany || !fromCity || !toCity || 
        !boardingPoint || !travelDate || !departureTime || !seatNumber || !classType || 
        !deliveryType || !originalPrice) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    // Validate file upload
    if (!ticketFile) {
      return NextResponse.json(
        { error: 'Ticket image or PDF is required' },
        { status: 400 }
      )
    }

    // Validate file type based on ticket type
    if (ticketType === 'ONLINE_COPY' && ticketFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF file is required for Online Copy tickets' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (ticketFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Handle file upload
    const uploadDir = ensureUploadDir()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = ticketFile.name.split('.').pop() || (ticketFile.type === 'application/pdf' ? 'pdf' : 'png')
    const filename = `ticket-${timestamp}-${randomString}.${extension}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    const bytes = await ticketFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Public URL for the file
    const fileUrl = `/uploads/tickets/${filename}`
    const isPdf = ticketFile.type === 'application/pdf'

    // Generate sequential ticket ID
    const ticketId = await generateTicketId()

    // Create ticket in database
    const ticket = await db.ticket.create({
      data: {
        ticketId,
        sellerId,
        ticketType: ticketType ? (ticketType as any) : 'COUNTER_COPY',
        transportType: transportType as any,
        transportCompany,
        pnrNumber,
        fromCity,
        toCity,
        travelDate: new Date(travelDate),
        departureTime,
        seatNumber,
        classType,
        sleeperPosition: sleeperPosition ? (sleeperPosition as any) : null,
        originalPrice,
        sellingPrice,
        ticketImage: isPdf ? null : fileUrl,
        ticketPdf: isPdf ? fileUrl : null,
        notes: notes || null,
        deliveryType: deliveryType as any,
        location: location || null,
        courierService: courierService ? (courierService as any) : null,
        courierFeePaidBy: courierFeePaidBy ? (courierFeePaidBy as any) : null,
        courierFee: courierFee,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      success: true,
      ticket,
      message: 'Ticket listed successfully'
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket. Please try again.' },
      { status: 500 }
    )
  }
}
