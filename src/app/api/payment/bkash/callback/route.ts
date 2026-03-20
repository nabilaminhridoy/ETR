import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/bkash/callback
 * Handle bKash payment callback
 * 
 * Callback URL format:
 * https://yourdomain.com/api/payment/bkash/callback?paymentID=xxx&status=xxx&signature=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentID = searchParams.get('paymentID')
    const status = searchParams.get('status')
    const signature = searchParams.get('signature')

    console.log('bKash Callback:', { paymentID, status, signature })

    if (!paymentID) {
      return NextResponse.redirect(new URL('/payment/failed?error=invalid_callback', request.url))
    }

    const bkashService = await getBkashService()

    if (!bkashService) {
      return NextResponse.redirect(new URL('/payment/failed?error=gateway_not_configured', request.url))
    }

    // Query the actual payment status from bKash
    const paymentResult = await bkashService.queryPayment(paymentID)

    // Update payment record in database
    // You should have a Payment table to track payments
    // For now, we'll just log and redirect

    if (status === 'success' && paymentResult.transactionStatus === 'Completed') {
      // Payment successful
      console.log('Payment successful:', paymentResult)
      
      // Redirect to success page with payment details
      const successUrl = new URL('/payment/success', request.url)
      successUrl.searchParams.set('paymentID', paymentID)
      successUrl.searchParams.set('trxID', paymentResult.trxID || '')
      successUrl.searchParams.set('amount', paymentResult.amount || '')
      successUrl.searchParams.set('merchantInvoiceNumber', paymentResult.merchantInvoiceNumber || '')
      
      return NextResponse.redirect(successUrl)
    } else if (status === 'cancel') {
      // Payment cancelled by user
      return NextResponse.redirect(new URL('/payment/cancelled?paymentID=' + paymentID, request.url))
    } else if (status === 'failure') {
      // Payment failed
      return NextResponse.redirect(new URL('/payment/failed?paymentID=' + paymentID + '&status=' + paymentResult.transactionStatus, request.url))
    } else {
      // Unknown status - query to verify
      if (paymentResult.transactionStatus === 'Completed') {
        const successUrl = new URL('/payment/success', request.url)
        successUrl.searchParams.set('paymentID', paymentID)
        successUrl.searchParams.set('trxID', paymentResult.trxID || '')
        return NextResponse.redirect(successUrl)
      }
      
      return NextResponse.redirect(new URL('/payment/failed?error=unknown_status', request.url))
    }
  } catch (error: any) {
    console.error('Error handling bKash callback:', error)
    return NextResponse.redirect(new URL('/payment/failed?error=' + encodeURIComponent(error.message), request.url))
  }
}
