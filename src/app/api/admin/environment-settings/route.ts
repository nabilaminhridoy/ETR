import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// Environment settings keys
const ENVIRONMENT_SETTINGS_KEYS = [
  'env_debug_mode',
  'env_maintenance_mode',
  'env_ssl_enabled',
  'env_cache_enabled',
  'env_session_timeout',
  'env_max_login_attempts',
  'env_cache_ttl',
  'env_last_backup',
]

// Helper to get database file size
function getDatabaseSize(): string {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath)
      const bytes = stats.size
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}

// GET - Fetch all environment settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ENVIRONMENT_SETTINGS_KEYS
        }
      }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value || ''
    })

    // Build response with defaults
    const response = {
      application: {
        appEnv: process.env.NODE_ENV || 'development',
        debugMode: settingsMap['env_debug_mode'] === 'true',
        maintenanceMode: settingsMap['env_maintenance_mode'] === 'true',
      },
      security: {
        sslEnabled: settingsMap['env_ssl_enabled'] !== 'false', // Default true
        sessionTimeout: parseInt(settingsMap['env_session_timeout'] || '60'),
        maxLoginAttempts: parseInt(settingsMap['env_max_login_attempts'] || '5'),
      },
      database: {
        dbConnection: 'SQLite',
        dbSize: getDatabaseSize(),
        lastBackup: settingsMap['env_last_backup'] || 'Never',
      },
      cache: {
        cacheEnabled: settingsMap['env_cache_enabled'] !== 'false', // Default true
        cacheTTL: parseInt(settingsMap['env_cache_ttl'] || '3600'),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching environment settings:', error)
    return NextResponse.json({ error: 'Failed to fetch environment settings' }, { status: 500 })
  }
}

// POST - Save all environment settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { application, security, cache } = data

    // Map form data to database keys
    const settingsToSave: { key: string; value: string }[] = []

    // Application settings
    if (application) {
      if (application.debugMode !== undefined) {
        settingsToSave.push({ key: 'env_debug_mode', value: application.debugMode ? 'true' : 'false' })
      }
      if (application.maintenanceMode !== undefined) {
        settingsToSave.push({ key: 'env_maintenance_mode', value: application.maintenanceMode ? 'true' : 'false' })
      }
    }

    // Security settings
    if (security) {
      if (security.sslEnabled !== undefined) {
        settingsToSave.push({ key: 'env_ssl_enabled', value: security.sslEnabled ? 'true' : 'false' })
      }
      if (security.sessionTimeout !== undefined) {
        settingsToSave.push({ key: 'env_session_timeout', value: String(security.sessionTimeout) })
      }
      if (security.maxLoginAttempts !== undefined) {
        settingsToSave.push({ key: 'env_max_login_attempts', value: String(security.maxLoginAttempts) })
      }
    }

    // Cache settings
    if (cache) {
      if (cache.cacheEnabled !== undefined) {
        settingsToSave.push({ key: 'env_cache_enabled', value: cache.cacheEnabled ? 'true' : 'false' })
      }
      if (cache.cacheTTL !== undefined) {
        settingsToSave.push({ key: 'env_cache_ttl', value: String(cache.cacheTTL) })
      }
    }

    // Save each setting using upsert
    for (const setting of settingsToSave) {
      await db.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return NextResponse.json({ success: true, message: 'Environment settings saved successfully' })
  } catch (error) {
    console.error('Error saving environment settings:', error)
    return NextResponse.json({ error: 'Failed to save environment settings' }, { status: 500 })
  }
}
