import { NextRequest, NextResponse } from 'next/server'
import { getSSLCommerzConfig, SSLCommerzPaymentService } from '@/lib/payment/sslcommerz'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/sslcommerz/ipn
 * Handle SSLCommerz Instant Payment Notification (IPN)
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getSSLCommerzConfig()
    
    if (!config) {
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 400 })
    }

    // Parse form data from SSLCommerz
    const formData = await request.formData()
    const params: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    // Extract key parameters
    const tranId = params.tran_id
    const valId = params.val_id
    const amount = params.amount
    const currency = params.currency_type || params.currency
    const bankTranId = params.bank_tran_id
    const status = params.status
    const storeId = params.store_id
    const tranDate = params.tran_date
    const cardType = params.card_type
    const cardNo = params.card_no
    const riskLevel = params.risk_level

    // Verify this is from SSLCommerz
    if (storeId !== config.storeId) {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 })
    }

    console.log('SSLCommerz IPN received:', {
      tran_id: tranId,
      val_id: valId,
      status: status,
      amount: amount,
      bank_tran_id: bankTranId,
    })

    // Validate the payment using Order Validation API
    if (valId && (status === 'VALID' || status === 'VALIDATED')) {
      const service = new SSLCommerzPaymentService(config)
      const validation = await service.validatePayment(valId)

      if (validation.success && validation.data) {
        // Check for risky payments
        if (validation.data.riskLevel === 1) {
          console.warn('Risky payment detected:', tranId)
          // You might want to hold the transaction and verify manually
        }

        // Update transaction in database
        try {
          await db.$executeRaw`
            UPDATE Transaction 
            SET status = 'COMPLETED', 
                transactionId = ${bankTranId},
                updatedAt = ${new Date().toISOString()}
            WHERE transactionId = ${tranId}
          `
        } catch (dbError) {
          console.error('Error updating transaction in IPN:', dbError)
        }

        console.log('Payment validated and processed:', tranId)
      } else {
        console.error('Payment validation failed:', validation.error)
        return NextResponse.json({ 
          error: 'Validation failed',
          details: validation.error 
        }, { status: 400 })
      }
    } else if (status === 'FAILED') {
      // Handle failed payment
      try {
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'FAILED', 
              updatedAt = ${new Date().toISOString()}
          WHERE transactionId = ${tranId}
        `
      } catch (dbError) {
        console.error('Error updating failed transaction:', dbError)
      }
    } else if (status === 'CANCELLED') {
      // Handle cancelled payment
      try {
        await db.$executeRaw`
          UPDATE Transaction 
          SET status = 'CANCELED', 
              updatedAt = ${new Date().toISOString()}
          WHERE transactionId = ${tranId}
        `
      } catch (dbError) {
        console.error('Error updating cancelled transaction:', dbError)
      }
    }

    // Return success response to SSLCommerz
    return NextResponse.json({ 
      success: true, 
      message: 'IPN processed successfully' 
    })

  } catch (error) {
    console.error('SSLCommerz IPN error:', error)
    return NextResponse.json({ 
      error: 'IPN processing failed' 
    }, { status: 500 })
  }
}

/**
 * GET /api/payment/sslcommerz/ipn
 * Health check for IPN endpoint
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'SSLCommerz IPN endpoint is active' 
  })
}
