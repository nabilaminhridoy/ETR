import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/bkash/execute
 * Execute a bKash payment after user authorization
 */
export async function POST(request: NextRequest) {
  try {
    const bkashService = await getBkashService()
    
    if (!bkashService) {
      return NextResponse.json({ 
        error: 'bKash payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    const body = await request.json()
    const { paymentID } = body

    if (!paymentID) {
      return NextResponse.json({ 
        error: 'Payment ID is required' 
      }, { status: 400 })
    }

    // Execute payment
    const result = await bkashService.executePayment(paymentID)

    return NextResponse.json({
      success: true,
      payment: result,
    })
  } catch (error: any) {
    console.error('Error executing bKash payment:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to execute payment' 
    }, { status: 500 })
  }
}
