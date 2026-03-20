import { NextRequest, NextResponse } from 'next/server'
import { UpayPaymentService, getUpayConfigFromDB } from '@/lib/payment/upay'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/upay/callback
 * Handle callback from Upay after payment
 * 
 * Query params:
 * - status: success/failed/cancelled/pending/expired
 * - invoice_id: Invoice ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const invoiceId = searchParams.get('invoice_id')

    console.log('Upay callback received:', { status, invoiceId })

    if (!status || !invoiceId) {
      return NextResponse.redirect(new URL('/payment/cancel?error=invalid_callback', request.url))
    }

    // Get Upay configuration
    const config = await getUpayConfigFromDB()
    if (!config) {
      return NextResponse.redirect(new URL('/payment/cancel?error=gateway_not_configured', request.url))
    }

    // Find the transaction by invoice ID
    const transaction = await db.$queryRaw`
      SELECT id, txnId FROM Transaction WHERE invoiceNumber = ${invoiceId}
    ` as Array<{ id: string; txnId: string }>

    const txnId = transaction && transaction.length > 0 ? transaction[0].txnId : invoiceId

    // Check payment status with Upay
    const upayService = new UpayPaymentService(config)
    const verifyResult = await upayService.checkPaymentStatus(txnId)

    if (status.toLowerCase() === 'success' && verifyResult.success && verifyResult.data) {
      // Update transaction status
      if (transaction && transaction.length > 0) {
        const now = new Date().toISOString()
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'COMPLETED', 
              transactionId = ${verifyResult.data.trxId},
              updatedAt = ${now}
          WHERE id = ${transaction[0].id}
        `
      }

      // Redirect to success page
      return NextResponse.redirect(new URL(`/payment/success?invoice_id=${invoiceId}&status=success`, request.url))
    } else {
      // Payment failed or cancelled
      if (transaction && transaction.length > 0) {
        const now = new Date().toISOString()
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'FAILED', 
              updatedAt = ${now}
          WHERE id = ${transaction[0].id}
        `
      }

      // Redirect to cancel page
      return NextResponse.redirect(new URL(`/payment/cancel?invoice_id=${invoiceId}&status=${status}`, request.url))
    }
  } catch (error) {
    console.error('Upay callback error:', error)
    return NextResponse.redirect(new URL('/payment/cancel?error=callback_failed', request.url))
  }
}

/**
 * POST /api/payment/upay/callback
 * Handle webhook/IPN callback from Upay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, invoice_id, txn_id, trx_id } = body

    console.log('Upay webhook received:', { status, invoice_id, txn_id, trx_id })

    // Get Upay configuration
    const config = await getUpayConfigFromDB()
    if (!config) {
      return NextResponse.json({ success: false, error: 'Gateway not configured' }, { status: 400 })
    }

    // Verify payment status
    const upayService = new UpayPaymentService(config)
    const verifyResult = await upayService.checkPaymentStatus(txn_id || invoice_id)

    if (!verifyResult.success) {
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 400 })
    }

    // Find and update transaction
    const transaction = await db.$queryRaw`
      SELECT id FROM Transaction WHERE invoiceNumber = ${invoice_id}
    ` as Array<{ id: string }>

    if (transaction && transaction.length > 0) {
      const now = new Date().toISOString()
      const paymentStatus = verifyResult.data?.status?.toLowerCase() || status?.toLowerCase()
      
      let newStatus = 'PENDING'
      if (paymentStatus === 'success') {
        newStatus = 'COMPLETED'
      } else if (['failed', 'cancelled', 'expired'].includes(paymentStatus)) {
        newStatus = 'FAILED'
      }

      await db.$executeRaw`
        UPDATE Transaction 
        SET status = ${newStatus}, 
            transactionId = ${verifyResult.data?.trxId || trx_id || null},
            updatedAt = ${now}
        WHERE id = ${transaction[0].id}
      `
    }

    return NextResponse.json({ success: true, status: verifyResult.data?.status })
  } catch (error) {
    console.error('Upay webhook error:', error)
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}
