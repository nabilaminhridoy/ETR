import { db } from '@/lib/db'

export interface EnvironmentSettings {
  debugMode: boolean
  maintenanceMode: boolean
  sslEnabled: boolean
  cacheEnabled: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  cacheTTL: number
  lastBackup: string
}

const ENVIRONMENT_KEYS = [
  'env_debug_mode',
  'env_maintenance_mode',
  'env_ssl_enabled',
  'env_cache_enabled',
  'env_session_timeout',
  'env_max_login_attempts',
  'env_cache_ttl',
  'env_last_backup',
]

// Get all environment settings
export async function getEnvironmentSettings(): Promise<EnvironmentSettings> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: { in: ENVIRONMENT_KEYS }
      }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value || ''
    })

    return {
      debugMode: settingsMap['env_debug_mode'] === 'true',
      maintenanceMode: settingsMap['env_maintenance_mode'] === 'true',
      sslEnabled: settingsMap['env_ssl_enabled'] !== 'false',
      cacheEnabled: settingsMap['env_cache_enabled'] !== 'false',
      sessionTimeout: parseInt(settingsMap['env_session_timeout'] || '60'),
      maxLoginAttempts: parseInt(settingsMap['env_max_login_attempts'] || '5'),
      cacheTTL: parseInt(settingsMap['env_cache_ttl'] || '3600'),
      lastBackup: settingsMap['env_last_backup'] || 'Never',
    }
  } catch (error) {
    console.error('Error fetching environment settings:', error)
    return {
      debugMode: false,
      maintenanceMode: false,
      sslEnabled: true,
      cacheEnabled: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      cacheTTL: 3600,
      lastBackup: 'Never',
    }
  }
}

// Check if maintenance mode is enabled
export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: 'env_maintenance_mode' }
    })
    return setting?.value === 'true'
  } catch {
    return false
  }
}

// Check if debug mode is enabled
export async function isDebugMode(): Promise<boolean> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: 'env_debug_mode' }
    })
    return setting?.value === 'true'
  } catch {
    return false
  }
}
