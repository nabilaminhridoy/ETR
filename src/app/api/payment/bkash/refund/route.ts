import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/bkash/refund
 * Refund a bKash payment
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
    const { paymentID, amount, trxID, sku, reason } = body

    if (!paymentID || !amount || !trxID) {
      return NextResponse.json({ 
        error: 'Payment ID, amount, and transaction ID are required' 
      }, { status: 400 })
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid refund amount' 
      }, { status: 400 })
    }

    // Process refund
    const result = await bkashService.refund({
      paymentID,
      amount: numAmount.toFixed(2),
      trxID,
      sku,
      reason,
    })

    return NextResponse.json({
      success: true,
      refund: result,
    })
  } catch (error: any) {
    console.error('Error processing bKash refund:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to process refund' 
    }, { status: 500 })
  }
}

/**
 * GET /api/payment/bkash/refund
 * Query refund status
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
    const trxID = searchParams.get('trxID')

    if (!paymentID || !trxID) {
      return NextResponse.json({ 
        error: 'Payment ID and transaction ID are required' 
      }, { status: 400 })
    }

    // Query refund status
    const result = await bkashService.refundStatus(paymentID, trxID)

    return NextResponse.json({
      success: true,
      refund: result,
    })
  } catch (error: any) {
    console.error('Error querying bKash refund:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to query refund' 
    }, { status: 500 })
  }
}
