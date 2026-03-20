import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/bkash/status
 * Check payment gateway status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    const bkashService = await getBkashService()
    
    if (!bkashService) {
      return NextResponse.json({ 
        configured: false,
        enabled: false,
        message: 'bKash payment gateway is not configured' 
      })
    }

    // Try to get a token to verify credentials
    try {
      await bkashService.grantToken()
      
      return NextResponse.json({
        configured: true,
        enabled: true,
        message: 'bKash payment gateway is configured and working',
        baseUrl: bkashService.getBaseUrl(),
      })
    } catch (tokenError: any) {
      return NextResponse.json({
        configured: true,
        enabled: true,
        message: 'bKash credentials may be invalid',
        error: tokenError.message,
      })
    }
  } catch (error: any) {
    console.error('Error checking bKash status:', error)
    return NextResponse.json({ 
      configured: false,
      enabled: false,
      error: error.message || 'Failed to check status' 
    }, { status: 500 })
  }
}
