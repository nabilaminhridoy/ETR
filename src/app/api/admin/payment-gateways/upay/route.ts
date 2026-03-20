import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payment-gateways/upay
 * Get Upay gateway configuration
 */
export async function GET() {
  try {
    const gateway = await db.$queryRaw`
      SELECT id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt
      FROM PaymentGateway 
      WHERE name = 'upay'
    ` as Array<{ id: string; name: string; isEnabled: number; isSandbox: number; credentials: string | null; createdAt: string; updatedAt: string }>

    const gatewayData = gateway && gateway.length > 0 ? gateway[0] : null

    if (!gatewayData) {
      return NextResponse.json({
        gateway: {
          id: '',
          name: 'upay',
          isEnabled: false,
          isSandbox: true,
          label: 'Upay',
          description: 'Pay securely using Upay mobile wallet',
          credentials: {
            merchantId: '',
            merchantKey: '',
            merchantName: '',
            merchantCode: '',
            merchantCity: 'Dhaka',
            merchantMobile: '',
            merchantCountryCode: 'BD',
            merchantCategoryCode: '',
            transactionCurrencyCode: 'BDT',
          },
        }
      })
    }

    const credentialsRaw = gatewayData.credentials || '{}'
    const parsedCredentials = typeof credentialsRaw === 'string' ? JSON.parse(credentialsRaw) : credentialsRaw

    return NextResponse.json({
      gateway: {
        id: gatewayData.id,
        name: gatewayData.name,
        isEnabled: !!gatewayData.isEnabled,
        isSandbox: !!gatewayData.isSandbox,
        label: parsedCredentials.label || 'Upay',
        description: parsedCredentials.description || 'Pay securely using Upay mobile wallet',
        credentials: {
          merchantId: parsedCredentials.merchantId || '',
          merchantKey: parsedCredentials.merchantKey || '',
          merchantName: parsedCredentials.merchantName || '',
          merchantCode: parsedCredentials.merchantCode || '',
          merchantCity: parsedCredentials.merchantCity || 'Dhaka',
          merchantMobile: parsedCredentials.merchantMobile || '',
          merchantCountryCode: parsedCredentials.merchantCountryCode || 'BD',
          merchantCategoryCode: parsedCredentials.merchantCategoryCode || '',
          transactionCurrencyCode: parsedCredentials.transactionCurrencyCode || 'BDT',
        },
      }
    })
  } catch (error) {
    console.error('Error fetching Upay gateway:', error)
    return NextResponse.json({ error: 'Failed to fetch gateway configuration' }, { status: 500 })
  }
}

/**
 * POST /api/admin/payment-gateways/upay
 * Update Upay gateway configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = data

    // Validate required credentials when enabling
    if (isEnabled) {
      if (!credentials?.merchantId || !credentials?.merchantKey) {
        return NextResponse.json({ 
          error: 'Merchant ID and Merchant Key are required when enabling the gateway' 
        }, { status: 400 })
      }
      if (!credentials?.merchantCode) {
        return NextResponse.json({ 
          error: 'Merchant Code is required when enabling the gateway' 
        }, { status: 400 })
      }
      if (!credentials?.merchantMobile) {
        return NextResponse.json({ 
          error: 'Merchant Mobile is required when enabling the gateway' 
        }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const credentialsJson = JSON.stringify({
      ...credentials,
      label: label || 'Upay',
      description: description || 'Pay securely using Upay mobile wallet',
    })

    // Check if gateway exists
    const existing = await db.$queryRaw`
      SELECT id FROM PaymentGateway WHERE name = 'upay'
    ` as Array<{ id: string }>

    if (existing && existing.length > 0) {
      // Update existing
      await db.$executeRaw`
        UPDATE PaymentGateway 
        SET isEnabled = ${isEnabled ? 1 : 0}, 
            isSandbox = ${isSandbox ? 1 : 0}, 
            credentials = ${credentialsJson},
            updatedAt = ${now}
        WHERE name = 'upay'
      `
    } else {
      // Create new
      await db.$executeRaw`
        INSERT INTO PaymentGateway (id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt)
        VALUES (${Date.now().toString(36)}, 'upay', ${isEnabled ? 1 : 0}, ${isSandbox ? 1 : 0}, ${credentialsJson}, ${now}, ${now})
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Upay gateway configuration saved successfully' 
    })
  } catch (error) {
    console.error('Error saving Upay gateway:', error)
    return NextResponse.json({ error: 'Failed to save gateway configuration' }, { status: 500 })
  }
}
