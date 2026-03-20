import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/bkash/search
 * Search for a bKash transaction
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
    const trxID = searchParams.get('trxID')

    if (!trxID) {
      return NextResponse.json({ 
        error: 'Transaction ID is required' 
      }, { status: 400 })
    }

    // Search transaction
    const result = await bkashService.searchTransaction(trxID)

    return NextResponse.json({
      success: true,
      transaction: result,
    })
  } catch (error: any) {
    console.error('Error searching bKash transaction:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to search transaction' 
    }, { status: 500 })
  }
}
