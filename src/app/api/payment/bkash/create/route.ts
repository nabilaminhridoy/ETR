import { NextRequest, NextResponse } from 'next/server'
import { BkashService, getBkashService, BKASH_PAYMENT_STATUS } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/bkash/create
 * Create a bKash payment
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
    const { amount, merchantInvoiceNumber, payerReference, callbackURL, agreementID } = body

    // Validate required fields
    if (!amount || !merchantInvoiceNumber || !callbackURL) {
      return NextResponse.json({ 
        error: 'Amount, merchant invoice number, and callback URL are required' 
      }, { status: 400 })
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount' 
      }, { status: 400 })
    }

    // Create payment
    const paymentData = await bkashService.createPayment({
      amount: numAmount.toFixed(2),
      merchantInvoiceNumber,
      callbackURL,
      payerReference: payerReference || '',
      agreementID,
    })

    return NextResponse.json({
      success: true,
      payment: paymentData,
      bkashURL: paymentData.bkashURL,
      paymentID: paymentData.paymentID,
    })
  } catch (error: any) {
    console.error('Error creating bKash payment:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create payment' 
    }, { status: 500 })
  }
}
