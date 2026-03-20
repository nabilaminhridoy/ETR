'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Search, FileText, Facebook, Twitter, ImageIcon, Upload, Trash2, Monitor, Smartphone } from 'lucide-react'

interface SEOSettings {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  metaImage: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonicalUrl: string
  robotsTxt: string
}

const defaultSettings: SEOSettings = {
  metaTitle: 'EidTicketResell - Buy & Sell Eid Travel Tickets in Bangladesh',
  metaDescription: "Bangladesh's most trusted platform for buying and selling unused Eid travel tickets securely. Bus, Train, Launch, and Air tickets available.",
  metaKeywords: 'eid tickets, travel tickets, bangladesh tickets, bus tickets, train tickets, launch tickets, air tickets, ticket resale',
  metaImage: '',
  ogTitle: 'EidTicketResell - Safe Ticket Marketplace',
  ogDescription: 'Buy and sell unused Eid travel tickets safely. Verified sellers, secure payments.',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterTitle: 'EidTicketResell - Safe Ticket Marketplace',
  twitterDescription: 'Buy and sell unused Eid travel tickets safely. Verified sellers, secure payments.',
  twitterImage: '',
  canonicalUrl: 'https://eidticketresell.com',
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://eidticketresell.com/sitemap.xml`,
}

// Image Upload Component
function ImageUploader({
  label,
  image,
  onImageChange,
  type,
  recommendedSize,
}: {
  label: string
  image: string
  onImageChange: (url: string) => void
  type: 'meta' | 'facebook' | 'twitter'
  recommendedSize: string
}) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG, PNG, and WebP images are allowed.',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB.',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (image) {
        formData.append('oldImage', image)
      }

      const response = await fetch('/api/admin/seo-settings/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onImageChange(data.imageUrl)
        toast({
          title: 'Image uploaded',
          description: 'Image has been uploaded successfully.',
        })
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    if (!image) return

    try {
      // Delete from server
      await fetch(`/api/admin/seo-settings/upload?imageUrl=${encodeURIComponent(image)}`, {
        method: 'DELETE',
      })
      onImageChange('')
      toast({
        title: 'Image removed',
        description: 'Image has been removed successfully.',
      })
    } catch (error) {
      console.error('Delete error:', error)
      onImageChange('')
    }
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        {label}
      </Label>
      
      {/* Image Preview */}
      <div className="border-2 border-dashed rounded-lg overflow-hidden">
        {image ? (
          <div className="relative aspect-[1.91/1] bg-gray-100">
            <img
              src={image}
              alt={`${type} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full aspect-[1.91/1] flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs text-gray-400">{recommendedSize}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </p>
      )}
    </div>
  )
}

// Google Desktop Preview Component
function GoogleDesktopPreview({ settings }: { settings: SEOSettings }) {
  const displayUrl = settings.canonicalUrl.replace(/^https?:\/\//, '')
  
  return (
    <div className="bg-white rounded-lg p-4 max-w-[600px]">
      {/* Google Logo */}
      <div className="flex items-center gap-1 mb-4">
        <span className="text-[#4285f4] text-2xl font-medium">G</span>
        <span className="text-[#ea4335] text-2xl font-medium">o</span>
        <span className="text-[#fbbc05] text-2xl font-medium">o</span>
        <span className="text-[#4285f4] text-2xl font-medium">g</span>
        <span className="text-[#34a853] text-2xl font-medium">l</span>
        <span className="text-[#ea4335] text-2xl font-medium">e</span>
      </div>
      
      {/* Search Result */}
      <div className="space-y-1">
        {/* URL with breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          </div>
          <span className="text-[#202124]">{displayUrl}</span>
          <span className="text-[#70757a]"> › ...</span>
        </div>
        
        {/* Title */}
        <h3 className="text-[#1a0dab] text-xl font-normal hover:underline cursor-pointer leading-tight">
          {settings.metaTitle}
        </h3>
        
        {/* Description */}
        <p className="text-[#4d5156] text-sm leading-relaxed line-clamp-2">
          {settings.metaDate && (
            <span className="text-[#70757a]">{settings.metaDate} — </span>
          )}
          {settings.metaDescription}
        </p>
        
        {/* Sitelinks */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-2">
          <div className="cursor-pointer">
            <p className="text-[#1a0dab] text-sm hover:underline">Find Tickets</p>
            <p className="text-[#4d5156] text-xs truncate">Search for available travel tickets</p>
          </div>
          <div className="cursor-pointer">
            <p className="text-[#1a0dab] text-sm hover:underline">Sell Tickets</p>
            <p className="text-[#4d5156] text-xs truncate">List your unused tickets for sale</p>
          </div>
          <div className="cursor-pointer">
            <p className="text-[#1a0dab] text-sm hover:underline">How It Works</p>
            <p className="text-[#4d5156] text-xs truncate">Learn about our process</p>
          </div>
          <div className="cursor-pointer">
            <p className="text-[#1a0dab] text-sm hover:underline">FAQs</p>
            <p className="text-[#4d5156] text-xs truncate">Frequently asked questions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Google Mobile Preview Component
function GoogleMobilePreview({ settings }: { settings: SEOSettings }) {
  const displayUrl = settings.canonicalUrl.replace(/^https?:\/\//, '')
  
  return (
    <div className="bg-white rounded-2xl p-4 max-w-[320px] shadow-sm">
      {/* Search Result Card */}
      <div className="space-y-2">
        {/* Favicon and URL */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#202124] text-sm font-medium truncate">{displayUrl}</p>
          </div>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-[#1a0dab] text-base font-medium leading-tight">
          {settings.metaTitle}
        </h3>
        
        {/* Description */}
        <p className="text-[#4d5156] text-sm leading-relaxed line-clamp-2">
          {settings.metaDescription}
        </p>
        
        {/* Meta Image - if exists */}
        {settings.metaImage && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img 
              src={settings.metaImage} 
              alt="Page preview" 
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Related searches */}
      <div className="mt-4 pt-3 border-t">
        <p className="text-[#70757a] text-xs mb-2">Related searches</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#202124]">eid tickets bd</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#202124]">bus ticket</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#202124]">train ticket</span>
        </div>
      </div>
    </div>
  )
}

export default function SEOSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/seo-settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({ ...defaultSettings, ...data.settings })
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load SEO settings',
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
      const response = await fetch('/api/admin/seo-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'SEO settings have been updated successfully.',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save SEO settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to get preview image URL
  const getPreviewImage = (url: string) => {
    if (url) return url
    return '/og-image.png' // Default placeholder
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
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">Configure search engine optimization settings</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="meta" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta" className="gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Meta Tags</span>
          </TabsTrigger>
          <TabsTrigger value="facebook" className="gap-2">
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">Facebook</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="gap-2">
            <Twitter className="w-4 h-4" />
            <span className="hidden sm:inline">Twitter/X</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Meta Tags Tab */}
        <TabsContent value="meta" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Basic Meta Tags
                </CardTitle>
                <CardDescription>Basic meta tags for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">{settings.metaTitle.length}/60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.metaDescription}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">{settings.metaDescription.length}/160 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Textarea
                    id="metaKeywords"
                    value={settings.metaKeywords}
                    onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                </div>
              </CardContent>
            </Card>

            {/* Meta Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Meta Image
                </CardTitle>
                <CardDescription>Default image for search engine results</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  label="Meta Image"
                  image={settings.metaImage}
                  onImageChange={(url) => setSettings({ ...settings, metaImage: url })}
                  type="meta"
                  recommendedSize="Recommended: 1200 x 630 px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Google Search Previews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                Google Search Preview
              </CardTitle>
              <CardDescription>How your page may appear in Google search results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Desktop Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Monitor className="w-4 h-4" />
                    Desktop Preview
                  </div>
                  <div className="bg-[#f8f9fa] rounded-lg p-4 border">
                    <GoogleDesktopPreview settings={settings} />
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Smartphone className="w-4 h-4" />
                    Mobile Preview
                  </div>
                  <div className="bg-[#f8f9fa] rounded-lg p-4 border flex justify-center">
                    <GoogleMobilePreview settings={settings} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facebook/Open Graph Tab */}
        <TabsContent value="facebook" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  Facebook / Open Graph Settings
                </CardTitle>
                <CardDescription>Configure how your content appears when shared on Facebook</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OG Title</Label>
                  <Input
                    id="ogTitle"
                    value={settings.ogTitle}
                    onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })}
                    placeholder="Title shown when shared on Facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OG Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={settings.ogDescription}
                    onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })}
                    rows={2}
                    placeholder="Description shown when shared on Facebook"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Facebook Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Facebook Image
                </CardTitle>
                <CardDescription>Image shown when shared on Facebook</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  label="Facebook Share Image"
                  image={settings.ogImage}
                  onImageChange={(url) => setSettings({ ...settings, ogImage: url })}
                  type="facebook"
                  recommendedSize="Recommended: 1200 x 630 px"
                />
              </CardContent>
            </Card>

            {/* Facebook Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Facebook Preview</CardTitle>
                <CardDescription>How your link will appear on Facebook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-w-md bg-white">
                  {/* Image */}
                  <div className="aspect-[1.91/1] bg-gray-100 relative overflow-hidden">
                    <img
                      src={getPreviewImage(settings.ogImage || settings.metaImage)}
                      alt="Facebook preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-3 bg-gray-50 border-t">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {settings.canonicalUrl}
                    </p>
                    <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {settings.ogTitle || settings.metaTitle}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {settings.ogDescription || settings.metaDescription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Twitter Tab */}
        <TabsContent value="twitter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-sky-500" />
                  Twitter / X Settings
                </CardTitle>
                <CardDescription>Configure how your content appears when shared on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterCard">Twitter Card Type</Label>
                  <Select
                    value={settings.twitterCard}
                    onValueChange={(value) => setSettings({ ...settings, twitterCard: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Summary Large Image shows a bigger image preview
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input
                    id="twitterTitle"
                    value={settings.twitterTitle}
                    onChange={(e) => setSettings({ ...settings, twitterTitle: e.target.value })}
                    placeholder="Title shown on Twitter card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterDescription">Twitter Description</Label>
                  <Textarea
                    id="twitterDescription"
                    value={settings.twitterDescription}
                    onChange={(e) => setSettings({ ...settings, twitterDescription: e.target.value })}
                    rows={2}
                    placeholder="Description shown on Twitter card"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Twitter Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Twitter/X Image
                </CardTitle>
                <CardDescription>Image shown when shared on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  label="Twitter Share Image"
                  image={settings.twitterImage}
                  onImageChange={(url) => setSettings({ ...settings, twitterImage: url })}
                  type="twitter"
                  recommendedSize="Recommended: 1200 x 675 px"
                />
              </CardContent>
            </Card>

            {/* Twitter Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Twitter/X Preview</CardTitle>
                <CardDescription>How your link will appear on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent>
                {settings.twitterCard === 'summary_large_image' ? (
                  // Large Image Card Preview
                  <div className="border rounded-xl overflow-hidden max-w-md bg-white">
                    <div className="aspect-[1.91/1] bg-gray-100 relative overflow-hidden">
                      <img
                        src={getPreviewImage(settings.twitterImage || settings.ogImage || settings.metaImage)}
                        alt="Twitter preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 border-t">
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        {settings.canonicalUrl}
                      </p>
                      <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {settings.twitterTitle || settings.metaTitle}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {settings.twitterDescription || settings.metaDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Small Summary Card Preview
                  <div className="border rounded-xl overflow-hidden max-w-md bg-white">
                    <div className="flex">
                      <div className="w-24 h-24 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                        <img
                          src={getPreviewImage(settings.twitterImage || settings.ogImage || settings.metaImage)}
                          alt="Twitter preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex-1">
                        <p className="text-xs text-gray-500 mb-1 truncate">
                          {settings.canonicalUrl}
                        </p>
                        <p className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {settings.twitterTitle || settings.metaTitle}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {settings.twitterDescription || settings.metaDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Configure canonical URL and robots.txt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={settings.canonicalUrl}
                  onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
                <p className="text-xs text-muted-foreground">
                  The preferred URL for your website (without trailing slash)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="robotsTxt">robots.txt Content</Label>
                <Textarea
                  id="robotsTxt"
                  value={settings.robotsTxt}
                  onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image Size Reference</CardTitle>
              <CardDescription>Recommended image sizes for different platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Meta Image</span>
                  </div>
                  <p className="text-sm text-gray-600">Recommended: 1200 x 630 px</p>
                  <p className="text-xs text-gray-500 mt-1">Aspect ratio: 1.91:1</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Facebook (OG Image)</span>
                  </div>
                  <p className="text-sm text-gray-600">Recommended: 1200 x 630 px</p>
                  <p className="text-xs text-gray-500 mt-1">Aspect ratio: 1.91:1</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Twitter className="w-5 h-5 text-sky-500" />
                    <span className="font-medium">Twitter/X (Large Card)</span>
                  </div>
                  <p className="text-sm text-gray-600">Recommended: 1200 x 675 px</p>
                  <p className="text-xs text-gray-500 mt-1">Aspect ratio: 16:9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
