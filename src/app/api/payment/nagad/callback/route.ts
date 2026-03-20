import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Nagad Payment Callback Handler
 * Nagad redirects here after payment completion with query parameters
 * 
 * Based on Nagad Online Payment API Integration Guide v3.3
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract callback parameters from Nagad
    const merchant = searchParams.get('merchant')
    const orderId = searchParams.get('order_id')
    const paymentRefId = searchParams.get('payment_ref_id')
    const status = searchParams.get('status')
    const statusCode = searchParams.get('status_code')
    const paymentDt = searchParams.get('payment_dt')
    const issuerPaymentRef = searchParams.get('issuer_payment_ref')

    console.log('Nagad callback received:', {
      merchant,
      orderId,
      paymentRefId,
      status,
      statusCode,
      paymentDt,
      issuerPaymentRef,
    })

    // Validate required parameters
    if (!merchant || !orderId || !status) {
      const cancelUrl = new URL('/payment/cancel', request.url)
      cancelUrl.searchParams.set('reason', 'Invalid callback parameters')
      return NextResponse.redirect(cancelUrl)
    }

    // Determine success or failure
    const isSuccess = status.toLowerCase() === 'success' && statusCode === '00_000_000'

    if (isSuccess) {
      // Update transaction in database if needed
      try {
        await db.systemSetting.upsert({
          where: { key: `nagad_txn_${orderId}` },
          update: {
            value: JSON.stringify({
              merchant,
              orderId,
              paymentRefId,
              status,
              statusCode,
              paymentDt,
              issuerPaymentRef,
              updatedAt: new Date().toISOString(),
            }),
          },
          create: {
            key: `nagad_txn_${orderId}`,
            value: JSON.stringify({
              merchant,
              orderId,
              paymentRefId,
              status,
              statusCode,
              paymentDt,
              issuerPaymentRef,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
        })
      } catch (dbError) {
        console.error('Failed to save transaction:', dbError)
      }

      // Redirect to success page
      const successUrl = new URL('/payment/success', request.url)
      successUrl.searchParams.set('transaction_id', paymentRefId || '')
      successUrl.searchParams.set('invoice', orderId)
      successUrl.searchParams.set('method', 'nagad')
      successUrl.searchParams.set('amount', searchParams.get('amount') || '')

      return NextResponse.redirect(successUrl)
    } else {
      // Redirect to cancel page with error info
      const cancelUrl = new URL('/payment/cancel', request.url)
      cancelUrl.searchParams.set('transaction_id', paymentRefId || '')
      cancelUrl.searchParams.set('invoice', orderId)
      cancelUrl.searchParams.set('method', 'nagad')
      cancelUrl.searchParams.set('reason', `${status}: ${statusCode}`)

      return NextResponse.redirect(cancelUrl)
    }
  } catch (error) {
    console.error('Nagad callback error:', error)
    const cancelUrl = new URL('/payment/cancel', request.url)
    cancelUrl.searchParams.set('reason', 'Server error')
    return NextResponse.redirect(cancelUrl)
  }
}

// Also handle POST callback (some gateways use POST)
export async function POST(request: NextRequest) {
  return GET(request)
}
