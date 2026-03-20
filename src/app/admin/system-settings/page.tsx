'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Globe, Building2, Share2, Save } from 'lucide-react'

interface GeneralForm {
  siteName: string
  siteTagline: string
  metaDescription: string
  defaultTimezone: string
  defaultCurrency: string
  currencySymbol: string
  platformCommission: string
  minimumCommission: string
  gtmId: string
}

interface BusinessForm {
  email: string
  phone: string
  streetAddress: string
  city: string
  country: string
  postalCode: string
}

interface SocialForm {
  supportPhone: string
  supportEmail: string
  facebook: string
  instagram: string
  whatsapp: string
  telegram: string
  youtube: string
}

export default function GeneralSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [generalForm, setGeneralForm] = useState<GeneralForm>({
    siteName: '',
    siteTagline: '',
    metaDescription: '',
    defaultTimezone: '',
    defaultCurrency: '',
    currencySymbol: '',
    platformCommission: '',
    minimumCommission: '',
    gtmId: '',
  })
  const [businessForm, setBusinessForm] = useState<BusinessForm>({
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    country: '',
    postalCode: '',
  })
  const [socialForm, setSocialForm] = useState<SocialForm>({
    supportPhone: '',
    supportEmail: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    telegram: '',
    youtube: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/general-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.general) {
          setGeneralForm(data.general)
        }
        if (data.business) {
          setBusinessForm(data.business)
        }
        if (data.social) {
          setSocialForm(data.social)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/general-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general: generalForm,
          business: businessForm,
          social: socialForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Your changes have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">General Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings</p>
        </div>
        <Button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="business-details" className="gap-2">
            <Building2 className="w-4 h-4" />
            Business Details
          </TabsTrigger>
          <TabsTrigger value="contact-social" className="gap-2">
            <Share2 className="w-4 h-4" />
            Contact & Social
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Configure your website basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalForm.siteName}
                    onChange={(e) => setGeneralForm({ ...generalForm, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Site Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={generalForm.siteTagline}
                    onChange={(e) => setGeneralForm({ ...generalForm, siteTagline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={generalForm.metaDescription}
                    onChange={(e) => setGeneralForm({ ...generalForm, metaDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">Default Timezone</Label>
                  <Input
                    id="defaultTimezone"
                    value={generalForm.defaultTimezone}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultTimezone: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Currency & Financial</CardTitle>
                <CardDescription>Configure platform fee and currency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Input
                      id="defaultCurrency"
                      value={generalForm.defaultCurrency}
                      onChange={(e) => setGeneralForm({ ...generalForm, defaultCurrency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={generalForm.currencySymbol}
                      onChange={(e) => setGeneralForm({ ...generalForm, currencySymbol: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformCommission">Platform Commission (%)</Label>
                    <Input
                      id="platformCommission"
                      type="number"
                      value={generalForm.platformCommission}
                      onChange={(e) => setGeneralForm({ ...generalForm, platformCommission: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumCommission">Minimum Commission ({generalForm.currencySymbol})</Label>
                    <Input
                      id="minimumCommission"
                      type="number"
                      value={generalForm.minimumCommission}
                      onChange={(e) => setGeneralForm({ ...generalForm, minimumCommission: e.target.value })}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Platform fee is {generalForm.platformCommission}% of ticket price, minimum {generalForm.minimumCommission}{generalForm.currencySymbol} from buyer.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics & Tracking</CardTitle>
                <CardDescription>Configure analytics and tracking codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gtmId">Google Tag Manager ID</Label>
                  <Input
                    id="gtmId"
                    placeholder="GTM-XXXXXXX"
                    value={generalForm.gtmId}
                    onChange={(e) => setGeneralForm({ ...generalForm, gtmId: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business-details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>Business contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={businessForm.streetAddress}
                    onChange={(e) => setBusinessForm({ ...businessForm, streetAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Town</Label>
                  <Input
                    id="city"
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={businessForm.country}
                    onChange={(e) => setBusinessForm({ ...businessForm, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal/ZIP Code</Label>
                  <Input
                    id="postalCode"
                    value={businessForm.postalCode}
                    onChange={(e) => setBusinessForm({ ...businessForm, postalCode: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Social Tab */}
        <TabsContent value="contact-social">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Contact Information</CardTitle>
                <CardDescription>Customer support contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={socialForm.supportPhone}
                    onChange={(e) => setSocialForm({ ...socialForm, supportPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={socialForm.supportEmail}
                    onChange={(e) => setSocialForm({ ...socialForm, supportEmail: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Media Profiles</CardTitle>
                <CardDescription>Social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={socialForm.facebook}
                    onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={socialForm.instagram}
                    onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={socialForm.whatsapp}
                    onChange={(e) => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                    placeholder="+880 1234-567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={socialForm.telegram}
                    onChange={(e) => setSocialForm({ ...socialForm, telegram: e.target.value })}
                    placeholder="https://t.me/yourchannel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={socialForm.youtube}
                    onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
