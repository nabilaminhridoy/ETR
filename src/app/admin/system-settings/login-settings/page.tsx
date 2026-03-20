'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Key, Shield, Smartphone } from 'lucide-react'

interface LoginSettings {
  otpEnabled: boolean
  otpProvider: string
  otpExpiry: string
  maxOtpAttempts: string
  socialLoginEnabled: boolean
  googleLogin: boolean
  facebookLogin: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  phoneVerificationRequired: boolean
  passwordMinLength: string
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumber: boolean
  passwordRequireSpecial: boolean
}

const defaultSettings: LoginSettings = {
  otpEnabled: true,
  otpProvider: 'twilio',
  otpExpiry: '5',
  maxOtpAttempts: '3',
  socialLoginEnabled: true,
  googleLogin: true,
  facebookLogin: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  phoneVerificationRequired: true,
  passwordMinLength: '8',
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
}

export default function LoginSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<LoginSettings>(defaultSettings)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/login-settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({ ...defaultSettings, ...data.settings })
        }
      } catch (error) {
        console.error('Error fetching login settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load login settings',
          variant: 'destructive',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/login-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Login settings have been updated successfully.',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving login settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save login settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Login Settings</h1>
          <p className="text-muted-foreground">Configure authentication and login options</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              OTP Verification
            </CardTitle>
            <CardDescription>Configure OTP settings for phone verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable OTP Login</Label>
                <p className="text-sm text-muted-foreground">Allow users to login with OTP</p>
              </div>
              <Switch
                checked={settings.otpEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, otpEnabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>OTP Provider</Label>
              <Select value={settings.otpProvider} onValueChange={(value) => setSettings({ ...settings, otpProvider: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="msg91">MSG91</SelectItem>
                  <SelectItem value="bulksmsbd">BulkSMSBD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="otpExpiry">OTP Expiry (minutes)</Label>
                <Input
                  id="otpExpiry"
                  type="number"
                  value={settings.otpExpiry}
                  onChange={(e) => setSettings({ ...settings, otpExpiry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOtpAttempts">Max Attempts</Label>
                <Input
                  id="maxOtpAttempts"
                  type="number"
                  value={settings.maxOtpAttempts}
                  onChange={(e) => setSettings({ ...settings, maxOtpAttempts: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5" />
              Social Login
            </CardTitle>
            <CardDescription>Configure social login providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Social Login</Label>
                <p className="text-sm text-muted-foreground">Allow social media login</p>
              </div>
              <Switch
                checked={settings.socialLoginEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, socialLoginEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Google Login</Label>
                <p className="text-sm text-muted-foreground">Enable Google OAuth</p>
              </div>
              <Switch
                checked={settings.googleLogin}
                onCheckedChange={(checked) => setSettings({ ...settings, googleLogin: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Facebook Login</Label>
                <p className="text-sm text-muted-foreground">Enable Facebook OAuth</p>
              </div>
              <Switch
                checked={settings.facebookLogin}
                onCheckedChange={(checked) => setSettings({ ...settings, facebookLogin: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Registration Settings
            </CardTitle>
            <CardDescription>Configure user registration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">Enable new user registration</p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">Require email verification</p>
              </div>
              <Switch
                checked={settings.emailVerificationRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Phone Verification</Label>
                <p className="text-sm text-muted-foreground">Require phone verification</p>
              </div>
              <Switch
                checked={settings.phoneVerificationRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, phoneVerificationRequired: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5" />
              Password Policy
            </CardTitle>
            <CardDescription>Configure password requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Uppercase</Label>
                <p className="text-sm text-muted-foreground">At least one uppercase letter (A-Z)</p>
              </div>
              <Switch
                checked={settings.passwordRequireUppercase}
                onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireUppercase: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Lowercase</Label>
                <p className="text-sm text-muted-foreground">At least one lowercase letter (a-z)</p>
              </div>
              <Switch
                checked={settings.passwordRequireLowercase}
                onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireLowercase: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Number</Label>
                <p className="text-sm text-muted-foreground">At least one number</p>
              </div>
              <Switch
                checked={settings.passwordRequireNumber}
                onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireNumber: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Special Character</Label>
                <p className="text-sm text-muted-foreground">At least one special character</p>
              </div>
              <Switch
                checked={settings.passwordRequireSpecial}
                onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireSpecial: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
