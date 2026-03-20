import { NextRequest, NextResponse } from 'next/server'
import { getSSLCommerzConfig, SSLCommerzPaymentService } from '@/lib/payment/sslcommerz'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/payment/sslcommerz/callback
 * Handle SSLCommerz payment callback (success, fail, cancel)
 */
export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
}

async function handleCallback(request: NextRequest) {
  try {
    const config = await getSSLCommerzConfig()
    
    if (!config) {
      return NextResponse.redirect(new URL('/payment/failed?error=gateway_not_configured', request.url))
    }

    // Get parameters from query string or form data
    let params: Record<string, string> = {}
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    // For POST requests, also get form data
    if (request.method === 'POST') {
      try {
        const formData = await request.formData()
        formData.forEach((value, key) => {
          params[key] = value.toString()
        })
      } catch {
        // Ignore form parsing errors
      }
    }
    
    // Also check query params
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const tranId = params.tran_id || searchParams.get('tran_id')
    const valId = params.val_id || searchParams.get('val_id')
    const amount = params.amount || searchParams.get('amount')
    const bankTranId = params.bank_tran_id || searchParams.get('bank_tran_id')
    const cardType = params.card_type || searchParams.get('card_type')
    const tranStatus = params.status || searchParams.get('tran_status')

    // Determine the payment result
    const isCallbackStatus = searchParams.get('status') // success, failed, cancel
    const paymentStatus = tranStatus || isCallbackStatus

    if (paymentStatus === 'success' || tranStatus === 'VALID') {
      // Validate the payment
      if (valId) {
        const service = new SSLCommerzPaymentService(config)
        const validation = await service.validatePayment(valId)

        if (validation.success && validation.data) {
          // Payment validated successfully
          // Update transaction in database
          try {
            await db.$executeRaw`
              UPDATE Transaction 
              SET status = 'COMPLETED', 
                  transactionId = ${bankTranId || validation.data.bankTranId},
                  updatedAt = ${new Date().toISOString()}
              WHERE transactionId = ${tranId}
            `
          } catch (dbError) {
            console.error('Error updating transaction:', dbError)
          }

          // Redirect to success page
          const successUrl = new URL('/payment/success', request.url)
          successUrl.searchParams.set('tran_id', tranId || '')
          successUrl.searchParams.set('amount', validation.data.amount.toString())
          successUrl.searchParams.set('card_type', validation.data.cardType)
          return NextResponse.redirect(successUrl)
        }
      }

      // Redirect to success page even without validation (for simple cases)
      const successUrl = new URL('/payment/success', request.url)
      successUrl.searchParams.set('tran_id', tranId || '')
      successUrl.searchParams.set('amount', amount || '')
      return NextResponse.redirect(successUrl)
    }

    if (paymentStatus === 'failed' || tranStatus === 'FAILED') {
      // Update transaction status
      try {
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'FAILED', 
              updatedAt = ${new Date().toISOString()}
          WHERE transactionId = ${tranId}
        `
      } catch (dbError) {
        console.error('Error updating transaction:', dbError)
      }

      const failUrl = new URL('/payment/failed', request.url)
      failUrl.searchParams.set('tran_id', tranId || '')
      failUrl.searchParams.set('error', 'Payment failed')
      return NextResponse.redirect(failUrl)
    }

    if (paymentStatus === 'cancel' || isCallbackStatus === 'cancel') {
      // Update transaction status
      try {
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'CANCELED', 
              updatedAt = ${new Date().toISOString()}
          WHERE transactionId = ${tranId}
        `
      } catch (dbError) {
        console.error('Error updating transaction:', dbError)
      }

      const cancelUrl = new URL('/payment/cancelled', request.url)
      cancelUrl.searchParams.set('tran_id', tranId || '')
      return NextResponse.redirect(cancelUrl)
    }

    // Default redirect to payment page with status
    const redirectUrl = new URL('/payment/status', request.url)
    redirectUrl.searchParams.set('tran_id', tranId || '')
    redirectUrl.searchParams.set('status', paymentStatus || 'unknown')
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('SSLCommerz callback error:', error)
    return NextResponse.redirect(new URL('/payment/failed?error=callback_error', request.url))
  }
}
