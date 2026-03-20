'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageSquare, CheckCircle2, XCircle, Eye, EyeOff, Key, Send, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

interface AlphaSMSConfig {
  isEnabled: boolean
  isSandbox: boolean
  apiKey: string
  senderId: string
  baseUrl: string
}

interface BulkSMSBDConfig {
  isEnabled: boolean
  isSandbox: boolean
  apiKey: string
  senderId: string
  baseUrl: string
}

interface TwilioConfig {
  isEnabled: boolean
  isSandbox: boolean
  accountSid: string
  authToken: string
  fromNumber: string
  baseUrl: string
}

export default function SMSSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Test message from EidTicketResell')

  const [alphaSMSForm, setAlphaSMSForm] = useState<AlphaSMSConfig>({
    isEnabled: false,
    isSandbox: true,
    apiKey: '',
    senderId: '8809617613541',
    baseUrl: 'https://api.alphasms.net/index.php?app=ws'
  })

  const [bulkSMSBDForm, setBulkSMSBDForm] = useState<BulkSMSBDConfig>({
    isEnabled: false,
    isSandbox: true,
    apiKey: '',
    senderId: '8809617613541',
    baseUrl: 'https://bulksmsbd.net/api'
  })

  const [twilioForm, setTwilioForm] = useState<TwilioConfig>({
    isEnabled: false,
    isSandbox: true,
    accountSid: '',
    authToken: '',
    fromNumber: '',
    baseUrl: 'https://api.twilio.com/2010-04-01/Accounts'
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/sms-gateways')
      if (response.ok) {
        const data = await response.json()

        if (data.gateways?.alphasms) {
          setAlphaSMSForm({
            isEnabled: data.gateways.alphasms.isEnabled || false,
            isSandbox: data.gateways.alphasms.isSandbox !== false,
            apiKey: data.gateways.alphasms.credentials?.apiKey || '',
            senderId: data.gateways.alphasms.credentials?.senderId || '8809617613541',
            baseUrl: data.gateways.alphasms.credentials?.baseUrl || 'https://api.alphasms.net/index.php?app=ws'
          })
        }

        if (data.gateways?.bulksmsbd) {
          setBulkSMSBDForm({
            isEnabled: data.gateways.bulksmsbd.isEnabled || false,
            isSandbox: data.gateways.bulksmsbd.isSandbox !== false,
            apiKey: data.gateways.bulksmsbd.credentials?.apiKey || '',
            senderId: data.gateways.bulksmsbd.credentials?.senderId || '8809617613541',
            baseUrl: data.gateways.bulksmsbd.credentials?.baseUrl || 'https://bulksmsbd.net/api'
          })
        }

        if (data.gateways?.twilio) {
          setTwilioForm({
            isEnabled: data.gateways.twilio.isEnabled || false,
            isSandbox: data.gateways.twilio.isSandbox !== false,
            accountSid: data.gateways.twilio.credentials?.accountSid || '',
            authToken: '',
            fromNumber: data.gateways.twilio.credentials?.fromNumber || '',
            baseUrl: data.gateways.twilio.credentials?.baseUrl || 'https://api.twilio.com/2010-04-01/Accounts'
          })
        }
      }
    } catch (error) {
      console.error('Error loading SMS configs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAlphaSMS = async () => {
    setIsSaving('alphasms')
    try {
      const response = await fetch('/api/admin/sms-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'alphasms',
          isEnabled: alphaSMSForm.isEnabled,
          isSandbox: alphaSMSForm.isSandbox,
          credentials: {
            apiKey: alphaSMSForm.apiKey,
            senderId: alphaSMSForm.senderId,
            baseUrl: alphaSMSForm.baseUrl
          }
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: 'Alpha SMS Configuration Saved',
          description: 'Your Alpha SMS gateway settings have been saved successfully.'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save Alpha SMS configuration',
          variant: 'destructive'
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save Alpha SMS configuration',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleSaveBulkSMSBD = async () => {
    setIsSaving('bulksmsbd')
    try {
      const response = await fetch('/api/admin/sms-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'bulksmsbd',
          isEnabled: bulkSMSBDForm.isEnabled,
          isSandbox: bulkSMSBDForm.isSandbox,
          credentials: {
            apiKey: bulkSMSBDForm.apiKey,
            senderId: bulkSMSBDForm.senderId,
            baseUrl: bulkSMSBDForm.baseUrl
          }
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: 'BulkSMSBD Configuration Saved',
          description: 'Your BulkSMSBD gateway settings have been saved successfully.'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save BulkSMSBD configuration',
          variant: 'destructive'
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save BulkSMSBD configuration',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleSaveTwilio = async () => {
    setIsSaving('twilio')
    try {
      const response = await fetch('/api/admin/sms-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'twilio',
          isEnabled: twilioForm.isEnabled,
          isSandbox: twilioForm.isSandbox,
          credentials: {
            accountSid: twilioForm.accountSid,
            authToken: twilioForm.authToken,
            fromNumber: twilioForm.fromNumber,
            baseUrl: twilioForm.baseUrl
          }
        })
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: 'Twilio Configuration Saved',
          description: 'Your Twilio gateway settings have been saved successfully.'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save Twilio configuration',
          variant: 'destructive'
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save Twilio configuration',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(null)
    }
  }

  const toggleShowCredential = (field: string) => {
    setShowCredentials(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMS Settings</h1>
          <p className="text-muted-foreground">Configure SMS gateways for sending notifications</p>
        </div>
        <Button variant="outline" onClick={loadConfigs} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="alphasms" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="alphasms" className="gap-2">
            Alpha SMS
            {alphaSMSForm.isEnabled && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bulksmsbd" className="gap-2">
            BulkSMSBD
            {bulkSMSBDForm.isEnabled && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="twilio" className="gap-2">
            Twilio
            {twilioForm.isEnabled && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alphasms">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Alpha SMS
                  </CardTitle>
                  <CardDescription>Bangladesh SMS gateway with competitive rates</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alphaSMSForm.isEnabled}
                    onCheckedChange={(checked) => setAlphaSMSForm({ ...alphaSMSForm, isEnabled: checked })}
                  />
                  <span className="text-sm font-medium">{alphaSMSForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {alphaSMSForm.isEnabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {alphaSMSForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                  </span>
                </div>
                <Badge variant={alphaSMSForm.isSandbox ? 'secondary' : 'default'}>
                  {alphaSMSForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <Label className="font-semibold">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable for testing. Disable for production.</p>
                </div>
                <Switch
                  checked={alphaSMSForm.isSandbox}
                  onCheckedChange={(checked) => setAlphaSMSForm({ ...alphaSMSForm, isSandbox: checked })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get your API credentials from Alpha SMS dashboard.{' '}
                  <a
                    href="https://alphasms.net/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showCredentials['alphasms-apiKey'] ? 'text' : 'password'}
                        value={alphaSMSForm.apiKey}
                        onChange={(e) => setAlphaSMSForm({ ...alphaSMSForm, apiKey: e.target.value })}
                        placeholder="Your Alpha SMS API Key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('alphasms-apiKey')}
                      >
                        {showCredentials['alphasms-apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      value={alphaSMSForm.senderId}
                      onChange={(e) => setAlphaSMSForm({ ...alphaSMSForm, senderId: e.target.value })}
                      placeholder="8809617613541"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Base URL</Label>
                    <Input
                      value={alphaSMSForm.baseUrl}
                      onChange={(e) => setAlphaSMSForm({ ...alphaSMSForm, baseUrl: e.target.value })}
                      placeholder="https://api.alphasms.net/index.php?app=ws"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  className="btn-primary"
                  onClick={handleSaveAlphaSMS}
                  disabled={isSaving === 'alphasms'}
                >
                  {isSaving === 'alphasms' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulksmsbd">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    BulkSMSBD
                  </CardTitle>
                  <CardDescription>Popular Bangladesh bulk SMS service provider</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bulkSMSBDForm.isEnabled}
                    onCheckedChange={(checked) => setBulkSMSBDForm({ ...bulkSMSBDForm, isEnabled: checked })}
                  />
                  <span className="text-sm font-medium">{bulkSMSBDForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {bulkSMSBDForm.isEnabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {bulkSMSBDForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                  </span>
                </div>
                <Badge variant={bulkSMSBDForm.isSandbox ? 'secondary' : 'default'}>
                  {bulkSMSBDForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <Label className="font-semibold">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable for testing. Disable for production.</p>
                </div>
                <Switch
                  checked={bulkSMSBDForm.isSandbox}
                  onCheckedChange={(checked) => setBulkSMSBDForm({ ...bulkSMSBDForm, isSandbox: checked })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showCredentials['bulksmsbd-apiKey'] ? 'text' : 'password'}
                        value={bulkSMSBDForm.apiKey}
                        onChange={(e) => setBulkSMSBDForm({ ...bulkSMSBDForm, apiKey: e.target.value })}
                        placeholder="Your BulkSMSBD API Key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('bulksmsbd-apiKey')}
                      >
                        {showCredentials['bulksmsbd-apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      value={bulkSMSBDForm.senderId}
                      onChange={(e) => setBulkSMSBDForm({ ...bulkSMSBDForm, senderId: e.target.value })}
                      placeholder="8809617613541"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Base URL</Label>
                    <Input
                      value={bulkSMSBDForm.baseUrl}
                      onChange={(e) => setBulkSMSBDForm({ ...bulkSMSBDForm, baseUrl: e.target.value })}
                      placeholder="https://bulksmsbd.net/api"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  className="btn-primary"
                  onClick={handleSaveBulkSMSBD}
                  disabled={isSaving === 'bulksmsbd'}
                >
                  {isSaving === 'bulksmsbd' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twilio">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Twilio
                  </CardTitle>
                  <CardDescription>International SMS gateway with global coverage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={twilioForm.isEnabled}
                    onCheckedChange={(checked) => setTwilioForm({ ...twilioForm, isEnabled: checked })}
                  />
                  <span className="text-sm font-medium">{twilioForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {twilioForm.isEnabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {twilioForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                  </span>
                </div>
                <Badge variant={twilioForm.isSandbox ? 'secondary' : 'default'}>
                  {twilioForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <Label className="font-semibold">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable for testing. Disable for production.</p>
                </div>
                <Switch
                  checked={twilioForm.isSandbox}
                  onCheckedChange={(checked) => setTwilioForm({ ...twilioForm, isSandbox: checked })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account SID</Label>
                    <Input
                      value={twilioForm.accountSid}
                      onChange={(e) => setTwilioForm({ ...twilioForm, accountSid: e.target.value })}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Token</Label>
                    <div className="relative">
                      <Input
                        type={showCredentials['twilio-authToken'] ? 'text' : 'password'}
                        value={twilioForm.authToken}
                        onChange={(e) => setTwilioForm({ ...twilioForm, authToken: e.target.value })}
                        placeholder="Your Twilio Auth Token"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('twilio-authToken')}
                      >
                        {showCredentials['twilio-authToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>From Number</Label>
                    <Input
                      value={twilioForm.fromNumber}
                      onChange={(e) => setTwilioForm({ ...twilioForm, fromNumber: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input
                      value={twilioForm.baseUrl}
                      onChange={(e) => setTwilioForm({ ...twilioForm, baseUrl: e.target.value })}
                      placeholder="https://api.twilio.com/2010-04-01/Accounts"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  className="btn-primary"
                  onClick={handleSaveTwilio}
                  disabled={isSaving === 'twilio'}
                >
                  {isSaving === 'twilio' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> For sending SMS to Bangladesh numbers, you need to enable international SMS in your Twilio account and comply with local regulations.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test SMS
          </CardTitle>
          <CardDescription>Send a test SMS using the enabled gateway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Message</Label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test message"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled={!alphaSMSForm.isEnabled && !bulkSMSBDForm.isEnabled && !twilioForm.isEnabled}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Test SMS
            </Button>
            {!alphaSMSForm.isEnabled && !bulkSMSBDForm.isEnabled && !twilioForm.isEnabled && (
              <span className="text-sm text-muted-foreground">Enable at least one SMS gateway to send test messages</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
