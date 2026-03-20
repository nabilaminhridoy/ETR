import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateRSAKeyPair } from '@/lib/payment/nagad/service'

// GET - Fetch Nagad payment gateway settings
export async function GET() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: 'payment_nagad' },
    })

    if (!setting) {
      return NextResponse.json({
        isEnabled: false,
        isSandbox: true,
        label: 'Nagad',
        description: 'Pay securely using Nagad mobile wallet',
        credentials: {
          merchantId: '',
          merchantPrivateKey: '',
          merchantPublicKey: '',
          nagadPublicKey: '',
          apiVersion: 'v-0.2.0',
        },
      })
    }

    const data = JSON.parse(setting.value)

    return NextResponse.json({
      isEnabled: data.isEnabled ?? false,
      isSandbox: data.isSandbox ?? true,
      label: data.label || 'Nagad',
      description: data.description || 'Pay securely using Nagad mobile wallet',
      credentials: {
        merchantId: data.merchantId || '',
        merchantPrivateKey: data.merchantPrivateKey || '',
        merchantPublicKey: data.merchantPublicKey || '',
        nagadPublicKey: data.nagadPublicKey || '',
        apiVersion: data.apiVersion || 'v-0.2.0',
      },
    })
  } catch (error) {
    console.error('Error fetching Nagad settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Nagad settings' },
      { status: 500 }
    )
  }
}

// POST - Save Nagad payment gateway settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isEnabled, isSandbox, label, description, credentials } = body

    // Validate required fields if enabled
    if (isEnabled) {
      if (!credentials?.merchantId) {
        return NextResponse.json(
          { error: 'Merchant ID is required' },
          { status: 400 }
        )
      }
      if (!credentials?.merchantPrivateKey) {
        return NextResponse.json(
          { error: 'Merchant Private Key is required' },
          { status: 400 }
        )
      }
      if (!credentials?.merchantPublicKey) {
        return NextResponse.json(
          { error: 'Merchant Public Key is required' },
          { status: 400 }
        )
      }
      if (!credentials?.nagadPublicKey) {
        return NextResponse.json(
          { error: 'Nagad Public Key is required' },
          { status: 400 }
        )
      }
    }

    const value = JSON.stringify({
      isEnabled: isEnabled ?? false,
      isSandbox: isSandbox ?? true,
      label: label || 'Nagad',
      description: description || 'Pay securely using Nagad mobile wallet',
      merchantId: credentials?.merchantId || '',
      merchantPrivateKey: credentials?.merchantPrivateKey || '',
      merchantPublicKey: credentials?.merchantPublicKey || '',
      nagadPublicKey: credentials?.nagadPublicKey || '',
      apiVersion: credentials?.apiVersion || 'v-0.2.0',
      updatedAt: new Date().toISOString(),
    })

    await db.systemSetting.upsert({
      where: { key: 'payment_nagad' },
      update: { value },
      create: { key: 'payment_nagad', value },
    })

    return NextResponse.json({
      success: true,
      message: 'Nagad payment gateway settings saved successfully',
    })
  } catch (error) {
    console.error('Error saving Nagad settings:', error)
    return NextResponse.json(
      { error: 'Failed to save Nagad settings' },
      { status: 500 }
    )
  }
}

// PUT - Generate new RSA key pair for merchant
export async function PUT(request: NextRequest) {
  try {
    const { publicKey, privateKey } = generateRSAKeyPair()

    return NextResponse.json({
      success: true,
      publicKey,
      privateKey,
      message: 'RSA key pair generated successfully. Save these keys securely.',
    })
  } catch (error) {
    console.error('Error generating RSA keys:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSA keys' },
      { status: 500 }
    )
  }
}
