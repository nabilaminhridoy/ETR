import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/bkash/query
 * Query bKash payment status
 */
export async function GET(request: NextRequest) {
  try {
    const bkashService = await getBkashService()
    
    if (!bkashService) {
      return NextResponse.json({ 
        error: 'bKash payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const paymentID = searchParams.get('paymentID')

    if (!paymentID) {
      return NextResponse.json({ 
        error: 'Payment ID is required' 
      }, { status: 400 })
    }

    // Query payment
    const result = await bkashService.queryPayment(paymentID)

    return NextResponse.json({
      success: true,
      payment: result,
    })
  } catch (error: any) {
    console.error('Error querying bKash payment:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to query payment' 
    }, { status: 500 })
  }
}
