import { NextRequest, NextResponse } from 'next/server'
import { UpayPaymentService, getUpayConfigFromDB } from '@/lib/payment/upay'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/upay/init
 * Initialize an Upay payment
 * 
 * Request body:
 * - amount: number (required)
 * - txnId: string (optional, will be generated if not provided)
 * - invoiceId: string (optional, will be generated if not provided)
 * - additionalInfo: object (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, txnId, invoiceId, additionalInfo } = body

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid amount is required' 
      }, { status: 400 })
    }

    // Get Upay configuration
    const config = await getUpayConfigFromDB()
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        error: 'Upay payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    // Create payment service
    const upayService = new UpayPaymentService(config)

    // Initialize payment
    const result = await upayService.initializePayment(
      amount,
      txnId,
      invoiceId,
      additionalInfo
    )

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to initialize payment'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      gatewayUrl: result.gatewayUrl,
      sessionId: result.sessionId,
      txnId: result.txnId,
      trxId: result.trxId,
      invoiceId: result.invoiceId,
    })
  } catch (error) {
    console.error('Upay payment init error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize payment' 
    }, { status: 500 })
  }
}
