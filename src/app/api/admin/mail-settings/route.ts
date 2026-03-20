import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch mail settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            'mail_driver',
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

    // Convert to object
    const mailSettings: Record<string, string> = {
      mailDriver: 'smtp',
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
        case 'mail_driver':
          mailSettings.mailDriver = setting.value
          break
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

    return NextResponse.json({ settings: mailSettings })
  } catch (error) {
    console.error('Error fetching mail settings:', error)
    return NextResponse.json({ error: 'Failed to fetch mail settings' }, { status: 500 })
  }
}

// POST - Save mail settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const settingsMap: Record<string, string> = {
      mailDriver: 'mail_driver',
      smtpHost: 'smtp_host',
      smtpPort: 'smtp_port',
      smtpUsername: 'smtp_username',
      smtpPassword: 'smtp_password',
      encryption: 'smtp_encryption',
      fromEmail: 'from_email',
      fromName: 'from_name',
    }

    for (const [key, dbKey] of Object.entries(settingsMap)) {
      if (data[key] !== undefined) {
        await db.systemSetting.upsert({
          where: { key: dbKey },
          update: { value: data[key] },
          create: { key: dbKey, value: data[key] },
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Mail settings saved successfully' })
  } catch (error) {
    console.error('Error saving mail settings:', error)
    return NextResponse.json({ error: 'Failed to save mail settings' }, { status: 500 })
  }
}
