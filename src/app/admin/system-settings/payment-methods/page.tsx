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
import { 
  Loader2, CreditCard, CheckCircle2, XCircle, RefreshCw, Eye, EyeOff,
  Globe, Key, Link as LinkIcon, Webhook, ArrowRightLeft, AlertCircle,
  BookOpen, ExternalLink, Settings, Shield
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BkashConfig {
  isEnabled: boolean
  isSandbox: boolean
  label: string
  description: string
  credentials: {
    appKey: string
    appSecret: string
    username: string
    password: string
  }
}

interface UddoktaPayConfig {
  isEnabled: boolean
  isSandbox: boolean
  label: string
  description: string
  apiKey: string
  baseUrl: string
  apiType: string
  redirectUrl: string
  cancelUrl: string
  webhookUrl: string
}

interface UpayConfig {
  isEnabled: boolean
  isSandbox: boolean
  label: string
  description: string
  merchantId: string
  merchantKey: string
  merchantName: string
  merchantCode: string
  merchantMobile: string
  merchantCity: string
  merchantCountryCode: string
  merchantCategoryCode: string
  transactionCurrencyCode: string
}

interface SSLCommerzConfig {
  isEnabled: boolean
  isSandbox: boolean
  label: string
  description: string
  storeId: string
  storePassword: string
  successUrl: string
  failUrl: string
  cancelUrl: string
  ipnUrl: string
  currency: string
  productCategory: string
}

export default function PaymentMethodsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})
  
  const [bkashForm, setBkashForm] = useState<BkashConfig>({
    isEnabled: false,
    isSandbox: true,
    label: 'bKash',
    description: 'Pay securely using bKash mobile wallet',
    credentials: {
      appKey: '',
      appSecret: '',
      username: '',
      password: '',
    },
  })

  const [nagadForm, setNagadForm] = useState({
    isEnabled: false,
    isSandbox: true,
    label: 'Nagad',
    description: 'Pay securely using Nagad mobile wallet',
    merchantId: '',
    merchantPrivateKey: '',
    merchantPublicKey: '',
    nagadPublicKey: '',
    apiVersion: 'v-0.2.0',
  })

  const [uddoktaPayForm, setUddoktaPayForm] = useState<UddoktaPayConfig>({
    isEnabled: false,
    isSandbox: true,
    label: 'UddoktaPay',
    description: 'Pay using multiple payment methods via UddoktaPay',
    apiKey: '',
    baseUrl: '',
    apiType: 'checkout-v2',
    redirectUrl: '',
    cancelUrl: '',
    webhookUrl: '',
  })

  const [pipraPayForm, setPipraPayForm] = useState({
    isEnabled: false,
    isSandbox: true,
    label: 'PipraPay',
    description: 'Pay using multiple payment methods via PipraPay',
    apiKey: '',
    baseUrl: '',
    redirectUrl: '',
    cancelUrl: '',
    webhookUrl: '',
    currency: 'BDT',
    returnType: 'POST',
  })

  const [upayForm, setUpayForm] = useState<UpayConfig>({
    isEnabled: false,
    isSandbox: true,
    label: 'Upay',
    description: 'Pay using Upay payment gateway',
    merchantId: '',
    merchantKey: '',
    merchantName: '',
    merchantCode: '',
    merchantMobile: '',
    merchantCity: 'Dhaka',
    merchantCountryCode: 'BD',
    merchantCategoryCode: '',
    transactionCurrencyCode: 'BDT',
  })

  const [sslCommerzForm, setSSLCommerzForm] = useState<SSLCommerzConfig>({
    isEnabled: false,
    isSandbox: true,
    label: 'SSLCommerz',
    description: 'Pay securely using SSLCommerz payment gateway',
    storeId: '',
    storePassword: '',
    successUrl: '',
    failUrl: '',
    cancelUrl: '',
    ipnUrl: '',
    currency: 'BDT',
    productCategory: 'ticket',
  })

  // API Type options for UddoktaPay
  const uddoktaPayApiTypes = [
    { value: 'checkout', label: 'Checkout (IPN)', description: 'Basic checkout with IPN notification' },
    { value: 'checkout-v2', label: 'Checkout V2 (Success Page)', description: 'Advanced checkout with success page notification (Recommended)' },
    { value: 'checkout/global', label: 'Checkout Global (IPN)', description: 'Global basic checkout with IPN' },
    { value: 'checkout-v2/global', label: 'Checkout V2 Global', description: 'Global advanced checkout with success page' },
  ]

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    setIsLoading(true)
    try {
      // Load bKash config
      const bkashRes = await fetch('/api/admin/payment-gateways/bkash')
      if (bkashRes.ok) {
        const data = await bkashRes.json()
        if (data.gateway) {
          setBkashForm({
            isEnabled: data.gateway.isEnabled || false,
            isSandbox: data.gateway.isSandbox !== false,
            label: data.gateway.label || 'bKash',
            description: data.gateway.description || 'Pay securely using bKash mobile wallet',
            credentials: {
              appKey: data.gateway.credentials?.appKey || '',
              appSecret: data.gateway.credentials?.appSecret || '',
              username: data.gateway.credentials?.username || '',
              password: data.gateway.credentials?.password || '',
            },
          })
        }
      }

      // Load UddoktaPay config
      const uddoktaRes = await fetch('/api/admin/payment-gateways/uddoktapay')
      if (uddoktaRes.ok) {
        const data = await uddoktaRes.json()
        if (data.gateway) {
          setUddoktaPayForm({
            isEnabled: data.gateway.isEnabled || false,
            isSandbox: data.gateway.isSandbox !== false,
            label: data.gateway.label || 'UddoktaPay',
            description: data.gateway.description || 'Pay using multiple payment methods via UddoktaPay',
            apiKey: data.gateway.credentials?.apiKey || '',
            baseUrl: data.gateway.credentials?.baseUrl || '',
            apiType: data.gateway.credentials?.apiType || 'checkout-v2',
            redirectUrl: data.gateway.credentials?.redirectUrl || '',
            cancelUrl: data.gateway.credentials?.cancelUrl || '',
            webhookUrl: data.gateway.credentials?.webhookUrl || '',
          })
        }
      }

      // Load Nagad config
      const nagadRes = await fetch('/api/admin/payment-gateways/nagad')
      if (nagadRes.ok) {
        const data = await nagadRes.json()
        if (data.isEnabled !== undefined || data.credentials) {
          setNagadForm({
            isEnabled: data.isEnabled || false,
            isSandbox: data.isSandbox !== false,
            label: data.label || 'Nagad',
            description: data.description || 'Pay securely using Nagad mobile wallet',
            merchantId: data.credentials?.merchantId || '',
            merchantPrivateKey: data.credentials?.merchantPrivateKey || '',
            merchantPublicKey: data.credentials?.merchantPublicKey || '',
            nagadPublicKey: data.credentials?.nagadPublicKey || '',
            apiVersion: data.credentials?.apiVersion || 'v-0.2.0',
          })
        }
      }

      // Load PipraPay config
      const pipraRes = await fetch('/api/admin/payment-gateways/piprapay')
      if (pipraRes.ok) {
        const data = await pipraRes.json()
        if (data.gateway) {
          setPipraPayForm({
            isEnabled: data.gateway.isEnabled || false,
            isSandbox: data.gateway.isSandbox !== false,
            label: data.gateway.label || 'PipraPay',
            description: data.gateway.description || 'Pay using multiple payment methods via PipraPay',
            apiKey: data.gateway.credentials?.apiKey || '',
            baseUrl: data.gateway.credentials?.baseUrl || '',
            redirectUrl: data.gateway.credentials?.redirectUrl || '',
            cancelUrl: data.gateway.credentials?.cancelUrl || '',
            webhookUrl: data.gateway.credentials?.webhookUrl || '',
            currency: data.gateway.credentials?.currency || 'BDT',
            returnType: data.gateway.credentials?.returnType || 'POST',
          })
        }
      }

      // Load Upay config
      const upayRes = await fetch('/api/admin/payment-gateways/upay')
      if (upayRes.ok) {
        const data = await upayRes.json()
        if (data.gateway) {
          setUpayForm({
            isEnabled: data.gateway.isEnabled || false,
            isSandbox: data.gateway.isSandbox !== false,
            label: data.gateway.label || 'Upay',
            description: data.gateway.description || 'Pay using Upay payment gateway',
            merchantId: data.gateway.credentials?.merchantId || '',
            merchantKey: data.gateway.credentials?.merchantKey || '',
            merchantName: data.gateway.credentials?.merchantName || '',
            merchantCode: data.gateway.credentials?.merchantCode || '',
            merchantMobile: data.gateway.credentials?.merchantMobile || '',
            merchantCity: data.gateway.credentials?.merchantCity || 'Dhaka',
            merchantCountryCode: data.gateway.credentials?.merchantCountryCode || 'BD',
            merchantCategoryCode: data.gateway.credentials?.merchantCategoryCode || '',
            transactionCurrencyCode: data.gateway.credentials?.transactionCurrencyCode || 'BDT',
          })
        }
      }

      // Load SSLCommerz config
      const sslcommerzRes = await fetch('/api/admin/payment-gateways/sslcommerz')
      if (sslcommerzRes.ok) {
        const data = await sslcommerzRes.json()
        if (data.gateway) {
          setSSLCommerzForm({
            isEnabled: data.gateway.isEnabled || false,
            isSandbox: data.gateway.isSandbox !== false,
            label: data.gateway.label || 'SSLCommerz',
            description: data.gateway.description || 'Pay securely using SSLCommerz payment gateway',
            storeId: data.gateway.credentials?.storeId || '',
            storePassword: '',
            successUrl: data.gateway.credentials?.successUrl || '',
            failUrl: data.gateway.credentials?.failUrl || '',
            cancelUrl: data.gateway.credentials?.cancelUrl || '',
            ipnUrl: data.gateway.credentials?.ipnUrl || '',
            currency: data.gateway.credentials?.currency || 'BDT',
            productCategory: data.gateway.credentials?.productCategory || 'ticket',
          })
        }
      }
    } catch (error) {
      console.error('Error loading configs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBkash = async () => {
    setIsSaving('bkash')
    try {
      const response = await fetch('/api/admin/payment-gateways/bkash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: bkashForm.isEnabled,
          isSandbox: bkashForm.isSandbox,
          label: bkashForm.label,
          description: bkashForm.description,
          credentials: bkashForm.credentials,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'bKash Configuration Saved',
          description: 'Your bKash payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save bKash configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bKash configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleSaveUddoktaPay = async () => {
    setIsSaving('uddoktapay')
    try {
      const response = await fetch('/api/admin/payment-gateways/uddoktapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: uddoktaPayForm.isEnabled,
          isSandbox: uddoktaPayForm.isSandbox,
          label: uddoktaPayForm.label,
          description: uddoktaPayForm.description,
          credentials: {
            apiKey: uddoktaPayForm.apiKey,
            baseUrl: uddoktaPayForm.baseUrl,
            apiType: uddoktaPayForm.apiType,
            redirectUrl: uddoktaPayForm.redirectUrl,
            cancelUrl: uddoktaPayForm.cancelUrl,
            webhookUrl: uddoktaPayForm.webhookUrl,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'UddoktaPay Configuration Saved',
          description: 'Your UddoktaPay payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save UddoktaPay configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save UddoktaPay configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleTestUddoktaPay = async () => {
    setIsTesting('uddoktapay')
    setTestResult(null)
    try {
      const response = await fetch('/api/admin/payment-gateways/uddoktapay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: uddoktaPayForm.apiKey,
          baseUrl: uddoktaPayForm.baseUrl || (uddoktaPayForm.isSandbox 
            ? 'https://sandbox.uddoktapay.com/api' 
            : ''),
        }),
      })

      const data = await response.json()

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connection successful!' : 'Connection failed'),
      })

      toast({
        title: data.success ? 'Connection Successful' : 'Connection Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test connection',
      })
      toast({
        title: 'Test Failed',
        description: 'Failed to connect to UddoktaPay gateway',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(null)
    }
  }

  const handleSaveNagad = async () => {
    setIsSaving('nagad')
    try {
      const response = await fetch('/api/admin/payment-gateways/nagad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: nagadForm.isEnabled,
          isSandbox: nagadForm.isSandbox,
          label: nagadForm.label,
          description: nagadForm.description,
          credentials: {
            merchantId: nagadForm.merchantId,
            merchantPrivateKey: nagadForm.merchantPrivateKey,
            merchantPublicKey: nagadForm.merchantPublicKey,
            nagadPublicKey: nagadForm.nagadPublicKey,
            apiVersion: nagadForm.apiVersion,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Nagad Configuration Saved',
          description: 'Your Nagad payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save Nagad configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save Nagad configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
  }

  const toggleShowCredential = (field: string) => {
    setShowCredentials(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSavePipraPay = async () => {
    setIsSaving('piprapay')
    try {
      const response = await fetch('/api/admin/payment-gateways/piprapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: pipraPayForm.isEnabled,
          isSandbox: pipraPayForm.isSandbox,
          label: pipraPayForm.label,
          description: pipraPayForm.description,
          credentials: {
            apiKey: pipraPayForm.apiKey,
            baseUrl: pipraPayForm.baseUrl,
            redirectUrl: pipraPayForm.redirectUrl,
            cancelUrl: pipraPayForm.cancelUrl,
            webhookUrl: pipraPayForm.webhookUrl,
            currency: pipraPayForm.currency,
            returnType: pipraPayForm.returnType,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'PipraPay Configuration Saved',
          description: 'Your PipraPay payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save PipraPay configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save PipraPay configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleTestPipraPay = async () => {
    setIsTesting('piprapay')
    setTestResult(null)
    try {
      const response = await fetch('/api/admin/payment-gateways/piprapay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: pipraPayForm.apiKey,
          baseUrl: pipraPayForm.baseUrl || (pipraPayForm.isSandbox 
            ? 'https://sandbox.piprapay.com' 
            : ''),
        }),
      })

      const data = await response.json()

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connection successful!' : 'Connection failed'),
      })

      toast({
        title: data.success ? 'Connection Successful' : 'Connection Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test connection',
      })
      toast({
        title: 'Test Failed',
        description: 'Failed to connect to PipraPay gateway',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(null)
    }
  }

  const handleSaveUpay = async () => {
    setIsSaving('upay')
    try {
      const response = await fetch('/api/admin/payment-gateways/upay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: upayForm.isEnabled,
          isSandbox: upayForm.isSandbox,
          label: upayForm.label,
          description: upayForm.description,
          credentials: {
            merchantId: upayForm.merchantId,
            merchantKey: upayForm.merchantKey,
            merchantName: upayForm.merchantName,
            merchantCode: upayForm.merchantCode,
            merchantMobile: upayForm.merchantMobile,
            merchantCity: upayForm.merchantCity,
            merchantCountryCode: upayForm.merchantCountryCode,
            merchantCategoryCode: upayForm.merchantCategoryCode,
            transactionCurrencyCode: upayForm.transactionCurrencyCode,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Upay Configuration Saved',
          description: 'Your Upay payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save Upay configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save Upay configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
  }

  const handleSaveSSLCommerz = async () => {
    setIsSaving('sslcommerz')
    try {
      const response = await fetch('/api/admin/payment-gateways/sslcommerz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: sslCommerzForm.isEnabled,
          isSandbox: sslCommerzForm.isSandbox,
          label: sslCommerzForm.label,
          description: sslCommerzForm.description,
          credentials: {
            storeId: sslCommerzForm.storeId,
            storePassword: sslCommerzForm.storePassword,
            successUrl: sslCommerzForm.successUrl,
            failUrl: sslCommerzForm.failUrl,
            cancelUrl: sslCommerzForm.cancelUrl,
            ipnUrl: sslCommerzForm.ipnUrl,
            currency: sslCommerzForm.currency,
            productCategory: sslCommerzForm.productCategory,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'SSLCommerz Configuration Saved',
          description: 'Your SSLCommerz payment gateway settings have been saved successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save SSLCommerz configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save SSLCommerz configuration',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(null)
    }
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
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Configure payment gateways for receiving payments</p>
        </div>
      </div>

      <Tabs defaultValue="bkash" className="space-y-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="bkash" className="gap-2">
            <span>bKash</span>
            {bkashForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="nagad" className="gap-2">
            <span>Nagad</span>
            {nagadForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upay" className="gap-2">
            <span>Upay</span>
            {upayForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sslcommerz" className="gap-2">
            <span>SSLCommerz</span>
            {sslCommerzForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="uddoktapay" className="gap-2">
            <span>UddoktaPay</span>
            {uddoktaPayForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="piprapay" className="gap-2">
            <span>PipraPay</span>
            {pipraPayForm.isEnabled && (
              <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs bg-green-600">Active</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* UddoktaPay */}
        <TabsContent value="uddoktapay">
          <div className="space-y-6">
            {/* Main Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      UddoktaPay Payment Gateway
                    </CardTitle>
                    <CardDescription>
                      Self-hosted payment automation software for Bangladesh
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={uddoktaPayForm.isEnabled}
                        onCheckedChange={(checked) => setUddoktaPayForm({ ...uddoktaPayForm, isEnabled: checked })}
                      />
                      <span className="text-sm font-medium">{uddoktaPayForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : uddoktaPayForm.isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? 'Loading...' : uddoktaPayForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                    </span>
                  </div>
                  <Badge variant={uddoktaPayForm.isSandbox ? 'secondary' : 'default'}>
                    {uddoktaPayForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                  </Badge>
                </div>

                {/* Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <Label className="font-semibold">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable for testing. Disable for production payments.
                    </p>
                  </div>
                  <Switch
                    checked={uddoktaPayForm.isSandbox}
                    onCheckedChange={(checked) => setUddoktaPayForm({ ...uddoktaPayForm, isSandbox: checked })}
                  />
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Display Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how this payment method appears to customers on the checkout page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-label">Label</Label>
                      <Input
                        id="uddoktapay-label"
                        value={uddoktaPayForm.label}
                        onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, label: e.target.value })}
                        placeholder="e.g., UddoktaPay"
                      />
                      <p className="text-xs text-muted-foreground">The name shown to customers at checkout</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-description">Description</Label>
                      <Input
                        id="uddoktapay-description"
                        value={uddoktaPayForm.description}
                        onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, description: e.target.value })}
                        placeholder="e.g., Pay using multiple payment methods"
                      />
                      <p className="text-xs text-muted-foreground">Brief description shown below the label</p>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get your API credentials from UddoktaPay dashboard.{' '}
                    <a 
                      href="https://uddoktapay.readme.io/reference/api-information" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Documentation
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* API Key */}
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-apiKey">API Key</Label>
                      <div className="relative">
                        <Input
                          id="uddoktapay-apiKey"
                          type={showCredentials['uddoktapay-apiKey'] ? 'text' : 'password'}
                          value={uddoktaPayForm.apiKey}
                          onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, apiKey: e.target.value })}
                          placeholder={uddoktaPayForm.isSandbox ? "982d381360a69d419689740d9f2e26ce36fb7a50" : "Enter your API Key"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowCredential('uddoktapay-apiKey')}
                        >
                          {showCredentials['uddoktapay-apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Base URL */}
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-baseUrl">Base URL</Label>
                      <Input
                        id="uddoktapay-baseUrl"
                        value={uddoktaPayForm.baseUrl}
                        onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, baseUrl: e.target.value })}
                        placeholder={uddoktaPayForm.isSandbox ? "https://sandbox.uddoktapay.com/api" : "https://yourdomain.com/api"}
                      />
                      {uddoktaPayForm.isSandbox && (
                        <p className="text-xs text-muted-foreground">
                          Sandbox URL: https://sandbox.uddoktapay.com/api
                        </p>
                      )}
                    </div>
                  </div>

                  {/* API Type */}
                  <div className="space-y-2">
                    <Label htmlFor="uddoktapay-apiType">API Type</Label>
                    <Select
                      value={uddoktaPayForm.apiType}
                      onValueChange={(value) => setUddoktaPayForm({ ...uddoktaPayForm, apiType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select API Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {uddoktaPayApiTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">- {type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Checkout V2 is recommended for most use cases. It provides success page notifications.
                    </p>
                  </div>
                </div>

                {/* URL Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    URL Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Redirect URL */}
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-redirectUrl">Success Redirect URL</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="uddoktapay-redirectUrl"
                          value={uddoktaPayForm.redirectUrl}
                          onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, redirectUrl: e.target.value })}
                          placeholder="https://yoursite.com/payment/success"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">User redirected here after successful payment</p>
                    </div>

                    {/* Cancel URL */}
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-cancelUrl">Cancel URL</Label>
                      <div className="relative">
                        <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="uddoktapay-cancelUrl"
                          value={uddoktaPayForm.cancelUrl}
                          onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, cancelUrl: e.target.value })}
                          placeholder="https://yoursite.com/payment/cancel"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">User redirected here if payment cancelled</p>
                    </div>

                    {/* Webhook URL */}
                    <div className="space-y-2">
                      <Label htmlFor="uddoktapay-webhookUrl">Webhook URL (IPN)</Label>
                      <div className="relative">
                        <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="uddoktapay-webhookUrl"
                          value={uddoktaPayForm.webhookUrl}
                          onChange={(e) => setUddoktaPayForm({ ...uddoktaPayForm, webhookUrl: e.target.value })}
                          placeholder="https://yoursite.com/api/webhook/uddoktapay"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">For IPN notifications (optional for V2)</p>
                    </div>
                  </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    API Endpoints Reference
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Sandbox Base URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://sandbox.uddoktapay.com/api
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Create Charge:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /checkout-v2
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Verify Payment:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /verify-payment
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Refund Payment:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /refund-payment
                      </code>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <a 
                      href="https://uddoktapay.readme.io/reference/create-charge-api-guideline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Create Charge Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://uddoktapay.readme.io/reference/verify-payment-api-guideline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Verify Payment Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://uddoktapay.readme.io/reference/validate-webhook" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Webhook Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button 
                    className="btn-primary"
                    onClick={handleSaveUddoktaPay} 
                    disabled={isSaving === 'uddoktapay'}
                  >
                    {isSaving === 'uddoktapay' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleTestUddoktaPay} 
                    disabled={isTesting === 'uddoktapay' || !uddoktaPayForm.apiKey}
                  >
                    {isTesting === 'uddoktapay' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">{testResult.message}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Abilities Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  API Key Abilities
                </CardTitle>
                <CardDescription>
                  Required permissions for your API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">payment:checkout</p>
                      <p className="text-xs text-muted-foreground">Create payment requests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">payment:verify</p>
                      <p className="text-xs text-muted-foreground">Verify payment status</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">payment:refund</p>
                      <p className="text-xs text-muted-foreground">Process refunds</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Create your API key with all three abilities in UddoktaPay dashboard: Brand Settings → API
                </p>
              </CardContent>
            </Card>

            {/* Create Charge Request Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Create Charge Request Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "full_name": "Customer Name",
  "email": "customer@email.com",
  "amount": 100,
  "metadata": {
    "order_id": "ORDER_123",
    "customer_id": "CUST_456"
  },
  "redirect_url": "` + (uddoktaPayForm.redirectUrl || 'https://yoursite.com/success') + `",
  "return_type": "GET",
  "cancel_url": "` + (uddoktaPayForm.cancelUrl || 'https://yoursite.com/cancel') + `",
  "webhook_url": "` + (uddoktaPayForm.webhookUrl || 'https://yoursite.com/webhook') + `"
}`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Response includes <code className="bg-muted px-1 rounded">payment_url</code> to redirect customer
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* bKash */}
        <TabsContent value="bkash">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    bKash Tokenized Checkout
                  </CardTitle>
                  <CardDescription>
                    Configure bKash tokenized checkout for secure payments
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bkashForm.isEnabled}
                      onCheckedChange={(checked) => setBkashForm({ ...bkashForm, isEnabled: checked })}
                    />
                    <span className="text-sm font-medium">{bkashForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : bkashForm.isEnabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoading ? 'Loading...' : bkashForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                  </span>
                </div>
                <Badge variant={bkashForm.isSandbox ? 'secondary' : 'default'}>
                  {bkashForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                </Badge>
              </div>

              {/* Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                  <Label className="font-semibold">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable for testing. Disable for production payments.
                  </p>
                </div>
                <Switch
                  checked={bkashForm.isSandbox}
                  onCheckedChange={(checked) => setBkashForm({ ...bkashForm, isSandbox: checked })}
                />
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Display Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how this payment method appears to customers on the checkout page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bkash-label">Label</Label>
                    <Input
                      id="bkash-label"
                      value={bkashForm.label}
                      onChange={(e) => setBkashForm({ ...bkashForm, label: e.target.value })}
                      placeholder="e.g., bKash"
                    />
                    <p className="text-xs text-muted-foreground">The name shown to customers at checkout</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bkash-description">Description</Label>
                    <Input
                      id="bkash-description"
                      value={bkashForm.description}
                      onChange={(e) => setBkashForm({ ...bkashForm, description: e.target.value })}
                      placeholder="e.g., Pay securely using bKash mobile wallet"
                    />
                    <p className="text-xs text-muted-foreground">Brief description shown below the label</p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <h3 className="font-semibold">API Credentials</h3>
                <p className="text-sm text-muted-foreground">
                  Get your credentials from the bKash Payment Gateway Portal.{' '}
                  <a 
                    href="https://support.pgw-int.bkash.com/#/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Get Credentials
                  </a>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bkash-appKey">App Key</Label>
                    <div className="relative">
                      <Input
                        id="bkash-appKey"
                        type={showCredentials['appKey'] ? 'text' : 'password'}
                        value={bkashForm.credentials.appKey}
                        onChange={(e) => setBkashForm({
                          ...bkashForm,
                          credentials: { ...bkashForm.credentials, appKey: e.target.value }
                        })}
                        placeholder="Enter App Key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('appKey')}
                      >
                        {showCredentials['appKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bkash-appSecret">App Secret</Label>
                    <div className="relative">
                      <Input
                        id="bkash-appSecret"
                        type={showCredentials['appSecret'] ? 'text' : 'password'}
                        value={bkashForm.credentials.appSecret}
                        onChange={(e) => setBkashForm({
                          ...bkashForm,
                          credentials: { ...bkashForm.credentials, appSecret: e.target.value }
                        })}
                        placeholder="Enter App Secret"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('appSecret')}
                      >
                        {showCredentials['appSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bkash-username">Username</Label>
                    <Input
                      id="bkash-username"
                      value={bkashForm.credentials.username}
                      onChange={(e) => setBkashForm({
                        ...bkashForm,
                        credentials: { ...bkashForm.credentials, username: e.target.value }
                      })}
                      placeholder="Enter Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bkash-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="bkash-password"
                        type={showCredentials['password'] ? 'text' : 'password'}
                        value={bkashForm.credentials.password}
                        onChange={(e) => setBkashForm({
                          ...bkashForm,
                          credentials: { ...bkashForm.credentials, password: e.target.value }
                        })}
                        placeholder="Enter Password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowCredential('password')}
                      >
                        {showCredentials['password'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Endpoints Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">API Endpoints</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Sandbox:</span>{' '}
                    <code className="bg-background px-1 py-0.5 rounded">
                      https://tokenized.sandbox.bka.sh/v1.2.0-beta
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Production:</span>{' '}
                    <code className="bg-background px-1 py-0.5 rounded">
                      https://tokenized.pay.bka.sh/v1.2.0-beta
                    </code>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button 
                  className="btn-primary"
                  onClick={handleSaveBkash} 
                  disabled={isSaving === 'bkash'}
                >
                  {isSaving === 'bkash' ? (
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

        {/* Nagad */}
        <TabsContent value="nagad">
          <div className="space-y-6">
            {/* Main Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Nagad Payment Gateway
                    </CardTitle>
                    <CardDescription>
                      Configure Nagad Online Payment Gateway (API v3.3)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={nagadForm.isEnabled}
                        onCheckedChange={(checked) => setNagadForm({ ...nagadForm, isEnabled: checked })}
                      />
                      <span className="text-sm font-medium">{nagadForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : nagadForm.isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? 'Loading...' : nagadForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                    </span>
                  </div>
                  <Badge variant={nagadForm.isSandbox ? 'secondary' : 'default'}>
                    {nagadForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                  </Badge>
                </div>

                {/* Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <Label className="font-semibold">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable for testing. Disable for production payments.
                    </p>
                  </div>
                  <Switch
                    checked={nagadForm.isSandbox}
                    onCheckedChange={(checked) => setNagadForm({ ...nagadForm, isSandbox: checked })}
                  />
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Display Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how this payment method appears to customers on the checkout page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nagad-label">Label</Label>
                      <Input
                        id="nagad-label"
                        value={nagadForm.label}
                        onChange={(e) => setNagadForm({ ...nagadForm, label: e.target.value })}
                        placeholder="e.g., Nagad"
                      />
                      <p className="text-xs text-muted-foreground">The name shown to customers at checkout</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nagad-description">Description</Label>
                      <Input
                        id="nagad-description"
                        value={nagadForm.description}
                        onChange={(e) => setNagadForm({ ...nagadForm, description: e.target.value })}
                        placeholder="e.g., Pay securely using Nagad mobile wallet"
                      />
                      <p className="text-xs text-muted-foreground">Brief description shown below the label</p>
                    </div>
                  </div>
                </div>

                {/* RSA Key Generation Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Key className="w-4 h-4" />
                    RSA Key Pair Setup
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Generate RSA key pair for secure communication. You need to:
                  </p>
                  <ol className="text-xs text-blue-600 dark:text-blue-400 list-decimal list-inside space-y-1">
                    <li>Generate RSA key pair using the button below</li>
                    <li>Upload your Public Key to Nagad Portal</li>
                    <li>Copy Nagad&apos;s Public Key from their portal</li>
                    <li>Keep your Private Key secure (never share it)</li>
                  </ol>
                </div>

                {/* Credentials */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Merchant ID */}
                    <div className="space-y-2">
                      <Label htmlFor="nagad-merchantId">Merchant ID</Label>
                      <Input
                        id="nagad-merchantId"
                        placeholder="e.g., 687450000031324"
                        value={nagadForm.merchantId}
                        onChange={(e) => setNagadForm({ ...nagadForm, merchantId: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">15-digit merchant ID from Nagad portal</p>
                    </div>

                    {/* API Version */}
                    <div className="space-y-2">
                      <Label htmlFor="nagad-apiVersion">API Version</Label>
                      <Select
                        value={nagadForm.apiVersion}
                        onValueChange={(value) => setNagadForm({ ...nagadForm, apiVersion: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select API Version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v-0.2.0">v-0.2.0 (Basic)</SelectItem>
                          <SelectItem value="v-3.0.1">v-3.0.1 (With Service Fee)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">v-3.0.1 supports sender fee</p>
                    </div>
                  </div>

                  {/* Private Key */}
                  <div className="space-y-2">
                    <Label htmlFor="nagad-privateKey">Merchant Private Key</Label>
                    <div className="relative">
                      <textarea
                        id="nagad-privateKey"
                        className="w-full min-h-[100px] p-3 text-xs font-mono bg-background border rounded-lg resize-y"
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                        value={nagadForm.merchantPrivateKey}
                        onChange={(e) => setNagadForm({ ...nagadForm, merchantPrivateKey: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your RSA private key for signing requests. Keep this secure!</p>
                  </div>

                  {/* Public Key */}
                  <div className="space-y-2">
                    <Label htmlFor="nagad-publicKey">Merchant Public Key</Label>
                    <div className="relative">
                      <textarea
                        id="nagad-publicKey"
                        className="w-full min-h-[100px] p-3 text-xs font-mono bg-background border rounded-lg resize-y"
                        placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                        value={nagadForm.merchantPublicKey}
                        onChange={(e) => setNagadForm({ ...nagadForm, merchantPublicKey: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your RSA public key (upload to Nagad portal)</p>
                  </div>

                  {/* Nagad Public Key */}
                  <div className="space-y-2">
                    <Label htmlFor="nagad-nagadPublicKey">Nagad Public Key</Label>
                    <div className="relative">
                      <textarea
                        id="nagad-nagadPublicKey"
                        className="w-full min-h-[100px] p-3 text-xs font-mono bg-background border rounded-lg resize-y"
                        placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                        value={nagadForm.nagadPublicKey}
                        onChange={(e) => setNagadForm({ ...nagadForm, nagadPublicKey: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Nagad&apos;s public key from their portal (for encrypting requests)</p>
                  </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    API Endpoints Reference
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Sandbox URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://sandbox.mynagad.com:10080
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Initialize:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /remote-payment-gateway-1.0/api/dfs/check-out/initialize
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Complete:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /api/dfs/check-out/complete/{'{paymentRefId}'}
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Verify:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        GET /api/dfs/verify/payment/{'{paymentRefId}'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Encryption Info */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Encryption Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Algorithm:</span> RSA PKCS1Padding</div>
                    <div><span className="text-muted-foreground">Signature:</span> SHA1withRSA</div>
                    <div><span className="text-muted-foreground">Encoding:</span> Base64</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button
                    className="btn-primary"
                    onClick={handleSaveNagad}
                    disabled={isSaving === 'nagad'}
                  >
                    {isSaving === 'nagad' ? (
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

            {/* Integration Flow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Payment Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Initialize Payment</p>
                      <p className="text-xs text-muted-foreground">Call initialize API with orderId, get paymentReferenceId</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Complete Order</p>
                      <p className="text-xs text-muted-foreground">Send amount, get callBackUrl (Nagad payment page)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">User Payment</p>
                      <p className="text-xs text-muted-foreground">User enters mobile number → OTP → PIN</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Callback</p>
                      <p className="text-xs text-muted-foreground">Nagad redirects to callback URL with payment result</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PipraPay */}
        <TabsContent value="piprapay">
          <div className="space-y-6">
            {/* Main Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      PipraPay Payment Gateway
                    </CardTitle>
                    <CardDescription>
                      Self-hosted payment automation platform for Bangladesh
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pipraPayForm.isEnabled}
                        onCheckedChange={(checked) => setPipraPayForm({ ...pipraPayForm, isEnabled: checked })}
                      />
                      <span className="text-sm font-medium">{pipraPayForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pipraPayForm.isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? 'Loading...' : pipraPayForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                    </span>
                  </div>
                  <Badge variant={pipraPayForm.isSandbox ? 'secondary' : 'default'}>
                    {pipraPayForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                  </Badge>
                </div>

                {/* Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <Label className="font-semibold">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable for testing. Disable for production payments.
                    </p>
                  </div>
                  <Switch
                    checked={pipraPayForm.isSandbox}
                    onCheckedChange={(checked) => setPipraPayForm({ ...pipraPayForm, isSandbox: checked })}
                  />
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Display Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how this payment method appears to customers on the checkout page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-label">Label</Label>
                      <Input
                        id="piprapay-label"
                        value={pipraPayForm.label}
                        onChange={(e) => setPipraPayForm({ ...pipraPayForm, label: e.target.value })}
                        placeholder="e.g., PipraPay"
                      />
                      <p className="text-xs text-muted-foreground">The name shown to customers at checkout</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-description">Description</Label>
                      <Input
                        id="piprapay-description"
                        value={pipraPayForm.description}
                        onChange={(e) => setPipraPayForm({ ...pipraPayForm, description: e.target.value })}
                        placeholder="e.g., Pay using multiple payment methods"
                      />
                      <p className="text-xs text-muted-foreground">Brief description shown below the label</p>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get your API credentials from PipraPay dashboard.{' '}
                    <a 
                      href="https://piprapay.readme.io/reference/overview" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Documentation
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* API Key */}
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-apiKey">API Key</Label>
                      <div className="relative">
                        <Input
                          id="piprapay-apiKey"
                          type={showCredentials['piprapay-apiKey'] ? 'text' : 'password'}
                          value={pipraPayForm.apiKey}
                          onChange={(e) => setPipraPayForm({ ...pipraPayForm, apiKey: e.target.value })}
                          placeholder="Enter your API Key"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowCredential('piprapay-apiKey')}
                        >
                          {showCredentials['piprapay-apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Base URL */}
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-baseUrl">Base URL</Label>
                      <Input
                        id="piprapay-baseUrl"
                        value={pipraPayForm.baseUrl}
                        onChange={(e) => setPipraPayForm({ ...pipraPayForm, baseUrl: e.target.value })}
                        placeholder={pipraPayForm.isSandbox ? "https://sandbox.piprapay.com" : "https://pay.yourdomain.com"}
                      />
                      {pipraPayForm.isSandbox && (
                        <p className="text-xs text-muted-foreground">
                          Sandbox URL: https://sandbox.piprapay.com
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* URL Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    URL Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Redirect URL */}
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-redirectUrl">Success Redirect URL</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="piprapay-redirectUrl"
                          value={pipraPayForm.redirectUrl}
                          onChange={(e) => setPipraPayForm({ ...pipraPayForm, redirectUrl: e.target.value })}
                          placeholder="https://yoursite.com/payment/success"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">User redirected here after successful payment</p>
                    </div>

                    {/* Cancel URL */}
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-cancelUrl">Cancel URL</Label>
                      <div className="relative">
                        <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="piprapay-cancelUrl"
                          value={pipraPayForm.cancelUrl}
                          onChange={(e) => setPipraPayForm({ ...pipraPayForm, cancelUrl: e.target.value })}
                          placeholder="https://yoursite.com/payment/cancel"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">User redirected here if payment cancelled</p>
                    </div>

                    {/* Webhook URL */}
                    <div className="space-y-2">
                      <Label htmlFor="piprapay-webhookUrl">Webhook URL (IPN)</Label>
                      <div className="relative">
                        <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="piprapay-webhookUrl"
                          value={pipraPayForm.webhookUrl}
                          onChange={(e) => setPipraPayForm({ ...pipraPayForm, webhookUrl: e.target.value })}
                          placeholder="https://yoursite.com/api/webhook/piprapay"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">For server-to-server notifications</p>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="piprapay-currency">Currency</Label>
                    <Select
                      value={pipraPayForm.currency}
                      onValueChange={(value) => setPipraPayForm({ ...pipraPayForm, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="piprapay-returnType">Return Type</Label>
                    <Select
                      value={pipraPayForm.returnType}
                      onValueChange={(value) => setPipraPayForm({ ...pipraPayForm, returnType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Return Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How payment data is sent to redirect URL</p>
                  </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    API Endpoints Reference
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Sandbox Base URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://sandbox.piprapay.com
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Create Charge:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /api/create-charge
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Verify Payment:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /api/verify-payments
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Auth Header:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        mh-piprapay-api-key
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 flex-wrap">
                    <a 
                      href="https://piprapay.readme.io/reference/create-charge" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Create Charge Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://piprapay.readme.io/reference/verify-payments" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Verify Payment Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://piprapay.readme.io/reference/validate-webhook" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Webhook Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://piprapay.readme.io/reference/redirect-checkout" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Redirect Checkout <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button 
                    className="btn-primary"
                    onClick={handleSavePipraPay} 
                    disabled={isSaving === 'piprapay'}
                  >
                    {isSaving === 'piprapay' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleTestPipraPay} 
                    disabled={isTesting === 'piprapay' || !pipraPayForm.apiKey}
                  >
                    {isTesting === 'piprapay' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {/* Test Result */}
                {testResult && isTesting === null && (
                  <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">{testResult.message}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Charge Request Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Create Charge Request Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "full_name": "Customer Name",
  "email_mobile": "customer@email.com",
  "amount": "100",
  "metadata": {
    "order_id": "ORDER_123"
  },
  "redirect_url": "` + (pipraPayForm.redirectUrl || 'https://yoursite.com/success') + `",
  "return_type": "` + pipraPayForm.returnType + `",
  "cancel_url": "` + (pipraPayForm.cancelUrl || 'https://yoursite.com/cancel') + `",
  "webhook_url": "` + (pipraPayForm.webhookUrl || 'https://yoursite.com/webhook') + `",
  "currency": "` + pipraPayForm.currency + `"
}`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Response includes identifiers sent to your redirect_url and webhook_url. Use <code className="bg-muted px-1 rounded">pp_id</code> to verify payment.
                </p>
              </CardContent>
            </Card>

            {/* Webhook Payload Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Webhook className="w-4 h-4" />
                  Webhook Payload Example
                </CardTitle>
                <CardDescription>
                  Validate the <code>mh-piprapay-api-key</code> header on each webhook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "pp_id": "181055228",
  "customer_name": "Demo",
  "customer_email_mobile": "demo@gmail.com",
  "payment_method": "bKash Personal",
  "amount": "10",
  "fee": "0",
  "total": 10,
  "currency": "BDT",
  "metadata": { "order_id": "ORDER_123" },
  "sender_number": "568568568",
  "transaction_id": "TXN123456",
  "status": "completed",
  "date": "2025-06-26 13:34:13"
}`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Always verify the payment using <code className="bg-muted px-1 rounded">POST /api/verify-payments</code> with the <code className="bg-muted px-1 rounded">pp_id</code>
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upay */}
        <TabsContent value="upay">
          <div className="space-y-6">
            {/* Main Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Upay Payment Gateway
                    </CardTitle>
                    <CardDescription>
                      Payment gateway for Bangladesh - Upay PGW API V4.1.0
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={upayForm.isEnabled}
                        onCheckedChange={(checked) => setUpyForm({ ...upayForm, isEnabled: checked })}
                      />
                      <span className="text-sm font-medium">{upayForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : upayForm.isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? 'Loading...' : upayForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                    </span>
                  </div>
                  <Badge variant={upayForm.isSandbox ? 'secondary' : 'default'}>
                    {upayForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                  </Badge>
                </div>

                {/* Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <Label className="font-semibold">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable for testing. Disable for production payments.
                    </p>
                  </div>
                  <Switch
                    checked={upayForm.isSandbox}
                    onCheckedChange={(checked) => setUpyForm({ ...upayForm, isSandbox: checked })}
                  />
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Display Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how this payment method appears to customers on the checkout page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upay-label">Label</Label>
                      <Input
                        id="upay-label"
                        value={upayForm.label}
                        onChange={(e) => setUpyForm({ ...upayForm, label: e.target.value })}
                        placeholder="e.g., Upay"
                      />
                      <p className="text-xs text-muted-foreground">The name shown to customers at checkout</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upay-description">Description</Label>
                      <Input
                        id="upay-description"
                        value={upayForm.description}
                        onChange={(e) => setUpyForm({ ...upayForm, description: e.target.value })}
                        placeholder="e.g., Pay using Upay payment gateway"
                      />
                      <p className="text-xs text-muted-foreground">Brief description shown below the label</p>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Credentials
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your Upay merchant credentials. Contact Upay support to obtain these credentials.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Merchant ID */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantId">Merchant ID (MID) <span className="text-red-500">*</span></Label>
                      <Input
                        id="upay-merchantId"
                        value={upayForm.merchantId}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantId: e.target.value })}
                        placeholder="Enter Merchant ID"
                      />
                      <p className="text-xs text-muted-foreground">Your unique Merchant Identifier</p>
                    </div>

                    {/* Merchant Key */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantKey">Merchant Key <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="upay-merchantKey"
                          type={showCredentials['upay-merchantKey'] ? 'text' : 'password'}
                          value={upayForm.merchantKey}
                          onChange={(e) => setUpyForm({ ...upayForm, merchantKey: e.target.value })}
                          placeholder="Enter Merchant Key"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowCredential('upay-merchantKey')}
                        >
                          {showCredentials['upay-merchantKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Secret key for API authentication</p>
                    </div>

                    {/* Merchant Name */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantName">Merchant Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="upay-merchantName"
                        value={upayForm.merchantName}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantName: e.target.value })}
                        placeholder="Enter Merchant Name"
                      />
                      <p className="text-xs text-muted-foreground">Your business name registered with Upay</p>
                    </div>

                    {/* Merchant Code */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantCode">Merchant Code</Label>
                      <Input
                        id="upay-merchantCode"
                        value={upayForm.merchantCode}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantCode: e.target.value })}
                        placeholder="Enter Merchant Code"
                      />
                      <p className="text-xs text-muted-foreground">Provided by Upay (optional)</p>
                    </div>

                    {/* Merchant Mobile */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantMobile">Merchant Mobile <span className="text-red-500">*</span></Label>
                      <Input
                        id="upay-merchantMobile"
                        value={upayForm.merchantMobile}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantMobile: e.target.value })}
                        placeholder="01XXXXXXXXX"
                      />
                      <p className="text-xs text-muted-foreground">Mobile number registered with Upay</p>
                    </div>

                    {/* Merchant City */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantCity">Merchant City</Label>
                      <Input
                        id="upay-merchantCity"
                        value={upayForm.merchantCity}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantCity: e.target.value })}
                        placeholder="Dhaka"
                      />
                      <p className="text-xs text-muted-foreground">Default: Dhaka</p>
                    </div>

                    {/* Merchant Country Code */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantCountryCode">Country Code</Label>
                      <Input
                        id="upay-merchantCountryCode"
                        value={upayForm.merchantCountryCode}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantCountryCode: e.target.value })}
                        placeholder="BD"
                      />
                      <p className="text-xs text-muted-foreground">Default: BD</p>
                    </div>

                    {/* Merchant Category Code */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-merchantCategoryCode">Category Code</Label>
                      <Input
                        id="upay-merchantCategoryCode"
                        value={upayForm.merchantCategoryCode}
                        onChange={(e) => setUpyForm({ ...upayForm, merchantCategoryCode: e.target.value })}
                        placeholder="Enter Category Code"
                      />
                      <p className="text-xs text-muted-foreground">Merchant category code (optional)</p>
                    </div>

                    {/* Transaction Currency Code */}
                    <div className="space-y-2">
                      <Label htmlFor="upay-transactionCurrencyCode">Currency Code</Label>
                      <Input
                        id="upay-transactionCurrencyCode"
                        value={upayForm.transactionCurrencyCode}
                        onChange={(e) => setUpyForm({ ...upayForm, transactionCurrencyCode: e.target.value })}
                        placeholder="BDT"
                      />
                      <p className="text-xs text-muted-foreground">Default: BDT</p>
                    </div>
                  </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    API Endpoints Reference (Upay PGW API V4.1.0)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Sandbox Base URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://uat-pg.upay.systems/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Production Base URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://pg.upay.systems/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Auth:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /payment/merchant-auth/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Init Payment:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /payment/merchant-payment-init/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Single Status:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        GET /payment/single-payment-status/{'{txn_id}'}/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Bulk Status:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /payment/bulk-payment-status/
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Bulk Refund:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /payment/bulk/refund/
                      </code>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button 
                    className="btn-primary"
                    onClick={handleSaveUpay} 
                    disabled={isSaving === 'upay'}
                  >
                    {isSaving === 'upay' ? (
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

            {/* Payment Flow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Payment Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Authenticate</p>
                      <p className="text-xs text-muted-foreground">Call merchant-auth API to get session token</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Initialize Payment</p>
                      <p className="text-xs text-muted-foreground">Call merchant-payment-init with order details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Redirect User</p>
                      <p className="text-xs text-muted-foreground">Redirect user to Upay payment page</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Callback/Status Check</p>
                      <p className="text-xs text-muted-foreground">Receive callback or check payment status</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SSLCommerz */}
        <TabsContent value="sslcommerz">
          <div className="space-y-6">
            {/* Main Configuration Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      SSLCommerz Payment Gateway
                    </CardTitle>
                    <CardDescription>
                      Leading payment gateway in Bangladesh supporting cards, mobile banking, and more
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sslCommerzForm.isEnabled}
                        onCheckedChange={(checked) => setSSLCommerzForm({ ...sslCommerzForm, isEnabled: checked })}
                      />
                      <span className="text-sm font-medium">{sslCommerzForm.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : sslCommerzForm.isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isLoading ? 'Loading...' : sslCommerzForm.isEnabled ? 'Gateway Active' : 'Gateway Inactive'}
                    </span>
                  </div>
                  <Badge variant={sslCommerzForm.isSandbox ? 'secondary' : 'default'}>
                    {sslCommerzForm.isSandbox ? 'Sandbox Mode' : 'Production Mode'}
                  </Badge>
                </div>

                {/* Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <Label className="font-semibold">Sandbox Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable for testing. Disable for production payments.
                    </p>
                  </div>
                  <Switch
                    checked={sslCommerzForm.isSandbox}
                    onCheckedChange={(checked) => setSSLCommerzForm({ ...sslCommerzForm, isSandbox: checked })}
                  />
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Display Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-label">Label</Label>
                      <Input
                        id="sslcommerz-label"
                        value={sslCommerzForm.label}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, label: e.target.value })}
                        placeholder="e.g., SSLCommerz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-description">Description</Label>
                      <Input
                        id="sslcommerz-description"
                        value={sslCommerzForm.description}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, description: e.target.value })}
                        placeholder="e.g., Pay securely using SSLCommerz"
                      />
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Credentials
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get your credentials from SSLCommerz Merchant Panel.{' '}
                    <a 
                      href="https://developer.sslcommerz.com/registration/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Create Sandbox Account
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-storeId">Store ID</Label>
                      <Input
                        id="sslcommerz-storeId"
                        value={sslCommerzForm.storeId}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, storeId: e.target.value })}
                        placeholder={sslCommerzForm.isSandbox ? "testbox" : "your_store_id"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-storePassword">Store Password</Label>
                      <div className="relative">
                        <Input
                          id="sslcommerz-storePassword"
                          type={showCredentials['sslcommerz-storePassword'] ? 'text' : 'password'}
                          value={sslCommerzForm.storePassword}
                          onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, storePassword: e.target.value })}
                          placeholder={sslCommerzForm.isSandbox ? "qwerty" : "your_store_password"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowCredential('sslcommerz-storePassword')}
                        >
                          {showCredentials['sslcommerz-storePassword'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* URL Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Callback URLs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure where users are redirected after payment. Auto-generated if left empty.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-successUrl">Success URL</Label>
                      <Input
                        id="sslcommerz-successUrl"
                        value={sslCommerzForm.successUrl}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, successUrl: e.target.value })}
                        placeholder="https://yoursite.com/payment/success"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-failUrl">Fail URL</Label>
                      <Input
                        id="sslcommerz-failUrl"
                        value={sslCommerzForm.failUrl}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, failUrl: e.target.value })}
                        placeholder="https://yoursite.com/payment/failed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-cancelUrl">Cancel URL</Label>
                      <Input
                        id="sslcommerz-cancelUrl"
                        value={sslCommerzForm.cancelUrl}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, cancelUrl: e.target.value })}
                        placeholder="https://yoursite.com/payment/cancelled"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-ipnUrl">IPN URL</Label>
                      <Input
                        id="sslcommerz-ipnUrl"
                        value={sslCommerzForm.ipnUrl}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, ipnUrl: e.target.value })}
                        placeholder="https://yoursite.com/api/payment/sslcommerz/ipn"
                      />
                      <p className="text-xs text-muted-foreground">Instant Payment Notification URL (recommended)</p>
                    </div>
                  </div>
                </div>

                {/* Product Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Product Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-currency">Currency</Label>
                      <Select
                        value={sslCommerzForm.currency}
                        onValueChange={(value) => setSSLCommerzForm({ ...sslCommerzForm, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sslcommerz-productCategory">Product Category</Label>
                      <Input
                        id="sslcommerz-productCategory"
                        value={sslCommerzForm.productCategory}
                        onChange={(e) => setSSLCommerzForm({ ...sslCommerzForm, productCategory: e.target.value })}
                        placeholder="e.g., ticket, travel, donation"
                      />
                    </div>
                  </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    API Endpoints Reference
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Sandbox URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://sandbox.sslcommerz.com
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Production URL:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        https://securepay.sslcommerz.com
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Session API:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        POST /gwprocess/v4/api.php
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Validation API:</span>
                      <code className="block bg-background px-2 py-1 rounded text-xs">
                        GET /validator/api/validationserverAPI.php
                      </code>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <a 
                      href="https://developer.sslcommerz.com/doc/v4/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Integration Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href="https://developer.sslcommerz.com/registration/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                    >
                      Create Sandbox Account <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Test Cards Info */}
                {sslCommerzForm.isSandbox && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">Test Card Details (Sandbox Only)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-medium">VISA:</span>
                        <code className="block bg-background px-2 py-1 rounded">4111111111111111</code>
                        <span className="text-muted-foreground">Exp: 12/26, CVV: 111</span>
                      </div>
                      <div className="space-y-1">
                        <span className="font-medium">MasterCard:</span>
                        <code className="block bg-background px-2 py-1 rounded">5111111111111111</code>
                        <span className="text-muted-foreground">Exp: 12/26, CVV: 111</span>
                      </div>
                      <div className="space-y-1">
                        <span className="font-medium">Mobile OTP:</span>
                        <code className="block bg-background px-2 py-1 rounded">111111 or 123456</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Button 
                    className="btn-primary"
                    onClick={handleSaveSSLCommerz} 
                    disabled={isSaving === 'sslcommerz'}
                  >
                    {isSaving === 'sslcommerz' ? (
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

            {/* Payment Flow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Payment Flow
                </CardTitle>
                <CardDescription>
                  How SSLCommerz payment integration works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Create Session</p>
                      <p className="text-xs text-muted-foreground">Call API with order details to get session</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Redirect User</p>
                      <p className="text-xs text-muted-foreground">Redirect to SSLCommerz payment page</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">IPN Notification</p>
                      <p className="text-xs text-muted-foreground">Receive instant payment notification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Validate Payment</p>
                      <p className="text-xs text-muted-foreground">Validate via Order Validation API</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
