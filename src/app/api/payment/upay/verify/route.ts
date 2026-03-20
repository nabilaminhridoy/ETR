import { NextRequest, NextResponse } from 'next/server'
import { UpayPaymentService, getUpayConfigFromDB } from '@/lib/payment/upay'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/upay/verify?txn_id=xxx
 * Verify payment status by transaction ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txnId = searchParams.get('txn_id')

    if (!txnId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction ID (txn_id) is required' 
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

    // Check payment status
    const upayService = new UpayPaymentService(config)
    const result = await upayService.checkPaymentStatus(txnId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to verify payment'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Upay verify error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify payment status' 
    }, { status: 500 })
  }
}

/**
 * POST /api/payment/upay/verify
 * Verify multiple payments at once (bulk verification)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txnIds } = body

    if (!txnIds || !Array.isArray(txnIds) || txnIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Array of transaction IDs (txnIds) is required' 
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

    // Check bulk payment status
    const upayService = new UpayPaymentService(config)
    const result = await upayService.checkBulkPaymentStatus(txnIds)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to verify payments'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Upay bulk verify error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify payment statuses' 
    }, { status: 500 })
  }
}
