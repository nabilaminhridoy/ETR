import { NextRequest, NextResponse } from 'next/server'
import {
  getNagadConfigFromDB,
  NagadPaymentService,
  generateOrderId,
} from '@/lib/payment/nagad/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, accountNumber, additionalInfo } = body

    // Validate amount
    if (!amount || amount <= 0) {
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

    // Generate order ID if not provided
    const finalOrderId = orderId || generateOrderId()

    // Initialize payment
    const initResult = await nagadService.initialize(finalOrderId, accountNumber)
    if (!initResult.success) {
      return NextResponse.json(
        { error: initResult.error || 'Failed to initialize payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      paymentReferenceId: initResult.paymentReferenceId,
      challenge: initResult.challenge,
    })
  } catch (error) {
    console.error('Nagad initialize API error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
