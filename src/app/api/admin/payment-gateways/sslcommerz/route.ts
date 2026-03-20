import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payment-gateways/sslcommerz
 * Get SSLCommerz gateway configuration
 */
export async function GET() {
  try {
    const gateway = await db.$queryRaw`
      SELECT id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt
      FROM PaymentGateway 
      WHERE name = 'sslcommerz'
    ` as Array<{ id: string; name: string; isEnabled: number; isSandbox: number; credentials: string | null; createdAt: string; updatedAt: string }>

    const gatewayData = gateway && gateway.length > 0 ? gateway[0] : null

    if (!gatewayData) {
      return NextResponse.json({
        gateway: {
          id: '',
          name: 'sslcommerz',
          isEnabled: false,
          isSandbox: true,
          label: 'SSLCommerz',
          description: 'Pay securely using SSLCommerz payment gateway',
          credentials: {
            storeId: '',
            storePassword: '',
            successUrl: '',
            failUrl: '',
            cancelUrl: '',
            ipnUrl: '',
            currency: 'BDT',
            productCategory: 'ticket',
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
        label: parsedCredentials.label || 'SSLCommerz',
        description: parsedCredentials.description || 'Pay securely using SSLCommerz payment gateway',
        credentials: {
          storeId: parsedCredentials.storeId || '',
          storePassword: '',
          successUrl: parsedCredentials.successUrl || '',
          failUrl: parsedCredentials.failUrl || '',
          cancelUrl: parsedCredentials.cancelUrl || '',
          ipnUrl: parsedCredentials.ipnUrl || '',
          currency: parsedCredentials.currency || 'BDT',
          productCategory: parsedCredentials.productCategory || 'ticket',
        },
      }
    })
  } catch (error) {
    console.error('Error fetching SSLCommerz gateway:', error)
    return NextResponse.json({ error: 'Failed to fetch gateway configuration' }, { status: 500 })
  }
}

/**
 * POST /api/admin/payment-gateways/sslcommerz
 * Update SSLCommerz gateway configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = data

    // Validate required credentials when enabling
    if (isEnabled) {
      if (!credentials?.storeId || !credentials?.storePassword) {
        return NextResponse.json({ 
          error: 'Store ID and Store Password are required when enabling the gateway' 
        }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const credentialsJson = JSON.stringify({
      storeId: credentials?.storeId || '',
      storePassword: credentials?.storePassword || '',
      successUrl: credentials?.successUrl || '',
      failUrl: credentials?.failUrl || '',
      cancelUrl: credentials?.cancelUrl || '',
      ipnUrl: credentials?.ipnUrl || '',
      currency: credentials?.currency || 'BDT',
      productCategory: credentials?.productCategory || 'ticket',
      label: label || 'SSLCommerz',
      description: description || 'Pay securely using SSLCommerz payment gateway',
    })

    // Check if gateway exists
    const existing = await db.$queryRaw`
      SELECT id FROM PaymentGateway WHERE name = 'sslcommerz'
    ` as Array<{ id: string }>

    if (existing && existing.length > 0) {
      // Update existing
      await db.$executeRaw`
        UPDATE PaymentGateway 
        SET isEnabled = ${isEnabled ? 1 : 0}, 
            isSandbox = ${isSandbox ? 1 : 0}, 
            credentials = ${credentialsJson},
            updatedAt = ${now}
        WHERE name = 'sslcommerz'
      `
    } else {
      // Create new
      await db.$executeRaw`
        INSERT INTO PaymentGateway (id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt)
        VALUES (${Date.now().toString(36)}, 'sslcommerz', ${isEnabled ? 1 : 0}, ${isSandbox ? 1 : 0}, ${credentialsJson}, ${now}, ${now})
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: 'SSLCommerz gateway configuration saved successfully' 
    })
  } catch (error) {
    console.error('Error saving SSLCommerz gateway:', error)
    return NextResponse.json({ error: 'Failed to save gateway configuration' }, { status: 500 })
  }
}
