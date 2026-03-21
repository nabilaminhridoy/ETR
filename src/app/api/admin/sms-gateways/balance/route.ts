import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/sms-gateways/balance
 * Check SMS gateway balance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gateway = searchParams.get('gateway')
    const apiKey = searchParams.get('apiKey')

    if (!gateway || !apiKey) {
      return NextResponse.json({ error: 'Gateway and API Key are required' }, { status: 400 })
    }

    if (gateway === 'alphasms') {
      // Alpha SMS (sms.net.bd) balance check
      const response = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${apiKey}`)
      const data = await response.json()

      if (data.error === 0) {
        return NextResponse.json({ 
          success: true,
          balance: data.data?.balance || '0.0000' 
        })
      } else {
        return NextResponse.json({ 
          error: getAlphaSMSError(data.error) || 'Failed to retrieve balance' 
        }, { status: 400 })
      }
    }

    if (gateway === 'bulksmsbd') {
      // BulkSMSBD balance check
      const response = await fetch(`http://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`)
      const data = await response.json()

      if (data.response_code === 202 || data.response_code === '202') {
        return NextResponse.json({ 
          success: true,
          balance: data.balance || '0' 
        })
      } else {
        return NextResponse.json({ 
          error: getBulkSMSBDError(data.response_code) || data.error_message || 'Failed to retrieve balance' 
        }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'Balance check not supported for this gateway' }, { status: 400 })
  } catch (error) {
    console.error('Error checking balance:', error)
    return NextResponse.json({ error: 'Failed to check balance' }, { status: 500 })
  }
}

function getAlphaSMSError(code: number): string {
  const errors: Record<number, string> = {
    400: 'The request was rejected due to missing or invalid parameter',
    403: 'You don\'t have permissions to perform the request',
    404: 'The requested resource not found',
    405: 'Authorization required - Invalid API Key',
    409: 'Unknown error occurred on Server end',
    410: 'Account expired',
    411: 'Reseller Account expired or suspended',
    417: 'Insufficient balance',
    421: 'You can only send SMS to your registered phone number until first balance recharge',
  }
  return errors[code] || `Error code: ${code}`
}

function getBulkSMSBDError(code: number): string {
  const errors: Record<number, string> = {
    1001: 'Invalid Number',
    1002: 'Sender ID not correct/sender id is disabled',
    1003: 'Please Required all fields/Contact Your System Administrator',
    1005: 'Internal Error',
    1006: 'Balance Validity Not Available',
    1007: 'Balance Insufficient',
    1011: 'User Id not found',
    1031: 'Your Account Not Verified, Please Contact Administrator',
    1032: 'IP Not whitelisted',
  }
  return errors[code] || `Error code: ${code}`
}
