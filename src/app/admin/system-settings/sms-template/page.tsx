'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, MessageSquare, Users, Shield, Save, Eye, Edit3, ChevronRight, FileText, AlertCircle, RefreshCw, Send, Smartphone, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SMSTemplate {
  id: string
  name: string
  displayName: string
  category: string
  body: string
  variables: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const adminTemplateGroups = [
  { title: 'Ticket Management', icon: FileText, templates: ['admin_new_ticket_listing', 'admin_ticket_sold'] },
  { title: 'Payments & Payouts', icon: MessageSquare, templates: ['admin_withdrawal_request'] },
  { title: 'Verification', icon: Shield, templates: ['admin_id_verification'] },
]

const userTemplateGroups = [
  { title: 'Account & Verification', icon: Users, templates: ['user_registration_otp', 'user_password_reset_otp', 'user_welcome', 'user_id_verification_approved', 'user_id_verification_rejected'] },
  { title: 'Ticket Listings', icon: FileText, templates: ['user_ticket_approved', 'user_ticket_rejected'] },
  { title: 'Payments & Transactions', icon: MessageSquare, templates: ['user_payment_success', 'user_ticket_sold_notification', 'user_payout_processed'] },
  { title: 'Reminders & Alerts', icon: AlertCircle, templates: ['user_travel_reminder'] },
]

