import { NextResponse } from 'next/server'

export async function GET() {
  // Mock wallet data for demo
  return NextResponse.json({
    wallet: {
      availableBalance: 15000,
      pendingBalance: 2000,
    },
    accounts: [
      {
        id: '1',
        accountType: 'BKASH',
        accountName: 'John Doe',
        accountNumber: '01712345678',
        isActive: true,
      },
    ],
    withdrawals: [],
  })
}
