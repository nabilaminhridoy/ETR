import { NextRequest, NextResponse } from 'next/server'
import { getSSLCommerzConfig, SSLCommerzPaymentService } from '@/lib/payment/sslcommerz'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/sslcommerz/init
 * Initialize SSLCommerz payment session
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getSSLCommerzConfig()
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        error: 'SSLCommerz payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    const data = await request.json()
    const { 
      amount, 
      tranId, 
      customerInfo, 
      shippingInfo, 
      productInfo 
    } = data

    // Validate amount
    if (!amount || amount < 10 || amount > 500000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Amount must be between 10 and 500,000 BDT' 
      }, { status: 400 })
    }

    const service = new SSLCommerzPaymentService(config)
    
    const result = await service.createSession(
      parseFloat(amount),
      tranId,
      customerInfo,
      shippingInfo,
      productInfo
    )

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to create payment session' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      gatewayUrl: result.gatewayUrl,
      tranId: result.tranId,
    })
  } catch (error) {
    console.error('SSLCommerz init error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize payment' 
    }, { status: 500 })
  }
}
