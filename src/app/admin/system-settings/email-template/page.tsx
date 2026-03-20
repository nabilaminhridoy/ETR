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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { 
  Loader2, Mail, Users, Shield, Save, Eye, Edit3, ChevronRight,
  FileText, Clock, AlertCircle, CheckCircle2, RefreshCw, Send
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface EmailTemplate {
  id: string
  name: string
  displayName: string
  category: string
  subject: string
  title: string
  body: string
  footerText: string | null
  copyrightText: string | null
  variables: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Group templates by their display names
const adminTemplateGroups = [
  {
    title: 'ID Verification',
    icon: Shield,
    templates: ['admin_id_verification_request']
  },
  {
    title: 'Ticket Management',
    icon: FileText,
    templates: ['admin_new_ticket_listing', 'admin_ticket_sold', 'admin_ticket_report_submitted']
  },
  {
    title: 'Payments & Payouts',
    icon: Mail,
    templates: ['admin_payment_received', 'admin_seller_withdrawal_request', 'admin_seller_payout_processed']
  },
]

const userTemplateGroups = [
  {
    title: 'Account & Verification',
    icon: Users,
    templates: ['user_registration_verification', 'user_password_reset', 'user_welcome', 'user_id_verification_approved', 'user_id_verification_rejected']
  },
  {
    title: 'Ticket Listings',
    icon: FileText,
    templates: ['user_ticket_pending_review', 'user_ticket_approved', 'user_ticket_expiring']
  },
  {
    title: 'Payments & Transactions',
    icon: Mail,
    templates: ['user_payment_confirmation', 'user_ticket_sold_notification', 'user_payout_confirmation']
  },
  {
    title: 'Reminders & Alerts',
    icon: Clock,
    templates: ['user_travel_reminder', 'user_price_drop_alert']
  },
  {
    title: 'Reports & Account',
    icon: AlertCircle,
    templates: ['user_report_received', 'user_report_resolved', 'user_account_blocked', 'user_account_unblocked']
  },
]

export default function EmailTemplatePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [activeTab, setActiveTab] = useState('admin-email')
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    body: '',
    footerText: '',
    copyrightText: '',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        subject: selectedTemplate.subject || '',
        title: selectedTemplate.title || '',
        body: selectedTemplate.body || '',
        footerText: selectedTemplate.footerText || '',
        copyrightText: selectedTemplate.copyrightText || '',
      })
    }
  }, [selectedTemplate])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        // Auto-select first admin template
        const adminTemplates = (data.templates || []).filter((t: EmailTemplate) => t.category === 'admin')
        if (adminTemplates.length > 0) {
          setSelectedTemplate(adminTemplates[0])
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedTemplate) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTemplate.name,
          displayName: selectedTemplate.displayName,
          category: selectedTemplate.category,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Template Saved',
          description: 'Email template has been updated successfully.',
        })
        // Update local state
        setTemplates(templates.map(t => 
          t.name === selectedTemplate.name ? { ...t, ...formData } : t
        ))
        setSelectedTemplate({ ...selectedTemplate, ...formData })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save template',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) return
    
    setIsSendingTest(true)
    try {
      const response = await fetch('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: selectedTemplate.name,
          toEmail: testEmail,
          templateData: formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Test Email Sent',
          description: `Test email has been sent to ${testEmail}`,
        })
        setIsTestDialogOpen(false)
        setTestEmail('')
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
      setIsSendingTest(false)
    }
  }

  const getTemplatesByGroup = (groupTemplates: string[]) => {
    return templates.filter(t => groupTemplates.includes(t.name))
  }

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
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                    selectedTemplate?.name === template.name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-sm font-medium">{template.displayName}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderPreview = () => {
    if (!selectedTemplate) return null

    // Sample data for preview
    const sampleData: Record<string, string> = {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      otpCode: '123456',
      documentType: 'National ID',
      submittedDate: new Date().toLocaleDateString(),
      year: new Date().getFullYear().toString(),
      verificationLink: 'https://example.com/verify/abc123',
      expirationTime: '24 hours',
      ticketId: 'TKT-001',
      sellerName: 'Jane Smith',
      sellerEmail: 'jane@example.com',
      transportType: 'Bus',
      fromCity: 'Dhaka',
      toCity: 'Chittagong',
      travelDate: '2025-06-15',
      sellingPrice: '1,200',
      transactionId: 'TXN-12345',
      buyerName: 'Bob Wilson',
      buyerEmail: 'bob@example.com',
      ticketPrice: '1,200',
      platformFee: '12',
      totalAmount: '1,212',
      amount: '1,200',
      paymentMethod: 'bKash',
      paymentDate: new Date().toLocaleDateString(),
      withdrawalMethod: 'Bank Transfer',
      accountDetails: '****1234',
      requestDate: new Date().toLocaleDateString(),
      transactionRef: 'REF-ABC123',
      processedDate: new Date().toLocaleDateString(),
      reportReason: 'Fake Ticket',
      reportDescription: 'The ticket appears to be counterfeit.',
      reportedDate: new Date().toLocaleDateString(),
      rejectionReason: 'Document image was blurry',
      verificationLink: 'https://example.com/verify',
      listingLink: 'https://example.com/listing/123',
      ticketLink: 'https://example.com/ticket/123',
      walletLink: 'https://example.com/wallet',
      earnings: '1,188',
      buyerPhone: '+880 1700-000000',
      companyName: 'Green Line Paribahan',
      departureTime: '10:00 AM',
      seatNumber: 'A1',
      pnrNumber: 'PNR123456',
      daysRemaining: '3',
      editLink: 'https://example.com/edit/123',
      newPrice: '800',
      oldPrice: '1,000',
      savings: '200',
      resolutionStatus: 'Resolved - Action Taken',
      resolutionDate: new Date().toLocaleDateString(),
      adminNotes: 'The reported ticket has been removed from the platform.',
      blockReason: 'Violation of terms of service',
      referenceId: 'REF-123456',
      supportLink: 'https://example.com/support',
      loginLink: 'https://example.com/login',
      dashboardLink: 'https://example.com/dashboard',
      resetLink: 'https://example.com/reset/abc123',
      routeName: 'Dhaka → Chittagong',
    }

    const replaceVariables = (text: string) => {
      let result = text
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value)
      })
      return result
    }

    const previewSubject = replaceVariables(formData.subject)
    const previewTitle = replaceVariables(formData.title)
    const previewBody = replaceVariables(formData.body)
    const previewFooter = replaceVariables(formData.footerText || '')
    const previewCopyright = replaceVariables(formData.copyrightText || '')

    return (
      <div className="bg-white border rounded-lg overflow-hidden shadow-lg">
        {/* Email Header */}
        <div className="bg-slate-100 px-4 py-2 border-b">
          <p className="text-xs text-muted-foreground">Subject: {previewSubject}</p>
        </div>
        
        {/* Email Body */}
        <div className="p-6">
          <div className="max-w-xl mx-auto">
            {/* Logo Area */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">EidTicketResell</h2>
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-center mb-6">{previewTitle}</h1>

            {/* Content */}
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewBody }}
            />

            {/* Footer */}
            {previewFooter && (
              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                {previewFooter}
              </div>
            )}

            {/* Copyright */}
            {previewCopyright && (
              <div className="mt-4 text-center text-xs text-muted-foreground">
                {previewCopyright}
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage email templates for notifications</p>
        </div>
        <Button variant="outline" onClick={fetchTemplates} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none border-b h-auto">
                <TabsTrigger value="admin-email" className="flex-1 text-xs">
                  Admin Email
                </TabsTrigger>
                <TabsTrigger value="user-email" className="flex-1 text-xs">
                  User Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin-email" className="m-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="p-4">
                    {renderTemplateList(adminTemplateGroups)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="user-email" className="m-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="p-4">
                    {renderTemplateList(userTemplateGroups)}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Editor / Preview */}
        <Card className="lg:col-span-3">
          {selectedTemplate ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">{selectedTemplate.displayName}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {selectedTemplate.category === 'admin' ? 'Admin Email' : 'User Email'}
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
                  <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Send className="w-4 h-4" />
                        Send Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Test Email</DialogTitle>
                        <DialogDescription>
                          Send a test email using this template with sample data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Recipient Email</Label>
                          <Input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="test@example.com"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          The email will be sent with sample data for variables like userName, otpCode, etc.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendTest} 
                          disabled={isSendingTest || !testEmail}
                          className="btn-primary gap-2"
                        >
                          {isSendingTest ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Test Email
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handleSave} disabled={isSaving} className="btn-primary gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {mode === 'edit' ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Email subject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Email title"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Body (HTML)</Label>
                        <Textarea
                          value={formData.body}
                          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                          placeholder="Email body content (HTML allowed)"
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Footer Text</Label>
                          <Textarea
                            value={formData.footerText}
                            onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                            placeholder="Footer text"
                            className="min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Copyright Text</Label>
                          <Input
                            value={formData.copyrightText}
                            onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                            placeholder="© 2025 EidTicketResell. All rights reserved."
                          />
                        </div>
                      </div>

                      {/* Variables */}
                      {selectedTemplate.variables && (
                        <div className="bg-muted p-4 rounded-lg">
                          <Label className="text-sm font-semibold mb-2 block">Available Variables</Label>
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(selectedTemplate.variables).map((variable: string) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Use these variables in your template. They will be replaced with actual values when sending emails.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ScrollArea className="h-[calc(100vh-420px)]">
                        {renderPreview()}
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Mail className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Select a Template</h3>
              <p className="text-muted-foreground">
                Choose a template from the list to edit or preview
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </motion.div>
  )
}
