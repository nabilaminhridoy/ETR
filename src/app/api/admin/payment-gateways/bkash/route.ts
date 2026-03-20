import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payment-gateways/bkash
 * Get bKash gateway configuration
 */
export async function GET() {
  try {
    const gateway = await db.$queryRaw`
      SELECT id, name, isEnabled, isSandbox, createdAt, updatedAt
      FROM PaymentGateway 
      WHERE name = 'bkash'
    `
    
    const gatewayData = Array.isArray(gateway) && gateway.length > 0 ? gateway[0] : null

    if (!gatewayData) {
      // Create default gateway if doesn't exist
      const now = new Date().toISOString()
      await db.$executeRaw`
        INSERT INTO PaymentGateway (id, name, isEnabled, isSandbox, createdAt, updatedAt)
        VALUES (${Date.now().toString(36)}, 'bkash', 0, 1, ${now}, ${now})
      `
      
      return NextResponse.json({
        gateway: {
          id: Date.now().toString(36),
          name: 'bkash',
          isEnabled: false,
          isSandbox: true,
          label: 'bKash',
          description: 'Pay securely using bKash mobile wallet',
          credentials: {
            appKey: '',
            appSecret: '',
            username: '',
            password: '',
          },
        }
      })
    }

    // Get credentials separately (they're stored as JSON)
    const fullGateway = await db.$queryRaw`
      SELECT credentials FROM PaymentGateway WHERE name = 'bkash'
    `
    
    const credentialsRaw = Array.isArray(fullGateway) && fullGateway.length > 0 
      ? (fullGateway[0] as any).credentials || '{}' 
      : '{}'

    const parsedCredentials = typeof credentialsRaw === 'string' ? JSON.parse(credentialsRaw) : credentialsRaw

    return NextResponse.json({
      gateway: {
        ...gatewayData,
        label: parsedCredentials.label || 'bKash',
        description: parsedCredentials.description || 'Pay securely using bKash mobile wallet',
        credentials: {
          appKey: parsedCredentials.appKey || '',
          appSecret: parsedCredentials.appSecret || '',
          username: parsedCredentials.username || '',
          password: parsedCredentials.password || '',
        },
      }
    })
  } catch (error) {
    console.error('Error fetching bKash gateway:', error)
    return NextResponse.json({ error: 'Failed to fetch gateway configuration' }, { status: 500 })
  }
}

/**
 * POST /api/admin/payment-gateways/bkash
 * Update bKash gateway configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = data

    // Validate required credentials when enabling
    if (isEnabled) {
      if (!credentials?.appKey || !credentials?.appSecret || !credentials?.username || !credentials?.password) {
        return NextResponse.json({ 
          error: 'All credentials (App Key, App Secret, Username, Password) are required when enabling the gateway' 
        }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const credentialsJson = JSON.stringify({
      ...credentials,
      label: label || 'bKash',
      description: description || 'Pay securely using bKash mobile wallet',
    })

    // Check if gateway exists
    const existing = await db.$queryRaw`
      SELECT id FROM PaymentGateway WHERE name = 'bkash'
    `

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      await db.$executeRaw`
        UPDATE PaymentGateway 
        SET isEnabled = ${isEnabled ? 1 : 0}, 
            isSandbox = ${isSandbox ? 1 : 0}, 
            credentials = ${credentialsJson},
            updatedAt = ${now}
        WHERE name = 'bkash'
      `
    } else {
      // Create new
      await db.$executeRaw`
        INSERT INTO PaymentGateway (id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt)
        VALUES (${Date.now().toString(36)}, 'bkash', ${isEnabled ? 1 : 0}, ${isSandbox ? 1 : 0}, ${credentialsJson}, ${now}, ${now})
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: 'bKash gateway configuration saved successfully' 
    })
  } catch (error) {
    console.error('Error saving bKash gateway:', error)
    return NextResponse.json({ error: 'Failed to save gateway configuration' }, { status: 500 })
  }
}
