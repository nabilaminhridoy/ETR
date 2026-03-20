import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Load PipraPay configuration
export async function GET() {
  try {
    const gateway = await db.paymentGateway.findUnique({
      where: { name: 'piprapay' }
    })

    if (!gateway) {
      return NextResponse.json({ 
        gateway: {
          isEnabled: false,
          isSandbox: true,
          label: 'PipraPay',
          description: 'Pay using multiple payment methods via PipraPay',
          credentials: {
            apiKey: '',
            baseUrl: '',
            redirectUrl: '',
            cancelUrl: '',
            webhookUrl: '',
            currency: 'BDT',
            returnType: 'POST',
          },
        }
      })
    }

    // Parse credentials
    let credentials = {}
    if (gateway.credentials) {
      try {
        credentials = JSON.parse(gateway.credentials)
      } catch (e) {
        credentials = {}
      }
    }

    return NextResponse.json({
      gateway: {
        id: gateway.id,
        name: gateway.name,
        isEnabled: gateway.isEnabled,
        isSandbox: gateway.isSandbox,
        label: (credentials as any).label || 'PipraPay',
        description: (credentials as any).description || 'Pay using multiple payment methods via PipraPay',
        credentials: {
          apiKey: (credentials as any).apiKey || '',
          baseUrl: (credentials as any).baseUrl || '',
          redirectUrl: (credentials as any).redirectUrl || '',
          cancelUrl: (credentials as any).cancelUrl || '',
          webhookUrl: (credentials as any).webhookUrl || '',
          currency: (credentials as any).currency || 'BDT',
          returnType: (credentials as any).returnType || 'POST',
        },
      }
    })
  } catch (error) {
    console.error('Error loading PipraPay config:', error)
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 })
  }
}

// POST - Save PipraPay configuration
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = data

    // Save to PaymentGateway table with label and description in credentials JSON
    const credentialsWithMeta = {
      ...credentials,
      label: label || 'PipraPay',
      description: description || 'Pay using multiple payment methods via PipraPay',
    }

    const gateway = await db.paymentGateway.upsert({
      where: { name: 'piprapay' },
      update: {
        isEnabled: isEnabled || false,
        isSandbox: isSandbox !== false,
        credentials: JSON.stringify(credentialsWithMeta),
      },
      create: {
        name: 'piprapay',
        isEnabled: isEnabled || false,
        isSandbox: isSandbox !== false,
        credentials: JSON.stringify(credentialsWithMeta),
      },
    })

    return NextResponse.json({
      success: true,
      gateway: {
        id: gateway.id,
        name: gateway.name,
        isEnabled: gateway.isEnabled,
        isSandbox: gateway.isSandbox,
      }
    })
  } catch (error) {
    console.error('Error saving PipraPay config:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
