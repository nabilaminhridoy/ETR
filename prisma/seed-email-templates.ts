import { db } from '@/lib/db'

// Admin email templates
const adminTemplates = [
  {
    name: 'admin_id_verification_request',
    displayName: 'ID Verification Request',
    category: 'admin',
    subject: 'New ID Verification Request - Action Required',
    title: 'New ID Verification Request',
    body: `<p>A new ID verification request has been submitted and requires your review.</p>
    
<h3>User Details:</h3>
<ul>
  <li><strong>Name:</strong> {{userName}}</li>
  <li><strong>Email:</strong> {{userEmail}}</li>
  <li><strong>Document Type:</strong> {{documentType}}</li>
  <li><strong>Submitted On:</strong> {{submittedDate}}</li>
</ul>

<p>Please review the submitted documents and take appropriate action.</p>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "userEmail", "documentType", "submittedDate", "year"]',
  },
  {
    name: 'admin_new_ticket_listing',
    displayName: 'New Ticket Listing Submitted',
    category: 'admin',
    subject: 'New Ticket Listing Pending Review',
    title: 'New Ticket Listing Submitted',
    body: `<p>A new ticket has been listed and is pending review.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> {{ticketId}}</li>
  <li><strong>Seller:</strong> {{sellerName}} ({{sellerEmail}})</li>
  <li><strong>Transport Type:</strong> {{transportType}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
  <li><strong>Selling Price:</strong> ৳{{sellingPrice}}</li>
</ul>

<p>Please review and approve or reject this listing.</p>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["ticketId", "sellerName", "sellerEmail", "transportType", "fromCity", "toCity", "travelDate", "sellingPrice", "year"]',
  },
  {
    name: 'admin_ticket_sold',
    displayName: 'Ticket Sold Notification',
    category: 'admin',
    subject: 'Ticket Sold - Transaction Completed',
    title: 'Ticket Sold Successfully',
    body: `<p>A ticket has been successfully sold on the platform.</p>

<h3>Transaction Details:</h3>
<ul>
  <li><strong>Transaction ID:</strong> {{transactionId}}</li>
  <li><strong>Ticket:</strong> {{ticketDetails}}</li>
  <li><strong>Buyer:</strong> {{buyerName}} ({{buyerEmail}})</li>
  <li><strong>Seller:</strong> {{sellerName}} ({{sellerEmail}})</li>
  <li><strong>Ticket Price:</strong> ৳{{ticketPrice}}</li>
  <li><strong>Platform Fee (1%):</strong> ৳{{platformFee}}</li>
  <li><strong>Total Amount:</strong> ৳{{totalAmount}}</li>
</ul>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["transactionId", "ticketDetails", "buyerName", "buyerEmail", "sellerName", "sellerEmail", "ticketPrice", "platformFee", "totalAmount", "year"]',
  },
  {
    name: 'admin_payment_received',
    displayName: 'Payment Received',
    category: 'admin',
    subject: 'Payment Received - {{transactionId}}',
    title: 'Payment Received Successfully',
    body: `<p>A payment has been received on the platform.</p>

<h3>Payment Details:</h3>
<ul>
  <li><strong>Transaction ID:</strong> {{transactionId}}</li>
  <li><strong>Amount:</strong> ৳{{amount}}</li>
  <li><strong>Payment Method:</strong> {{paymentMethod}}</li>
  <li><strong>Buyer:</strong> {{buyerName}}</li>
  <li><strong>Date:</strong> {{paymentDate}}</li>
</ul>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["transactionId", "amount", "paymentMethod", "buyerName", "paymentDate", "year"]',
  },
  {
    name: 'admin_seller_withdrawal_request',
    displayName: 'Seller Withdrawal Request',
    category: 'admin',
    subject: 'New Withdrawal Request - {{sellerName}}',
    title: 'Withdrawal Request Received',
    body: `<p>A seller has submitted a withdrawal request.</p>

<h3>Request Details:</h3>
<ul>
  <li><strong>Seller:</strong> {{sellerName}} ({{sellerEmail}})</li>
  <li><strong>Amount:</strong> ৳{{amount}}</li>
  <li><strong>Withdrawal Method:</strong> {{withdrawalMethod}}</li>
  <li><strong>Account Details:</strong> {{accountDetails}}</li>
  <li><strong>Request Date:</strong> {{requestDate}}</li>
</ul>

<p>Please process this withdrawal request.</p>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["sellerName", "sellerEmail", "amount", "withdrawalMethod", "accountDetails", "requestDate", "year"]',
  },
  {
    name: 'admin_seller_payout_processed',
    displayName: 'Seller Payout Processed',
    category: 'admin',
    subject: 'Payout Processed - {{sellerName}}',
    title: 'Payout Processed Successfully',
    body: `<p>A seller payout has been processed.</p>

<h3>Payout Details:</h3>
<ul>
  <li><strong>Seller:</strong> {{sellerName}}</li>
  <li><strong>Amount:</strong> ৳{{amount}}</li>
  <li><strong>Transaction Reference:</strong> {{transactionRef}}</li>
  <li><strong>Processed Date:</strong> {{processedDate}}</li>
</ul>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["sellerName", "amount", "transactionRef", "processedDate", "year"]',
  },
  {
    name: 'admin_ticket_report_submitted',
    displayName: 'Ticket Report Submitted',
    category: 'admin',
    subject: 'New Ticket Report - Review Required',
    title: 'Ticket Report Submitted',
    body: `<p>A ticket has been reported by a user.</p>

<h3>Report Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> {{ticketId}}</li>
  <li><strong>Reporter:</strong> {{reporterName}} ({{reporterEmail}})</li>
  <li><strong>Reason:</strong> {{reportReason}}</li>
  <li><strong>Description:</strong> {{reportDescription}}</li>
  <li><strong>Reported On:</strong> {{reportedDate}}</li>
</ul>

<p>Please review this report and take appropriate action.</p>`,
    footerText: 'This is an automated notification from EidTicketResell Admin Panel.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["ticketId", "reporterName", "reporterEmail", "reportReason", "reportDescription", "reportedDate", "year"]',
  },
]

// User email templates
const userTemplates = [
  {
    name: 'user_registration_verification',
    displayName: 'Email Verification OTP',
    category: 'user',
    subject: 'Verify Your Email - EidTicketResell',
    title: 'Welcome to EidTicketResell!',
    body: `<p>Hello {{userName}},</p>

<p>Thank you for registering with EidTicketResell. Please use the following verification code to verify your email address:</p>

<div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
  <p style="margin: 0; font-size: 14px; color: #64748b;">Your Verification Code</p>
  <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">{{otpCode}}</p>
</div>

<p style="text-align: center; margin-top: 20px;">This code will expire in <strong>{{expirationTime}}</strong>.</p>

<p style="margin-top: 30px;">If you did not request this code, please ignore this email.</p>`,
    footerText: 'Thank you for choosing EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "otpCode", "expirationTime", "year"]',
  },
  {
    name: 'user_password_reset',
    displayName: 'Password Reset OTP',
    category: 'user',
    subject: 'Reset Your Password - EidTicketResell',
    title: 'Password Reset Request',
    body: `<p>Hello {{userName}},</p>

<p>We received a request to reset your password. Please use the following verification code:</p>

<div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
  <p style="margin: 0; font-size: 14px; color: #64748b;">Your Verification Code</p>
  <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">{{otpCode}}</p>
</div>

<p style="text-align: center; margin-top: 20px;">This code will expire in <strong>{{expirationTime}}</strong>.</p>

<p style="margin-top: 30px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>`,
    footerText: 'Thank you for using EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "otpCode", "expirationTime", "year"]',
  },
  {
    name: 'user_welcome',
    displayName: 'Welcome / New Account Created',
    category: 'user',
    subject: 'Welcome to EidTicketResell!',
    title: 'Welcome to EidTicketResell!',
    body: `<p>Hello {{userName}},</p>

<p>Welcome to EidTicketResell - Bangladesh's most trusted platform for buying and selling Eid travel tickets!</p>

<h3>Here's what you can do:</h3>
<ul>
  <li><strong>Buy Tickets:</strong> Find and purchase tickets from verified sellers</li>
  <li><strong>Sell Tickets:</strong> List your unused tickets safely</li>
  <li><strong>Secure Transactions:</strong> All payments are protected</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{dashboardLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
</div>`,
    footerText: 'Questions? Our support team is here to help.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "dashboardLink", "year"]',
  },
  {
    name: 'user_id_verification_approved',
    displayName: 'ID Verification Approved',
    category: 'user',
    subject: 'Your ID Verification is Approved!',
    title: 'ID Verification Approved',
    body: `<p>Hello {{userName}},</p>

<p>Great news! Your ID verification has been approved. You are now a verified seller on EidTicketResell.</p>

<h3>Benefits of being verified:</h3>
<ul>
  <li>✓ Buyers trust verified sellers more</li>
  <li>✓ Your listings get priority visibility</li>
  <li>✓ Access to all platform features</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{dashboardLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Selling Now</a>
</div>`,
    footerText: 'Thank you for being part of our trusted community!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "dashboardLink", "year"]',
  },
  {
    name: 'user_id_verification_rejected',
    displayName: 'ID Verification Rejected',
    category: 'user',
    subject: 'ID Verification Update - Action Required',
    title: 'ID Verification Rejected',
    body: `<p>Hello {{userName}},</p>

<p>We're sorry, but your ID verification could not be approved at this time.</p>

<h3>Reason:</h3>
<p>{{rejectionReason}}</p>

<h3>What to do next:</h3>
<p>You can resubmit your verification with corrected documents. Please ensure:</p>
<ul>
  <li>Document images are clear and readable</li>
  <li>All information matches your account details</li>
  <li>Document is not expired</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{verificationLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Resubmit Verification</a>
</div>`,
    footerText: 'Need help? Contact our support team.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "rejectionReason", "verificationLink", "year"]',
  },
  {
    name: 'user_ticket_pending_review',
    displayName: 'Ticket Listing Pending Review',
    category: 'user',
    subject: 'Your Ticket is Under Review',
    title: 'Ticket Listing Submitted',
    body: `<p>Hello {{userName}},</p>

<p>Thank you for listing your ticket on EidTicketResell. Your listing is now under review.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Transport:</strong> {{transportType}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
  <li><strong>Selling Price:</strong> ৳{{sellingPrice}}</li>
</ul>

<p>Our team will review your listing shortly. You'll be notified once it's approved.</p>`,
    footerText: 'This usually takes 1-2 business hours.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transportType", "fromCity", "toCity", "travelDate", "sellingPrice", "year"]',
  },
  {
    name: 'user_ticket_approved',
    displayName: 'Ticket Listing Approved',
    category: 'user',
    subject: 'Your Ticket is Now Live!',
    title: 'Ticket Listing Approved',
    body: `<p>Hello {{userName}},</p>

<p>Great news! Your ticket listing has been approved and is now live on EidTicketResell.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Transport:</strong> {{transportType}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
  <li><strong>Selling Price:</strong> ৳{{sellingPrice}}</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{listingLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Listing</a>
</div>`,
    footerText: 'Good luck with your sale!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transportType", "fromCity", "toCity", "travelDate", "sellingPrice", "listingLink", "year"]',
  },
  {
    name: 'user_payment_confirmation',
    displayName: 'Payment Confirmation',
    category: 'user',
    subject: 'Payment Confirmed - {{transactionId}}',
    title: 'Payment Confirmation',
    body: `<p>Hello {{userName}},</p>

<p>Your payment has been successfully processed.</p>

<h3>Payment Details:</h3>
<ul>
  <li><strong>Transaction ID:</strong> {{transactionId}}</li>
  <li><strong>Amount:</strong> ৳{{amount}}</li>
  <li><strong>Payment Method:</strong> {{paymentMethod}}</li>
  <li><strong>Date:</strong> {{paymentDate}}</li>
</ul>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Transport:</strong> {{transportType}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ticketLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Ticket Details</a>
</div>`,
    footerText: 'Thank you for using EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transactionId", "amount", "paymentMethod", "paymentDate", "transportType", "fromCity", "toCity", "travelDate", "ticketLink", "year"]',
  },
  {
    name: 'user_ticket_sold_notification',
    displayName: 'Ticket Sold Notification (Seller)',
    category: 'user',
    subject: 'Your Ticket Has Been Sold!',
    title: '🎉 Congratulations! Your Ticket Sold!',
    body: `<p>Hello {{userName}},</p>

<p>Great news! Your ticket has been sold!</p>

<h3>Sale Details:</h3>
<ul>
  <li><strong>Ticket:</strong> {{transportType}} - {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
  <li><strong>Selling Price:</strong> ৳{{sellingPrice}}</li>
  <li><strong>Platform Fee:</strong> ৳{{platformFee}}</li>
  <li><strong>Your Earnings:</strong> ৳{{earnings}}</li>
</ul>

<h3>Buyer Information:</h3>
<ul>
  <li><strong>Name:</strong> {{buyerName}}</li>
  <li><strong>Contact:</strong> {{buyerPhone}}</li>
</ul>

<p>Your earnings have been added to your wallet balance.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{walletLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Wallet</a>
</div>`,
    footerText: 'Thank you for selling on EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transportType", "fromCity", "toCity", "travelDate", "sellingPrice", "platformFee", "earnings", "buyerName", "buyerPhone", "walletLink", "year"]',
  },
  {
    name: 'user_payout_confirmation',
    displayName: 'Seller Payout Confirmation',
    category: 'user',
    subject: 'Payout Processed - ৳{{amount}}',
    title: 'Payout Confirmation',
    body: `<p>Hello {{userName}},</p>

<p>Your payout request has been processed successfully.</p>

<h3>Payout Details:</h3>
<ul>
  <li><strong>Amount:</strong> ৳{{amount}}</li>
  <li><strong>Method:</strong> {{payoutMethod}}</li>
  <li><strong>Transaction Reference:</strong> {{transactionRef}}</li>
  <li><strong>Processed Date:</strong> {{processedDate}}</li>
</ul>

<p>The funds should reflect in your account within 1-3 business days.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{walletLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Wallet</a>
</div>`,
    footerText: 'Thank you for using EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "amount", "payoutMethod", "transactionRef", "processedDate", "walletLink", "year"]',
  },
  {
    name: 'user_travel_reminder',
    displayName: 'Travel Reminder',
    category: 'user',
    subject: 'Travel Reminder - Your trip is tomorrow!',
    title: 'Travel Reminder',
    body: `<p>Hello {{userName}},</p>

<p>This is a friendly reminder that your trip is coming up!</p>

<h3>Trip Details:</h3>
<ul>
  <li><strong>Transport:</strong> {{transportType}}</li>
  <li><strong>Company:</strong> {{companyName}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Date:</strong> {{travelDate}}</li>
  <li><strong>Departure Time:</strong> {{departureTime}}</li>
  <li><strong>Seat:</strong> {{seatNumber}}</li>
</ul>

<p>Please make sure to:</p>
<ul>
  <li>Arrive at the departure point at least 30 minutes early</li>
  <li>Carry your ticket and valid ID</li>
  <li>Keep your PNR number handy: {{pnrNumber}}</li>
</ul>`,
    footerText: 'Have a safe journey!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transportType", "companyName", "fromCity", "toCity", "travelDate", "departureTime", "seatNumber", "pnrNumber", "year"]',
  },
  {
    name: 'user_ticket_expiring',
    displayName: 'Ticket Expiring Soon',
    category: 'user',
    subject: 'Your Ticket Listing Expires Soon',
    title: 'Ticket Expiring Soon',
    body: `<p>Hello {{userName}},</p>

<p>Your ticket listing will expire soon. If not sold, consider adjusting the price to attract more buyers.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Transport:</strong> {{transportType}}</li>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Travel Date:</strong> {{travelDate}}</li>
  <li><strong>Current Price:</strong> ৳{{sellingPrice}}</li>
  <li><strong>Days Until Travel:</strong> {{daysRemaining}}</li>
</ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{editLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Edit Listing</a>
</div>`,
    footerText: 'Good luck with your sale!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "transportType", "fromCity", "toCity", "travelDate", "sellingPrice", "daysRemaining", "editLink", "year"]',
  },
  {
    name: 'user_price_drop_alert',
    displayName: 'Ticket Price Drop Alert',
    category: 'user',
    subject: 'Price Drop Alert - {{routeName}}',
    title: 'Great News! Price Drop on Your Watched Route',
    body: `<p>Hello {{userName}},</p>

<p>Good news! We found tickets on your watched route at a lower price!</p>

<h3>Price Drop Details:</h3>
<ul>
  <li><strong>Route:</strong> {{fromCity}} → {{toCity}}</li>
  <li><strong>Transport Type:</strong> {{transportType}}</li>
  <li><strong>New Price:</strong> ৳{{newPrice}}</li>
  <li><strong>Previous Price:</strong> ৳{{oldPrice}}</li>
  <li><strong>You Save:</strong> ৳{{savings}}</li>
</ul>

<p>Hurry! These tickets may sell out quickly.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ticketLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Tickets</a>
</div>`,
    footerText: 'Act fast - tickets are selling quickly!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "fromCity", "toCity", "transportType", "newPrice", "oldPrice", "savings", "ticketLink", "year"]',
  },
  {
    name: 'user_report_received',
    displayName: 'Ticket Report Received',
    category: 'user',
    subject: 'Your Report Has Been Received',
    title: 'Report Received',
    body: `<p>Hello {{userName}},</p>

<p>Thank you for reporting this ticket. We have received your report and will investigate it.</p>

<h3>Report Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> {{ticketId}}</li>
  <li><strong>Reason:</strong> {{reportReason}}</li>
  <li><strong>Report Date:</strong> {{reportDate}}</li>
</ul>

<p>Our team will review your report and take appropriate action. You'll be notified once we have an update.</p>`,
    footerText: 'Thank you for helping keep our platform safe.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "ticketId", "reportReason", "reportDate", "year"]',
  },
  {
    name: 'user_report_resolved',
    displayName: 'Ticket Report Resolved',
    category: 'user',
    subject: 'Your Report Has Been Resolved',
    title: 'Report Resolved',
    body: `<p>Hello {{userName}},</p>

<p>Your report has been reviewed and resolved.</p>

<h3>Resolution Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> {{ticketId}}</li>
  <li><strong>Status:</strong> {{resolutionStatus}}</li>
  <li><strong>Resolution Date:</strong> {{resolutionDate}}</li>
</ul>

<h3>Admin Notes:</h3>
<p>{{adminNotes}}</p>`,
    footerText: 'Thank you for helping keep our platform safe.',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "ticketId", "resolutionStatus", "resolutionDate", "adminNotes", "year"]',
  },
  {
    name: 'user_account_blocked',
    displayName: 'Account Blocked Notification',
    category: 'user',
    subject: 'Your Account Has Been Blocked',
    title: 'Account Blocked',
    body: `<p>Hello {{userName}},</p>

<p>We regret to inform you that your account has been blocked.</p>

<h3>Reason:</h3>
<p>{{blockReason}}</p>

<h3>What to do:</h3>
<p>If you believe this is an error, please contact our support team with the reference ID: {{referenceId}}</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{supportLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Support</a>
</div>`,
    footerText: 'EidTicketResell Team',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "blockReason", "referenceId", "supportLink", "year"]',
  },
  {
    name: 'user_account_unblocked',
    displayName: 'Account Unblocked Notification',
    category: 'user',
    subject: 'Your Account Has Been Restored',
    title: 'Account Restored',
    body: `<p>Hello {{userName}},</p>

<p>Great news! Your account has been restored and is now active.</p>

<p>You can now log in and continue using all features of EidTicketResell.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{loginLink}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In Now</a>
</div>

<p>Thank you for your patience.</p>`,
    footerText: 'Welcome back to EidTicketResell!',
    copyrightText: '© {{year}} EidTicketResell. All rights reserved.',
    variables: '["userName", "loginLink", "year"]',
  },
]

async function seedEmailTemplates() {
  console.log('Seeding email templates...')
  
  const allTemplates = [...adminTemplates, ...userTemplates]
  
  for (const template of allTemplates) {
    await db.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    })
    console.log(`✓ Seeded: ${template.displayName}`)
  }
  
  console.log(`\n✓ Successfully seeded ${allTemplates.length} email templates`)
}

seedEmailTemplates()
  .catch((e) => {
    console.error('Error seeding email templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
