import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Default SMS templates
const defaultTemplates = [
  // Admin templates
  {
    name: 'admin_new_ticket_listing',
    displayName: 'New Ticket Listing',
    category: 'admin',
    body: 'New ticket listed: {{routeName}} on {{travelDate}}. Price: {{sellingPrice}} BDT. Check admin panel.',
    variables: ['routeName', 'travelDate', 'sellingPrice'],
  },
  {
    name: 'admin_ticket_sold',
    displayName: 'Ticket Sold',
    category: 'admin',
    body: 'Ticket #{{ticketId}} sold to {{buyerName}} for {{amount}} BDT via {{paymentMethod}}.',
    variables: ['ticketId', 'buyerName', 'amount', 'paymentMethod'],
  },
  {
    name: 'admin_withdrawal_request',
    displayName: 'Withdrawal Request',
    category: 'admin',
    body: 'New withdrawal request from {{sellerName}}: {{amount}} BDT via {{method}}. Check admin panel.',
    variables: ['sellerName', 'amount', 'method'],
  },
  {
    name: 'admin_id_verification',
    displayName: 'ID Verification Request',
    category: 'admin',
    body: 'New ID verification request from {{userName}}. Document: {{documentType}}. Check admin panel.',
    variables: ['userName', 'documentType'],
  },
  // User templates
  {
    name: 'user_registration_otp',
    displayName: 'Registration OTP',
    category: 'user',
    body: 'Your verification code is: {{otpCode}}. Valid for {{expirationTime}}. - EidTicketResell',
    variables: ['otpCode', 'expirationTime'],
  },
  {
    name: 'user_password_reset_otp',
    displayName: 'Password Reset OTP',
    category: 'user',
    body: 'Your password reset code is: {{otpCode}}. Valid for {{expirationTime}}. - EidTicketResell',
    variables: ['otpCode', 'expirationTime'],
  },
  {
    name: 'user_welcome',
    displayName: 'Welcome Message',
    category: 'user',
    body: 'Welcome to EidTicketResell, {{userName}}! Your account is now active. Start buying or selling tickets today!',
    variables: ['userName'],
  },
  {
    name: 'user_ticket_approved',
    displayName: 'Ticket Approved',
    category: 'user',
    body: 'Your ticket #{{ticketId}} has been approved! {{routeName}} - {{travelDate}}. Price: {{sellingPrice}} BDT.',
    variables: ['ticketId', 'routeName', 'travelDate', 'sellingPrice'],
  },
  {
    name: 'user_ticket_rejected',
    displayName: 'Ticket Rejected',
    category: 'user',
    body: 'Your ticket #{{ticketId}} was rejected. Reason: {{rejectionReason}}. Contact support for help.',
    variables: ['ticketId', 'rejectionReason'],
  },
  {
    name: 'user_payment_success',
    displayName: 'Payment Success',
    category: 'user',
    body: 'Payment successful! {{amount}} BDT received for ticket #{{ticketId}}. Thank you for using EidTicketResell.',
    variables: ['amount', 'ticketId'],
  },
  {
    name: 'user_ticket_sold_notification',
    displayName: 'Ticket Sold Notification',
    category: 'user',
    body: 'Great news! Your ticket #{{ticketId}} sold for {{amount}} BDT. Earnings: {{earnings}} BDT credited to wallet.',
    variables: ['ticketId', 'amount', 'earnings'],
  },
  {
    name: 'user_payout_processed',
    displayName: 'Payout Processed',
    category: 'user',
    body: 'Your payout of {{amount}} BDT has been processed to {{accountDetails}}. Txn: {{transactionRef}}.',
    variables: ['amount', 'accountDetails', 'transactionRef'],
  },
  {
    name: 'user_travel_reminder',
    displayName: 'Travel Reminder',
    category: 'user',
    body: 'Reminder: Your trip {{routeName}} is tomorrow at {{departureTime}}. Seat: {{seatNumber}}. Have a safe journey!',
    variables: ['routeName', 'departureTime', 'seatNumber'],
  },
  {
    name: 'user_id_verification_approved',
    displayName: 'ID Verification Approved',
    category: 'user',
    body: 'Good news! Your {{documentType}} verification has been approved. You can now access all features.',
    variables: ['documentType'],
  },
  {
    name: 'user_id_verification_rejected',
    displayName: 'ID Verification Rejected',
    category: 'user',
    body: 'Your {{documentType}} verification was rejected. Reason: {{rejectionReason}}. Please resubmit.',
    variables: ['documentType', 'rejectionReason'],
  },
]

/**
 * GET /api/admin/sms-templates
 * Get all SMS templates
 */
export async function GET() {
  try {
    // Check if templates exist
    const existingTemplates = await db.sMSTemplate.findMany()
    
    // If no templates exist, create defaults
    if (existingTemplates.length === 0) {
      for (const template of defaultTemplates) {
        await db.sMSTemplate.create({
          data: {
            name: template.name,
            displayName: template.displayName,
            category: template.category,
            body: template.body,
            variables: JSON.stringify(template.variables),
            isActive: true,
          },
        })
      }
    }

    // Fetch all templates
    const templates = await db.sMSTemplate.findMany({
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching SMS templates:', error)
    return NextResponse.json({ error: 'Failed to fetch SMS templates' }, { status: 500 })
  }
}

/**
 * POST /api/admin/sms-templates
 * Update SMS template
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, displayName, category, body, variables, isActive } = data

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    // Check if template exists
    const existing = await db.sMSTemplate.findUnique({
      where: { name },
    })

    if (existing) {
      // Build update data
      const updateData: Record<string, unknown> = {}
      
      if (displayName !== undefined) updateData.displayName = displayName
      if (category !== undefined) updateData.category = category
      if (body !== undefined) updateData.body = body
      if (variables !== undefined) updateData.variables = variables ? JSON.stringify(variables) : null
      if (isActive !== undefined) updateData.isActive = isActive

      // Update existing template
      const updated = await db.sMSTemplate.update({
        where: { name },
        data: updateData,
      })
      return NextResponse.json({ success: true, template: updated })
    } else {
      // Create new template
      const created = await db.sMSTemplate.create({
        data: {
          name,
          displayName: displayName || name,
          category: category || 'user',
          body: body || '',
          variables: variables ? JSON.stringify(variables) : null,
          isActive: isActive !== undefined ? isActive : true,
        },
      })
      return NextResponse.json({ success: true, template: created })
    }
  } catch (error) {
    console.error('Error saving SMS template:', error)
    return NextResponse.json({ error: 'Failed to save SMS template' }, { status: 500 })
  }
}
