import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - Load UddoktaPay configuration
export async function GET() {
  try {
    const gateway = await db.paymentGateway.findUnique({
      where: { name: 'uddoktapay' }
    })

    if (!gateway) {
      return NextResponse.json({ 
        gateway: {
          isEnabled: false,
          isSandbox: true,
          label: 'UddoktaPay',
          description: 'Pay using multiple payment methods via UddoktaPay',
          credentials: {
            apiKey: '',
            baseUrl: '',
            apiType: 'checkout-v2',
            redirectUrl: '',
            cancelUrl: '',
            webhookUrl: '',
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
        label: (credentials as any).label || 'UddoktaPay',
        description: (credentials as any).description || 'Pay using multiple payment methods via UddoktaPay',
        credentials: {
          apiKey: (credentials as any).apiKey || '',
          baseUrl: (credentials as any).baseUrl || '',
          apiType: (credentials as any).apiType || 'checkout-v2',
          redirectUrl: (credentials as any).redirectUrl || '',
          cancelUrl: (credentials as any).cancelUrl || '',
          webhookUrl: (credentials as any).webhookUrl || '',
        },
      }
    })
  } catch (error) {
    console.error('Error loading UddoktaPay config:', error)
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 })
  }
}

// POST - Save UddoktaPay configuration
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = data

    // Save to PaymentGateway table with label and description in credentials JSON
    const credentialsWithMeta = {
      ...credentials,
      label: label || 'UddoktaPay',
      description: description || 'Pay using multiple payment methods via UddoktaPay',
    }

    const gateway = await db.paymentGateway.upsert({
      where: { name: 'uddoktapay' },
      update: {
        isEnabled: isEnabled || false,
        isSandbox: isSandbox !== false,
        credentials: JSON.stringify(credentialsWithMeta),
      },
      create: {
        name: 'uddoktapay',
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
    console.error('Error saving UddoktaPay config:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
