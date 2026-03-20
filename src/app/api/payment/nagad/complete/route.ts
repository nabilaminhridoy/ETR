import { NextRequest, NextResponse } from 'next/server'
import {
  getNagadConfigFromDB,
  NagadPaymentService,
} from '@/lib/payment/nagad/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentReferenceId, amount, challenge, additionalInfo } = body

    // Validate required fields
    if (!orderId || !paymentReferenceId || !amount || !challenge) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentReferenceId, amount, challenge' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get Nagad configuration
    const config = await getNagadConfigFromDB()
    if (!config) {
      return NextResponse.json(
        { error: 'Nagad payment gateway is not configured or disabled' },
        { status: 400 }
      )
    }

    // Create payment service
    const nagadService = new NagadPaymentService(config)

    // Complete payment
    const completeResult = await nagadService.complete(
      orderId,
      paymentReferenceId,
      amount,
      challenge,
      additionalInfo
    )

    if (!completeResult.success) {
      return NextResponse.json(
        { error: completeResult.error || 'Failed to complete payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      callBackUrl: completeResult.callBackUrl,
    })
  } catch (error) {
    console.error('Nagad complete API error:', error)
    return NextResponse.json(
      { error: 'Failed to complete payment' },
      { status: 500 }
    )
  }
}
