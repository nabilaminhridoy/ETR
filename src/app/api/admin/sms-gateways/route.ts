import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/sms-gateways
 * Get all SMS gateway configurations
 */
export async function GET() {
  try {
    const gateways = ['alphasms', 'bulksmsbd', 'twilio']
    const results: Record<string, any> = {}

    for (const gateway of gateways) {
      const result = await db.$queryRaw`
        SELECT id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt
        FROM SMSGateway 
        WHERE name = ${gateway}
      ` as Array<{ id: string; name: string; isEnabled: number; isSandbox: number; credentials: string | null; createdAt: string; updatedAt: string }>

      const gatewayData = result && result.length > 0 ? result[0] : null

      if (!gatewayData) {
        results[gateway] = {
          id: '',
          name: gateway,
          isEnabled: false,
          isSandbox: true,
          credentials: getDefaultCredentials(gateway),
        }
      } else {
        const credentialsRaw = gatewayData.credentials || '{}'
        const parsedCredentials = typeof credentialsRaw === 'string' ? JSON.parse(credentialsRaw) : credentialsRaw
        
        results[gateway] = {
          id: gatewayData.id,
          name: gatewayData.name,
          isEnabled: !!gatewayData.isEnabled,
          isSandbox: !!gatewayData.isSandbox,
          credentials: {
            ...getDefaultCredentials(gateway),
            ...parsedCredentials,
          },
        }
      }
    }

    return NextResponse.json({ gateways: results })
  } catch (error) {
    console.error('Error fetching SMS gateways:', error)
    return NextResponse.json({ error: 'Failed to fetch SMS gateway configurations' }, { status: 500 })
  }
}

/**
 * POST /api/admin/sms-gateways
 * Update SMS gateway configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { gateway, isEnabled, isSandbox, credentials } = data

    if (!gateway || !['alphasms', 'bulksmsbd', 'twilio'].includes(gateway)) {
      return NextResponse.json({ error: 'Invalid gateway name' }, { status: 400 })
    }

    // Validate required credentials when enabling
    if (isEnabled) {
      if (gateway === 'alphasms' && (!credentials?.apiKey)) {
        return NextResponse.json({ error: 'API Key is required for Alpha SMS' }, { status: 400 })
      }
      if (gateway === 'bulksmsbd' && (!credentials?.apiKey)) {
        return NextResponse.json({ error: 'API Key is required for BulkSMSBD' }, { status: 400 })
      }
      if (gateway === 'twilio' && (!credentials?.accountSid || !credentials?.authToken || !credentials?.fromNumber)) {
        return NextResponse.json({ error: 'Account SID, Auth Token, and From Number are required for Twilio' }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const credentialsJson = JSON.stringify(credentials || {})

    // Check if gateway exists
    const existing = await db.$queryRaw`
      SELECT id FROM SMSGateway WHERE name = ${gateway}
    ` as Array<{ id: string }>

    if (existing && existing.length > 0) {
      // Update existing
      await db.$executeRaw`
        UPDATE SMSGateway 
        SET isEnabled = ${isEnabled ? 1 : 0}, 
            isSandbox = ${isSandbox ? 1 : 0}, 
            credentials = ${credentialsJson},
            updatedAt = ${now}
        WHERE name = ${gateway}
      `
    } else {
      // Create new
      await db.$executeRaw`
        INSERT INTO SMSGateway (id, name, isEnabled, isSandbox, credentials, createdAt, updatedAt)
        VALUES (${Date.now().toString(36)}, ${gateway}, ${isEnabled ? 1 : 0}, ${isSandbox ? 1 : 0}, ${credentialsJson}, ${now}, ${now})
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: `${gateway} gateway configuration saved successfully` 
    })
  } catch (error) {
    console.error('Error saving SMS gateway:', error)
    return NextResponse.json({ error: 'Failed to save gateway configuration' }, { status: 500 })
  }
}

function getDefaultCredentials(gateway: string): Record<string, string> {
  switch (gateway) {
    case 'alphasms':
      return {
        apiKey: '',
        senderId: '8809617613541',
        baseUrl: 'https://api.alphasms.net/index.php?app=ws',
        label: 'Alpha SMS',
      }
    case 'bulksmsbd':
      return {
        apiKey: '',
        senderId: '8809617613541',
        baseUrl: 'https://bulksmsbd.net/api',
        label: 'BulkSMSBD',
      }
    case 'twilio':
      return {
        accountSid: '',
        authToken: '',
        fromNumber: '',
        baseUrl: 'https://api.twilio.com/2010-04-01/Accounts',
        label: 'Twilio',
      }
    default:
      return {}
  }
}
