'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Send, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

export default function MailSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isTestLoading, setIsTestLoading] = useState(false)
  
  const [mailForm, setMailForm] = useState({
    mailDriver: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    encryption: 'tls',
    fromEmail: '',
    fromName: 'EidTicketResell',
  })

  // Fetch mail settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/mail-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setMailForm({
            mailDriver: data.settings.mailDriver || 'smtp',
            smtpHost: data.settings.smtpHost || 'smtp.gmail.com',
            smtpPort: data.settings.smtpPort || '587',
            smtpUsername: data.settings.smtpUsername || '',
            smtpPassword: data.settings.smtpPassword || '',
            encryption: data.settings.encryption || 'tls',
            fromEmail: data.settings.fromEmail || '',
            fromName: data.settings.fromName || 'EidTicketResell',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching mail settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/mail-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Mail Settings Saved',
          description: 'Your mail configuration has been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save mail settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save mail settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      })
      return
    }

    setIsTestLoading(true)
    try {
      const response = await fetch('/api/admin/mail-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: testEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Test Email Sent',
          description: `A test email has been sent to ${testEmail}`,
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send test email',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      })
    } finally {
      setIsTestLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mail Settings</h1>
          <p className="text-muted-foreground">Configure email settings for your application</p>
        </div>
        <Button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
        </Button>
      </div>

      {/* Gmail App Password Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Gmail Users:</strong> You need to use an App Password, not your regular Gmail password. 
          Go to your Google Account → Security → 2-Step Verification → App passwords to generate one.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>Configure SMTP settings for sending emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mail Driver</Label>
              <Select value={mailForm.mailDriver} onValueChange={(value) => setMailForm({ ...mailForm, mailDriver: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={mailForm.smtpHost}
                  onChange={(e) => setMailForm({ ...mailForm, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input
                  value={mailForm.smtpPort}
                  onChange={(e) => setMailForm({ ...mailForm, smtpPort: e.target.value })}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input
                  value={mailForm.smtpUsername}
                  onChange={(e) => setMailForm({ ...mailForm, smtpUsername: e.target.value })}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={mailForm.smtpPassword}
                  onChange={(e) => setMailForm({ ...mailForm, smtpPassword: e.target.value })}
                  placeholder="Enter app password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <Select value={mailForm.encryption} onValueChange={(value) => setMailForm({ ...mailForm, encryption: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS (Recommended)</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sender Information</CardTitle>
            <CardDescription>Configure the sender details for outgoing emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                value={mailForm.fromEmail}
                onChange={(e) => setMailForm({ ...mailForm, fromEmail: e.target.value })}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={mailForm.fromName}
                onChange={(e) => setMailForm({ ...mailForm, fromName: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Test Email
            </CardTitle>
            <CardDescription>Send a test email to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={handleSendTest} disabled={isTestLoading}>
                  {isTestLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Test Email
                </Button>
              </div>
            </div>

            {!mailForm.smtpUsername && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please save your SMTP settings before sending a test email.</span>
              </div>
            )}

            {mailForm.smtpUsername && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>SMTP settings configured. You can send a test email.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Settings Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Settings Guide</CardTitle>
          <CardDescription>Common SMTP configurations for popular email providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-sm">Gmail</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Host:</strong> smtp.gmail.com</p>
                <p><strong>Port:</strong> 587 (TLS) or 465 (SSL)</p>
                <p><strong>Username:</strong> Your Gmail address</p>
                <p><strong>Password:</strong> App Password (not your regular password)</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-sm">Outlook / Office 365</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Host:</strong> smtp.office365.com</p>
                <p><strong>Port:</strong> 587</p>
                <p><strong>Username:</strong> Your Outlook email</p>
                <p><strong>Password:</strong> Your password or App Password</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-sm">Yahoo Mail</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Host:</strong> smtp.mail.yahoo.com</p>
                <p><strong>Port:</strong> 587 or 465</p>
                <p><strong>Username:</strong> Your Yahoo email</p>
                <p><strong>Password:</strong> App Password</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