export default function SMSTemplatePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [activeTab, setActiveTab] = useState('admin-sms')
  const [testPhone, setTestPhone] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [formData, setFormData] = useState({ body: '' })
  const [togglingTemplate, setTogglingTemplate] = useState<string | null>(null)

  useEffect(() => { fetchTemplates() }, [])
  useEffect(() => { if (selectedTemplate) setFormData({ body: selectedTemplate.body || '' }) }, [selectedTemplate])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/sms-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        const adminTemplates = (data.templates || []).filter((t: SMSTemplate) => t.category === 'admin')
        if (adminTemplates.length > 0) setSelectedTemplate(adminTemplates[0])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch SMS templates', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }

  const handleSave = async () => {
    if (!selectedTemplate) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/sms-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedTemplate.name, displayName: selectedTemplate.displayName, category: selectedTemplate.category, ...formData })
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Template Saved', description: 'SMS template has been updated successfully.' })
        setTemplates(templates.map(t => t.name === selectedTemplate.name ? { ...t, ...formData } : t))
        setSelectedTemplate({ ...selectedTemplate, ...formData })
      } else toast({ title: 'Error', description: data.error || 'Failed to save template', variant: 'destructive' })
    } catch { toast({ title: 'Error', description: 'Failed to save template', variant: 'destructive' }) }
    finally { setIsSaving(false) }
  }

  const handleToggleActive = async (template: SMSTemplate) => {
    setTogglingTemplate(template.id)
    try {
      const response = await fetch('/api/admin/sms-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: template.name, 
          displayName: template.displayName, 
          category: template.category, 
          body: template.body,
          isActive: !template.isActive 
        })
      })
      const data = await response.json()
      if (response.ok) {
        const updatedTemplate = { ...template, isActive: !template.isActive }
        setTemplates(templates.map(t => t.name === template.name ? updatedTemplate : t))
        if (selectedTemplate?.name === template.name) {
          setSelectedTemplate(updatedTemplate)
        }
        toast({ 
          title: template.isActive ? 'Template Disabled' : 'Template Enabled', 
          description: `${template.displayName} has been ${template.isActive ? 'disabled' : 'enabled'}.` 
        })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update template status', variant: 'destructive' })
      }
    } catch { 
      toast({ title: 'Error', description: 'Failed to update template status', variant: 'destructive' }) 
    } finally { 
      setTogglingTemplate(null) 
    }
  }

  const handleSendTest = async () => {
    if (!selectedTemplate || !testPhone) return
    setIsSendingTest(true)
    try {
      const response = await fetch('/api/admin/sms-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: selectedTemplate.name, toPhone: testPhone, templateData: formData })
      })
      const data = await response.json()
      if (response.ok) toast({ title: 'Test SMS Sent', description: 'Test SMS has been sent to ' + testPhone })
      else toast({ title: 'Error', description: data.error || 'Failed to send test SMS', variant: 'destructive' })
    } catch { toast({ title: 'Error', description: 'Failed to send test SMS', variant: 'destructive' }) }
    finally { setIsSendingTest(false) }
  }

  const getTemplatesByGroup = (groupTemplates: string[]) => templates.filter(t => groupTemplates.includes(t.name))

  const renderTemplateList = (groups: typeof adminTemplateGroups) => (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupTemplates = getTemplatesByGroup(group.templates)
        if (groupTemplates.length === 0) return null
        const Icon = group.icon
        return (
          <div key={group.title} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 px-2">
              <Icon className="w-4 h-4" />
              {group.title}
            </h3>
            <div className="space-y-1">
              {groupTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors gap-2',
                    selectedTemplate?.name === template.name 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted',
                    !template.isActive && 'opacity-60'
                  )}
                >
                  <button 
                    onClick={() => setSelectedTemplate(template)} 
                    className="flex items-center gap-2 flex-1 min-w-0"
                  >
                    {template.isActive ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium truncate">{template.displayName}</span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    {togglingTemplate === template.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => handleToggleActive(template)}
                        className={cn(
                          selectedTemplate?.name === template.name && 'data-[state=checked]:bg-green-500'
                        )}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderPreview = () => {
    if (!selectedTemplate) return null
    const sampleData: Record<string, string> = { userName: 'John Doe', otpCode: '123456', expirationTime: '5 minutes', ticketId: 'TKT-001', routeName: 'Dhaka to Chittagong', travelDate: '2025-06-15', sellingPrice: '1,200', amount: '1,200', earnings: '1,188', buyerName: 'Bob Wilson', paymentMethod: 'bKash', sellerName: 'Jane Smith', method: 'bKash', documentType: 'National ID', rejectionReason: 'Document image was blurry', departureTime: '10:00 AM', seatNumber: 'A1', accountDetails: '****1234', transactionRef: 'REF-ABC123' }
    const replaceVariables = (text: string) => { let result = text; Object.entries(sampleData).forEach(([key, value]) => { result = result.replace(new RegExp('{{' + key + '}}', 'g'), value) }); return result }
    const previewBody = replaceVariables(formData.body)
    return (
      <div className="bg-white border rounded-lg overflow-hidden shadow-lg dark:bg-slate-900">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">SMS Preview</span>
        </div>
        <div className="p-4">
          <div className="max-w-sm mx-auto bg-green-50 dark:bg-green-950 rounded-lg p-3 border">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">ET</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">EidTicketResell</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{previewBody}</p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">Character count: {previewBody.length} / 160 ({Math.ceil(previewBody.length / 160)} SMS)</p>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMS Templates</h1>
          <p className="text-muted-foreground">Manage SMS templates for notifications</p>
        </div>
        <Button variant="outline" onClick={fetchTemplates} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Keep SMS messages concise (under 160 characters for single SMS). Variables like {'{{userName}}'} will be replaced with actual values when sending. Use toggles to enable/disable individual templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none border-b h-auto">
                <TabsTrigger value="admin-sms" className="flex-1 text-xs">Admin SMS</TabsTrigger>
                <TabsTrigger value="user-sms" className="flex-1 text-xs">User SMS</TabsTrigger>
              </TabsList>
              <TabsContent value="admin-sms" className="m-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="p-4">{renderTemplateList(adminTemplateGroups)}</div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="user-sms" className="m-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="p-4">{renderTemplateList(userTemplateGroups)}</div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selectedTemplate ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedTemplate.displayName}
                    {selectedTemplate.isActive ? (
                      <Badge className="bg-green-500 text-white text-xs">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Disabled</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {selectedTemplate.category === 'admin' ? 'Admin SMS' : 'User SMS'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button 
                      variant={mode === 'edit' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setMode('edit')} 
                      className="rounded-none gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant={mode === 'preview' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setMode('preview')} 
                      className="rounded-none gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="btn-primary gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {mode === 'edit' ? (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Message Body</Label>
                        <Textarea 
                          value={formData.body} 
                          onChange={(e) => setFormData({ ...formData, body: e.target.value })} 
                          placeholder="SMS message content" 
                          className="min-h-[150px]" 
                          maxLength={500} 
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.body.length} / 500 characters. Single SMS: 160 chars. Multi-part: 153 chars per part.
                        </p>
                      </div>
                      {selectedTemplate.variables && (
                        <div className="bg-muted p-4 rounded-lg">
                          <Label className="text-sm font-semibold mb-2 block">Available Variables</Label>
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(selectedTemplate.variables).map((variable: string) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {'{{' + variable + '}}'}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Use these variables in your template. They will be replaced with actual values when sending SMS.
                          </p>
                        </div>
                      )}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Test SMS
                        </h4>
                        <div className="flex gap-3">
                          <Input 
                            value={testPhone} 
                            onChange={(e) => setTestPhone(e.target.value)} 
                            placeholder="01XXXXXXXXX" 
                            className="flex-1" 
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleSendTest} 
                            disabled={isSendingTest || !testPhone}
                          >
                            {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Send Test
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ScrollArea className="h-[calc(100vh-450px)]">
                        {renderPreview()}
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Select a Template</h3>
              <p className="text-muted-foreground">Choose a template from the list to edit or preview</p>
            </CardContent>
          )}
        </Card>
      </div>
    </motion.div>
  )
}
