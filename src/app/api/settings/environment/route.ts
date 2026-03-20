import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch public environment settings (for frontend)
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ['env_maintenance_mode', 'env_debug_mode']
        }
      }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value || ''
    })

    // Only expose safe settings
    const response = {
      maintenanceMode: settingsMap['env_maintenance_mode'] === 'true',
      debugMode: settingsMap['env_debug_mode'] === 'true',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching public environment settings:', error)
    return NextResponse.json({ 
      maintenanceMode: false,
      debugMode: false,
    })
  }
}
