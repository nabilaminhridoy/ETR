import { NextRequest, NextResponse } from 'next/server'
import { getBkashService } from '@/lib/bkash'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/bkash/agreement
 * Create a bKash agreement (for recurring payments)
 */
export async function POST(request: NextRequest) {
  try {
    const bkashService = await getBkashService()
    
    if (!bkashService) {
      return NextResponse.json({ 
        error: 'bKash payment gateway is not configured or disabled' 
      }, { status: 400 })
    }

    const body = await request.json()
    const { action } = body

    // Handle different agreement actions
    switch (action) {
      case 'create': {
        const { payerReference, callbackURL } = body
        
        if (!payerReference || !callbackURL) {
          return NextResponse.json({ 
            error: 'Payer reference and callback URL are required' 
          }, { status: 400 })
        }

        const result = await bkashService.createAgreement({
          payerReference,
          callbackURL,
        })

        return NextResponse.json({
          success: true,
          agreement: result,
          bkashURL: result.bkashURL,
          paymentID: result.paymentID,
        })
      }

      case 'execute': {
        const { paymentID } = body
        
        if (!paymentID) {
          return NextResponse.json({ 
            error: 'Payment ID is required' 
          }, { status: 400 })
        }

        const result = await bkashService.executeAgreement(paymentID)

        return NextResponse.json({
          success: true,
          agreement: result,
        })
      }

      case 'query': {
        const { agreementID } = body
        
        if (!agreementID) {
          return NextResponse.json({ 
            error: 'Agreement ID is required' 
          }, { status: 400 })
        }

        const result = await bkashService.queryAgreement(agreementID)

        return NextResponse.json({
          success: true,
          agreement: result,
        })
      }

      case 'cancel': {
        const { agreementID } = body
        
        if (!agreementID) {
          return NextResponse.json({ 
            error: 'Agreement ID is required' 
          }, { status: 400 })
        }

        const result = await bkashService.cancelAgreement(agreementID)

        return NextResponse.json({
          success: true,
          agreement: result,
        })
      }

      case 'payment': {
        // Create payment with existing agreement
        const { agreementID, amount, merchantInvoiceNumber, callbackURL, payerReference } = body
        
        if (!agreementID || !amount || !merchantInvoiceNumber || !callbackURL) {
          return NextResponse.json({ 
            error: 'Agreement ID, amount, merchant invoice number, and callback URL are required' 
          }, { status: 400 })
        }

        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
          return NextResponse.json({ 
            error: 'Invalid amount' 
          }, { status: 400 })
        }

        const result = await bkashService.createPaymentWithAgreement({
          agreementID,
          amount: numAmount.toFixed(2),
          merchantInvoiceNumber,
          callbackURL,
          payerReference,
        })

        return NextResponse.json({
          success: true,
          payment: result,
          bkashURL: result.bkashURL,
          paymentID: result.paymentID,
        })
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Supported actions: create, execute, query, cancel, payment' 
        }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error processing bKash agreement:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to process agreement' 
    }, { status: 500 })
  }
}
