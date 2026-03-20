'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, Image as ImageIcon, Trash2, Check, X } from 'lucide-react'

interface BrandingSettings {
  logo: string
  favicon: string
  logoWidth: string
  logoHeight: string
}

const defaultSettings: BrandingSettings = {
  logo: '/logo.png',
  favicon: '/favicon.png',
  logoWidth: '200',
  logoHeight: '50',
}

export default function LogoFaviconPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/logo-favicon')
        if (response.ok) {
          const data = await response.json()
          setSettings({ ...defaultSettings, ...data.settings })
        }
      } catch (error) {
        console.error('Error fetching branding settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load branding settings',
          variant: 'destructive',
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Allowed types: JPEG, PNG, SVG, WebP',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB',
          variant: 'destructive',
        })
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Allowed types: PNG, ICO, JPEG',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB',
          variant: 'destructive',
        })
        return
      }

      setFaviconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      const response = await fetch('/api/admin/logo-favicon?type=logo', {
        method: 'DELETE',
      })

      if (response.ok) {
        setSettings({ ...settings, logo: '/logo.png' })
        setLogoFile(null)
        setLogoPreview(null)
        toast({
          title: 'Logo Removed',
          description: 'Logo has been reset to default.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove logo',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveFavicon = async () => {
    try {
      const response = await fetch('/api/admin/logo-favicon?type=favicon', {
        method: 'DELETE',
      })

      if (response.ok) {
        setSettings({ ...settings, favicon: '/favicon.png' })
        setFaviconFile(null)
        setFaviconPreview(null)
        toast({
          title: 'Favicon Removed',
          description: 'Favicon has been reset to default.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove favicon',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        formData.append('type', 'logo')
        formData.append('width', settings.logoWidth)
        formData.append('height', settings.logoHeight)
        formData.append('oldImage', settings.logo)

        const response = await fetch('/api/admin/logo-favicon', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (response.ok && data.imageUrl) {
          setSettings({ ...settings, logo: data.imageUrl })
          setLogoFile(null)
          setLogoPreview(null)
        } else {
          throw new Error(data.error || 'Failed to upload logo')
        }
      }

      // Upload favicon if changed
      if (faviconFile) {
        const formData = new FormData()
        formData.append('file', faviconFile)
        formData.append('type', 'favicon')
        formData.append('oldImage', settings.favicon)

        const response = await fetch('/api/admin/logo-favicon', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (response.ok && data.imageUrl) {
          setSettings({ ...settings, favicon: data.imageUrl })
          setFaviconFile(null)
          setFaviconPreview(null)
        } else {
          throw new Error(data.error || 'Failed to upload favicon')
        }
      }

      // Save dimensions
      const formData = new FormData()
      formData.append('type', 'logo')
      formData.append('width', settings.logoWidth)
      formData.append('height', settings.logoHeight)

      await fetch('/api/admin/logo-favicon', {
        method: 'POST',
        body: formData,
      })

      toast({
        title: 'Settings Saved',
        description: 'Logo and favicon have been updated successfully.',
      })
    } catch (error) {
      console.error('Error saving branding settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = logoFile || faviconFile

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
          <h1 className="text-2xl font-bold">Logo & Favicon</h1>
          <p className="text-muted-foreground">Upload and manage your site branding assets</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Site Logo
            </CardTitle>
            <CardDescription>Upload your website logo (recommended: 200x50px, PNG/SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {logoPreview || settings.logo ? (
                  <Image
                    src={logoPreview || settings.logo}
                    alt="Logo Preview"
                    width={200}
                    height={50}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No logo uploaded</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </div>
                  <Input
                    ref={logoInputRef}
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </Label>
                {(logoPreview || settings.logo !== '/logo.png') && (
                  <Button variant="outline" size="icon" onClick={handleRemoveLogo}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {logoFile && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <Upload className="w-4 h-4" />
                  <span>Pending upload: {logoFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Logo Dimensions</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoWidth" className="text-xs text-muted-foreground">Width (px)</Label>
                  <Input
                    id="logoWidth"
                    type="number"
                    value={settings.logoWidth}
                    onChange={(e) => setSettings({ ...settings, logoWidth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="logoHeight" className="text-xs text-muted-foreground">Height (px)</Label>
                  <Input
                    id="logoHeight"
                    type="number"
                    value={settings.logoHeight}
                    onChange={(e) => setSettings({ ...settings, logoHeight: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favicon Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Favicon
            </CardTitle>
            <CardDescription>Upload your favicon (recommended: 32x32px, ICO/PNG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {faviconPreview || settings.favicon ? (
                  <Image
                    src={faviconPreview || settings.favicon}
                    alt="Favicon Preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No favicon</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Label htmlFor="favicon-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Favicon
                  </div>
                  <Input
                    ref={faviconInputRef}
                    id="favicon-upload"
                    type="file"
                    accept="image/png,image/x-icon,image/ico"
                    className="hidden"
                    onChange={handleFaviconChange}
                  />
                </Label>
                {(faviconPreview || settings.favicon !== '/favicon.png') && (
                  <Button variant="outline" size="icon" onClick={handleRemoveFavicon}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {faviconFile && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <Upload className="w-4 h-4" />
                  <span>Pending upload: {faviconFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => {
                      setFaviconFile(null)
                      setFaviconPreview(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Use a square image for best results</li>
                <li>• ICO format works best for browser compatibility</li>
                <li>• PNG works well for modern browsers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>See how your branding will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Image
              src={faviconPreview || settings.favicon}
              alt="Favicon"
              width={16}
              height={16}
              className="w-4 h-4"
              unoptimized
            />
            <Image
              src={logoPreview || settings.logo}
              alt="Logo"
              width={parseInt(settings.logoWidth) || 150}
              height={parseInt(settings.logoHeight) || 40}
              className="h-8 w-auto"
              unoptimized
            />
            <span className="text-sm text-muted-foreground ml-2">
              EidTicketResell
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
