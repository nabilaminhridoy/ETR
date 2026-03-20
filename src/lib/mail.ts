import nodemailer from 'nodemailer'
import { db } from './db'

// Email template interface
interface EmailTemplate {
  subject: string
  title: string
  body: string
  footerText: string
  copyrightText: string
}

// Mail settings interface
interface MailSettings {
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  encryption: string
  fromEmail: string
  fromName: string
}

// Get mail settings from database
async function getMailSettings(): Promise<MailSettings> {
  const settings = await db.systemSetting.findMany({
    where: {
      key: {
        in: [
          'smtp_host',
          'smtp_port',
          'smtp_username',
          'smtp_password',
          'smtp_encryption',
          'from_email',
          'from_name',
        ]
      }
    }
  })

  const mailSettings: MailSettings = {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    encryption: 'tls',
    fromEmail: 'noreply@eidticketresell.com',
    fromName: 'EidTicketResell',
  }

  settings.forEach((setting) => {
    switch (setting.key) {
      case 'smtp_host':
        mailSettings.smtpHost = setting.value
        break
      case 'smtp_port':
        mailSettings.smtpPort = setting.value
        break
      case 'smtp_username':
        mailSettings.smtpUsername = setting.value
        break
      case 'smtp_password':
        mailSettings.smtpPassword = setting.value
        break
      case 'smtp_encryption':
        mailSettings.encryption = setting.value
        break
      case 'from_email':
        mailSettings.fromEmail = setting.value
        break
      case 'from_name':
        mailSettings.fromName = setting.value
        break
    }
  })

  return mailSettings
}

// Get email template from database using raw query to bypass cache
async function getEmailTemplate(templateName: string): Promise<EmailTemplate | null> {
  try {
    const templates = await db.$queryRaw`
      SELECT subject, title, body, footerText, copyrightText
      FROM EmailTemplate 
      WHERE name = ${templateName}
    `

    const template = Array.isArray(templates) && templates.length > 0 ? templates[0] : null

    if (!template) {
      console.log(`[Mail] Template not found: ${templateName}`)
      return null
    }

    console.log(`[Mail] Template loaded - Title: ${template.title}, Footer: ${template.footerText}, Copyright: ${template.copyrightText}`)

    return {
      subject: template.subject || '',
      title: template.title || '',
      body: template.body || '',
      footerText: template.footerText || '',
      copyrightText: template.copyrightText || '',
    }
  } catch (error) {
    console.error('[Mail] Error fetching template:', error)
    return null
  }
}

// Replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

// Generate HTML email body
function generateEmailHtml(template: EmailTemplate, variables: Record<string, string>): string {
  const currentYear = new Date().getFullYear().toString()
  const allVariables = { ...variables, year: currentYear }

  const body = replaceVariables(template.body, allVariables)
  const footerText = replaceVariables(template.footerText, allVariables)
  const copyrightText = replaceVariables(template.copyrightText, allVariables)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">${template.title}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${body}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-align: center;">
                ${footerText}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                ${copyrightText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// Create transporter
function createTransporter(settings: MailSettings) {
  const port = parseInt(settings.smtpPort)
  
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtpUsername,
      pass: settings.smtpPassword,
    },
    tls: settings.encryption === 'tls' ? {
      rejectUnauthorized: false
    } : undefined,
  })
}

// Send email using template
export async function sendEmailWithTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Mail] Sending email to ${to} using template: ${templateName}`)
    
    // Get mail settings
    const mailSettings = await getMailSettings()
    console.log(`[Mail] Settings loaded - Host: ${mailSettings.smtpHost}, User: ${mailSettings.smtpUsername}`)

    // Check if SMTP is configured
    if (!mailSettings.smtpHost || !mailSettings.smtpUsername || !mailSettings.smtpPassword) {
      console.error('[Mail] SMTP not configured. Please configure mail settings in admin panel.')
      return { success: false, error: 'SMTP not configured' }
    }

    // Get email template
    const template = await getEmailTemplate(templateName)
    if (!template) {
      console.error(`[Mail] Email template not found: ${templateName}`)
      return { success: false, error: 'Email template not found' }
    }
    console.log(`[Mail] Template found: ${template.subject}`)

    // Generate HTML
    const html = generateEmailHtml(template, variables)
    const subject = replaceVariables(template.subject, { ...variables, year: new Date().getFullYear().toString() })

    // Create transporter
    const transporter = createTransporter(mailSettings)

    // Send email
    console.log(`[Mail] Sending email...`)
    const info = await transporter.sendMail({
      from: `"${mailSettings.fromName}" <${mailSettings.fromEmail}>`,
      to,
      subject,
      html,
    })

    console.log('[Mail] Email sent successfully:', info.messageId)
    return { success: true }
  } catch (error: any) {
    console.error('[Mail] Failed to send email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

// Send OTP email
export async function sendOTPEmail(
  email: string,
  otp: string,
  type: 'register' | 'reset',
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  const templateName = type === 'register' ? 'user_registration_verification' : 'user_password_reset'
  
  const variables: Record<string, string> = {
    userName: userName || email.split('@')[0],
    otpCode: otp,
    expirationTime: '5 minutes',
  }

  return sendEmailWithTemplate(email, templateName, variables)
}

// Send welcome email after registration
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const templateName = 'user_welcome'
  
  const variables: Record<string, string> = {
    userName: userName,
    dashboardLink: process.env.NEXT_PUBLIC_SITE_URL || 'https://eidticketresell.com',
  }

  return sendEmailWithTemplate(email, templateName, variables)
}

// Test email connection
export async function testMailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const mailSettings = await getMailSettings()

    if (!mailSettings.smtpHost || !mailSettings.smtpUsername || !mailSettings.smtpPassword) {
      return { success: false, error: 'SMTP not configured' }
    }

    const transporter = createTransporter(mailSettings)
    await transporter.verify()
    
    return { success: true }
  } catch (error: any) {
    console.error('Mail connection test failed:', error)
    return { success: false, error: error.message || 'Connection failed' }
  }
}
