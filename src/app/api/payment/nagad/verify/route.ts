import { NextRequest, NextResponse } from 'next/server'
import {
  getNagadConfigFromDB,
  NagadPaymentService,
} from '@/lib/payment/nagad/service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentReferenceId = searchParams.get('paymentReferenceId')

    if (!paymentReferenceId) {
      return NextResponse.json(
        { error: 'Payment reference ID is required' },
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

    // Verify payment
    const verifyResult = await nagadService.verify(paymentReferenceId)

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || 'Verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verifyResult.data,
    })
  } catch (error) {
    console.error('Nagad verify API error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentReferenceId } = body

    if (!paymentReferenceId) {
      return NextResponse.json(
        { error: 'Payment reference ID is required' },
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

    // Verify payment
    const verifyResult = await nagadService.verify(paymentReferenceId)

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || 'Verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verifyResult.data,
    })
  } catch (error) {
    console.error('Nagad verify API error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
