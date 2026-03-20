import { NextRequest, NextResponse } from 'next/server'
import { getSSLCommerzConfig, SSLCommerzPaymentService } from '@/lib/payment/sslcommerz'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/sslcommerz/verify
 * Verify SSLCommerz payment status
 * 
 * Query params:
 * - tran_id: Transaction ID
 * - sessionkey: Session Key
 * - val_id: Validation ID
 */
export async function GET(request: NextRequest) {
  try {
    const config = await getSSLCommerzConfig()
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        error: 'SSLCommerz payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const tranId = searchParams.get('tran_id')
    const sessionKey = searchParams.get('sessionkey')
    const valId = searchParams.get('val_id')

    const service = new SSLCommerzPaymentService(config)

    // If val_id is provided, use Order Validation API
    if (valId) {
      const result = await service.validatePayment(valId)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Payment validation failed' 
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    // If sessionkey is provided, query by session
    if (sessionKey) {
      const result = await service.queryBySessionId(sessionKey)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Transaction not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    // If tran_id is provided, query by transaction ID
    if (tranId) {
      const result = await service.queryByTranId(tranId)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Transaction not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Please provide tran_id, sessionkey, or val_id' 
    }, { status: 400 })

  } catch (error) {
    console.error('SSLCommerz verify error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify payment' 
    }, { status: 500 })
  }
}

/**
 * POST /api/payment/sslcommerz/verify
 * Verify payment with validation ID
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
    const { valId, tranId, sessionKey } = data

    const service = new SSLCommerzPaymentService(config)

    // If val_id is provided, use Order Validation API
    if (valId) {
      const result = await service.validatePayment(valId)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Payment validation failed' 
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    // If sessionkey is provided, query by session
    if (sessionKey) {
      const result = await service.queryBySessionId(sessionKey)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Transaction not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    // If tran_id is provided, query by transaction ID
    if (tranId) {
      const result = await service.queryByTranId(tranId)
      
      if (!result.success) {
        return NextResponse.json({ 
          success: false, 
          error: result.error || 'Transaction not found' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Please provide val_id, tran_id, or sessionKey' 
    }, { status: 400 })

  } catch (error) {
    console.error('SSLCommerz verify error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify payment' 
    }, { status: 500 })
  }
}
