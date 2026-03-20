import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/payment-methods
 * Public API to get active payment methods with labels and descriptions for frontend
 * Order: bKash, Nagad, Upay, SSLCommerz, UddoktaPay, PipraPay
 */
export async function GET() {
  try {
    const paymentMethods: Array<{
      id: string
      name: string
      label: string
      description: string
      isEnabled: boolean
    }> = []

    // 1. bKash
    try {
      const bkashGateway = await db.$queryRaw`
        SELECT isEnabled, credentials FROM PaymentGateway WHERE name = 'bkash'
      ` as any[]
      
      if (bkashGateway && bkashGateway.length > 0) {
        const gateway = bkashGateway[0]
        const credentials = gateway.credentials ? 
          (typeof gateway.credentials === 'string' ? JSON.parse(gateway.credentials) : gateway.credentials) : {}
        
        paymentMethods.push({
          id: 'bkash',
          name: 'bkash',
          label: credentials.label || 'bKash',
          description: credentials.description || 'Pay securely using bKash mobile wallet',
          isEnabled: gateway.isEnabled === 1 || gateway.isEnabled === true,
        })
      } else {
        paymentMethods.push({
          id: 'bkash',
          name: 'bkash',
          label: 'bKash',
          description: 'Pay securely using bKash mobile wallet',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'bkash',
        name: 'bkash',
        label: 'bKash',
        description: 'Pay securely using bKash mobile wallet',
        isEnabled: false,
      })
    }

    // 2. Nagad
    try {
      const nagadSetting = await db.systemSetting.findUnique({
        where: { key: 'payment_nagad' },
      })
      
      if (nagadSetting) {
        const data = JSON.parse(nagadSetting.value)
        paymentMethods.push({
          id: 'nagad',
          name: 'nagad',
          label: data.label || 'Nagad',
          description: data.description || 'Pay securely using Nagad mobile wallet',
          isEnabled: data.isEnabled ?? false,
        })
      } else {
        paymentMethods.push({
          id: 'nagad',
          name: 'nagad',
          label: 'Nagad',
          description: 'Pay securely using Nagad mobile wallet',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'nagad',
        name: 'nagad',
        label: 'Nagad',
        description: 'Pay securely using Nagad mobile wallet',
        isEnabled: false,
      })
    }

    // 3. Upay
    try {
      const upayGateway = await db.$queryRaw`
        SELECT isEnabled, credentials FROM PaymentGateway WHERE name = 'upay'
      ` as any[]
      
      if (upayGateway && upayGateway.length > 0) {
        const gateway = upayGateway[0]
        const credentials = gateway.credentials ? 
          (typeof gateway.credentials === 'string' ? JSON.parse(gateway.credentials) : gateway.credentials) : {}
        
        paymentMethods.push({
          id: 'upay',
          name: 'upay',
          label: credentials.label || 'Upay',
          description: credentials.description || 'Pay using Upay payment gateway',
          isEnabled: gateway.isEnabled === 1 || gateway.isEnabled === true,
        })
      } else {
        paymentMethods.push({
          id: 'upay',
          name: 'upay',
          label: 'Upay',
          description: 'Pay using Upay payment gateway',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'upay',
        name: 'upay',
        label: 'Upay',
        description: 'Pay using Upay payment gateway',
        isEnabled: false,
      })
    }

    // 4. SSLCommerz
    try {
      const sslcommerzGateway = await db.$queryRaw`
        SELECT isEnabled, credentials FROM PaymentGateway WHERE name = 'sslcommerz'
      ` as any[]
      
      if (sslcommerzGateway && sslcommerzGateway.length > 0) {
        const gateway = sslcommerzGateway[0]
        const credentials = gateway.credentials ? 
          (typeof gateway.credentials === 'string' ? JSON.parse(gateway.credentials) : gateway.credentials) : {}
        
        paymentMethods.push({
          id: 'sslcommerz',
          name: 'sslcommerz',
          label: credentials.label || 'SSLCommerz',
          description: credentials.description || 'Pay securely using SSLCommerz payment gateway',
          isEnabled: gateway.isEnabled === 1 || gateway.isEnabled === true,
        })
      } else {
        paymentMethods.push({
          id: 'sslcommerz',
          name: 'sslcommerz',
          label: 'SSLCommerz',
          description: 'Pay securely using SSLCommerz payment gateway',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'sslcommerz',
        name: 'sslcommerz',
        label: 'SSLCommerz',
        description: 'Pay securely using SSLCommerz payment gateway',
        isEnabled: false,
      })
    }

    // 5. UddoktaPay
    try {
      const uddoktaGateway = await db.paymentGateway.findUnique({
        where: { name: 'uddoktapay' },
      })
      
      if (uddoktaGateway) {
        const credentials = uddoktaGateway.credentials ? 
          JSON.parse(uddoktaGateway.credentials) : {}
        
        paymentMethods.push({
          id: 'uddoktapay',
          name: 'uddoktapay',
          label: credentials.label || 'UddoktaPay',
          description: credentials.description || 'Pay using multiple payment methods via UddoktaPay',
          isEnabled: uddoktaGateway.isEnabled,
        })
      } else {
        paymentMethods.push({
          id: 'uddoktapay',
          name: 'uddoktapay',
          label: 'UddoktaPay',
          description: 'Pay using multiple payment methods via UddoktaPay',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'uddoktapay',
        name: 'uddoktapay',
        label: 'UddoktaPay',
        description: 'Pay using multiple payment methods via UddoktaPay',
        isEnabled: false,
      })
    }

    // 6. PipraPay
    try {
      const pipraGateway = await db.paymentGateway.findUnique({
        where: { name: 'piprapay' },
      })
      
      if (pipraGateway) {
        const credentials = pipraGateway.credentials ? 
          JSON.parse(pipraGateway.credentials) : {}
        
        paymentMethods.push({
          id: 'piprapay',
          name: 'piprapay',
          label: credentials.label || 'PipraPay',
          description: credentials.description || 'Pay using multiple payment methods via PipraPay',
          isEnabled: pipraGateway.isEnabled,
        })
      } else {
        paymentMethods.push({
          id: 'piprapay',
          name: 'piprapay',
          label: 'PipraPay',
          description: 'Pay using multiple payment methods via PipraPay',
          isEnabled: false,
        })
      }
    } catch (e) {
      paymentMethods.push({
        id: 'piprapay',
        name: 'piprapay',
        label: 'PipraPay',
        description: 'Pay using multiple payment methods via PipraPay',
        isEnabled: false,
      })
    }

    // Return only enabled payment methods for frontend
    const enabledMethods = paymentMethods.filter(method => method.isEnabled)

    return NextResponse.json({
      success: true,
      paymentMethods: enabledMethods,
      allMethods: paymentMethods, // Include all methods for admin purposes
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}
