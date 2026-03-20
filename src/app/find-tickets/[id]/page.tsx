'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, Calendar, Clock, Shield, Star, Eye, EyeOff, CreditCard,
  Bus, Train, Ship, Plane, User, Phone, Mail, Home, CheckCircle2,
  AlertCircle, Wallet, Truck, Users, ArrowLeft, Lock, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

// Mock ticket data - in real app this would come from API
const mockTicket = {
  id: '1',
  transportType: 'BUS',
  transportCompany: 'Green Line Paribahan',
  pnrNumber: 'GLP-2025-123456',
  fromCity: 'Dhaka',
  toCity: 'Chittagong',
  seatNumber: 'A1',
  classType: 'AC Business',
  travelDate: '2025-06-20',
  departureTime: '22:00',
  originalPrice: 1200,
  sellingPrice: 1000,
  ticketImage: '/ticket-sample.jpg',
  ticketPdf: null,
  notes: 'Seat is window side. Good condition ticket.',
  deliveryType: 'ONLINE_PAYMENT',
  location: null,
  courierService: null,
  courierFee: null,
  status: 'APPROVED',
  seller: {
    id: 's1',
    name: 'Rahman Ahmed',
    email: 'rahman@example.com',
    phone: '+880171234567',
    verified: true,
    rating: 4.8,
    totalSales: 25,
    avatar: null,
  },
}

// Payment method icons and colors mapping
const paymentMethodConfig: Record<string, { icon: string; color: string }> = {
  bkash: { icon: '📱', color: 'bg-pink-500' },
  nagad: { icon: '💳', color: 'bg-orange-500' },
  uddoktapay: { icon: '💼', color: 'bg-blue-500' },
  piprapay: { icon: '💎', color: 'bg-purple-500' },
}

// Static payment methods (always available)
const staticPaymentMethods = [
  { value: 'CASH', label: 'Cash', description: 'Pay with cash', icon: '💵', color: 'bg-green-500' },
  { value: 'COD', label: 'Cash on Delivery', description: 'Pay when you receive', icon: '📦', color: 'bg-amber-500' },
]

interface PaymentMethod {
  id: string
  name: string
  label: string
  description: string
  isEnabled: boolean
}

const deliveryTypes = [
  {
    value: 'ONLINE_PAYMENT',
    label: 'Online Payment',
    description: 'Pay online and receive ticket instantly',
    icon: CreditCard,
  },
  {
    value: 'IN_PERSON',
    label: 'In Person',
    description: 'Meet seller and pay in cash',
    icon: Users,
  },
  {
    value: 'COURIER',
    label: 'Courier Delivery',
    description: 'Get ticket delivered to your address',
    icon: Truck,
  },
]

const courierServices = [
  { value: 'PATHAO', label: 'Pathao Courier', fee: 60 },
  { value: 'STEADFAST', label: 'Steadfast', fee: 50 },
  { value: 'REDEX', label: 'RedX', fee: 55 },
  { value: 'PAPERFLY', label: 'Paperfly', fee: 65 },
  { value: 'ECOURIER', label: 'eCourier', fee: 70 },
  { value: 'CARRYBEE', label: 'CarryBee', fee: 45 },
]

interface BuyerInfo {
  name: string
  phone: string
  email: string
  address: string
}

interface PurchaseForm {
  buyerInfo: BuyerInfo
  paymentMethod: string
  deliveryType: string
  courierService: string
  courierFeePaidBy: string
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [showPnr, setShowPnr] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string; description: string; icon: string; color: string }>>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true)
  
  const [form, setForm] = useState<PurchaseForm>({
    buyerInfo: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
    paymentMethod: '',
    deliveryType: 'ONLINE_PAYMENT',
    courierService: '',
    courierFeePaidBy: 'BUYER',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load payment methods from API
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods')
        if (response.ok) {
          const data = await response.json()
          const dynamicMethods = data.paymentMethods.map((method: PaymentMethod) => ({
            value: method.name.toUpperCase(),
            label: method.label,
            description: method.description,
            icon: paymentMethodConfig[method.name]?.icon || '💳',
            color: paymentMethodConfig[method.name]?.color || 'bg-gray-500',
          }))
          setPaymentMethods([...dynamicMethods, ...staticPaymentMethods])
        }
      } catch (error) {
        console.error('Error loading payment methods:', error)
        // Fallback to static methods only
        setPaymentMethods(staticPaymentMethods)
      } finally {
        setIsLoadingPaymentMethods(false)
      }
    }
    loadPaymentMethods()
  }, [])

  // Calculate platform fee (1% min 10 BDT)
  const platformFee = Math.max(Math.round(mockTicket.sellingPrice * 0.01), 10)
  const courierFee = form.deliveryType === 'COURIER' && form.courierService
    ? courierServices.find(c => c.value === form.courierService)?.fee || 0
    : 0
  const totalAmount = mockTicket.sellingPrice + platformFee + courierFee

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'BUS': return Bus
      case 'TRAIN': return Train
      case 'LAUNCH': return Ship
      case 'AIR': return Plane
      default: return Bus
    }
  }

  const getTransportColor = (type: string) => {
    switch (type) {
      case 'BUS': return 'bg-blue-500'
      case 'TRAIN': return 'bg-purple-500'
      case 'LAUNCH': return 'bg-cyan-500'
      case 'AIR': return 'bg-amber-500'
      default: return 'bg-slate-500'
    }
  }

  const TransportIcon = getTransportIcon(mockTicket.transportType)
  const transportColor = getTransportColor(mockTicket.transportType)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.buyerInfo.name.trim()) newErrors['buyerInfo.name'] = 'Name is required'
    if (!form.buyerInfo.phone.trim()) newErrors['buyerInfo.phone'] = 'Phone is required'
    else if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(form.buyerInfo.phone.replace(/\s/g, ''))) {
      newErrors['buyerInfo.phone'] = 'Invalid phone number'
    }
    if (!form.buyerInfo.email.trim()) newErrors['buyerInfo.email'] = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.buyerInfo.email)) {
      newErrors['buyerInfo.email'] = 'Invalid email address'
    }
    if ((form.deliveryType === 'IN_PERSON' || form.deliveryType === 'COURIER') && !form.buyerInfo.address.trim()) {
      newErrors['buyerInfo.address'] = 'Address is required'
    }
    if (!form.paymentMethod) newErrors['paymentMethod'] = 'Payment method is required'
    if (form.deliveryType === 'COURIER' && !form.courierService) {
      newErrors['courierService'] = 'Courier service is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePurchase = async () => {
    if (!validateForm()) return

    setIsPurchasing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsPurchasing(false)
    setShowSuccessDialog(true)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('buyerInfo.')) {
      const key = field.split('.')[1]
      setForm(prev => ({
        ...prev,
        buyerInfo: { ...prev.buyerInfo, [key]: value }
      }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/find-tickets">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0', transportColor)}>
                      <TransportIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold truncate">{mockTicket.transportCompany}</h1>
                        <Badge variant="secondary">{mockTicket.transportType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">{mockTicket.classType}</span>
                        <span>•</span>
                        <span className="text-sm">Seat {mockTicket.seatNumber}</span>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Route & Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Route & Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-semibold">{mockTicket.fromCity}</p>
                      <p className="text-sm text-muted-foreground">Departure</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="border-t-2 border-dashed border-border relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2">
                          <TransportIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-6 h-6 text-accent" />
                      </div>
                      <p className="font-semibold">{mockTicket.toCity}</p>
                      <p className="text-sm text-muted-foreground">Arrival</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Travel Date</p>
                        <p className="font-medium">{mockTicket.travelDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Departure Time</p>
                        <p className="font-medium">{mockTicket.departureTime}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* PNR & Ticket Image - Hidden until purchase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Ticket Details
                  </CardTitle>
                  <CardDescription>
                    PNR and ticket image will be revealed after purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* PNR Number */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {showPnr ? (
                          <span className="text-sm font-bold text-primary">PNR</span>
                        ) : (
                          <EyeOff className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">PNR Number</p>
                        <p className="font-mono font-semibold">
                          {showPnr ? mockTicket.pnrNumber : '••••••••••••'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPnr(!showPnr)}
                      className="gap-1"
                    >
                      {showPnr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPnr ? 'Hide' : 'Preview'}
                    </Button>
                  </div>

                  {/* Ticket Image */}
                  <div className="relative rounded-lg overflow-hidden bg-muted/50 border-2 border-dashed border-border">
                    {showImage ? (
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <div className="text-center p-6">
                          <p className="text-muted-foreground mb-2">Ticket Image Preview</p>
                          <p className="text-xs text-muted-foreground">
                            (Actual image would be displayed here)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <EyeOff className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">Ticket Image Hidden</p>
                          <p className="text-sm text-muted-foreground">
                            Purchase to reveal the ticket
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowImage(!showImage)}
                        className="gap-1"
                      >
                        {showImage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showImage ? 'Hide' : 'Preview'}
                      </Button>
                    </div>
                  </div>

                  {mockTicket.notes && (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Seller&apos;s Note
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {mockTicket.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Buyer Information Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Information</CardTitle>
                  <CardDescription>
                    Please provide your details for the ticket transfer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={form.buyerInfo.name}
                          onChange={(e) => handleInputChange('buyerInfo.name', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors['buyerInfo.name'] && (
                        <p className="text-xs text-destructive">{errors['buyerInfo.name']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+880 1XXX-XXXXXX"
                          value={form.buyerInfo.phone}
                          onChange={(e) => handleInputChange('buyerInfo.phone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors['buyerInfo.phone'] && (
                        <p className="text-xs text-destructive">{errors['buyerInfo.phone']}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.buyerInfo.email}
                        onChange={(e) => handleInputChange('buyerInfo.email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors['buyerInfo.email'] && (
                      <p className="text-xs text-destructive">{errors['buyerInfo.email']}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address {form.deliveryType !== 'ONLINE_PAYMENT' && '*'}
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        placeholder="Your full address"
                        value={form.buyerInfo.address}
                        onChange={(e) => handleInputChange('buyerInfo.address', e.target.value)}
                        className="pl-10 min-h-[80px]"
                      />
                    </div>
                    {errors['buyerInfo.address'] && (
                      <p className="text-xs text-destructive">{errors['buyerInfo.address']}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Method</CardTitle>
                  <CardDescription>
                    Choose how you want to receive your ticket
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.deliveryType}
                    onValueChange={(v) => handleInputChange('deliveryType', v)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {deliveryTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = form.deliveryType === type.value
                      return (
                        <label
                          key={type.value}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <RadioGroupItem value={type.value} className="sr-only" />
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center',
                            isSelected ? 'bg-primary text-white' : 'bg-muted'
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                          )}
                        </label>
                      )
                    })}
                  </RadioGroup>

                  {/* Courier Service Selection */}
                  {form.deliveryType === 'COURIER' && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Courier Service</Label>
                        <Select
                          value={form.courierService}
                          onValueChange={(v) => handleInputChange('courierService', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select courier service" />
                          </SelectTrigger>
                          <SelectContent>
                            {courierServices.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label} - ৳{service.fee}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors['courierService'] && (
                          <p className="text-xs text-destructive">{errors['courierService']}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Courier Fee Paid By</Label>
                        <RadioGroup
                          value={form.courierFeePaidBy}
                          onValueChange={(v) => handleInputChange('courierFeePaidBy', v)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BUYER" id="buyer" />
                            <Label htmlFor="buyer" className="font-normal">Buyer (Me)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SELLER" id="seller" />
                            <Label htmlFor="seller" className="font-normal">Seller</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <CardDescription>
                    Select your preferred payment option
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPaymentMethods ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading payment methods...</span>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payment methods available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {paymentMethods.map((method) => {
                        const isSelected = form.paymentMethod === method.value
                        return (
                          <button
                            key={method.value}
                            onClick={() => handleInputChange('paymentMethod', method.value)}
                            className={cn(
                              'flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <span className="text-2xl flex-shrink-0">{method.icon}</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm">{method.label}</span>
                              {method.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {method.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors['paymentMethod'] && (
                    <p className="text-xs text-destructive mt-2">{errors['paymentMethod']}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Price</span>
                      <span className="line-through">৳{mockTicket.originalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selling Price</span>
                      <span className="font-medium">৳{mockTicket.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Platform Fee
                        <span className="text-xs">(1% min ৳10)</span>
                      </span>
                      <span>৳{platformFee}</span>
                    </div>
                    {form.deliveryType === 'COURIER' && courierFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Courier Fee</span>
                        <span>৳{courierFee}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">৳{totalAmount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      You save ৳{mockTicket.originalPrice - mockTicket.sellingPrice} on this ticket!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Seller Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seller Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={mockTicket.seller.avatar || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {mockTicket.seller.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{mockTicket.seller.name}</p>
                          {mockTicket.seller.verified && (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{mockTicket.seller.rating}</span>
                          <span>•</span>
                          <span>{mockTicket.seller.totalSales} sales</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{mockTicket.seller.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{mockTicket.seller.phone}</span>
                      </div>
                    </div>
                    {mockTicket.seller.verified && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          ID Verified Seller
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Buy Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  className="w-full btn-primary h-12 text-lg"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Buy Now - ৳{totalAmount}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Secure payment protected by platform
                </p>
              </motion.div>

              {/* Safety Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                          Safety Tips
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                          <li>• Always pay through the platform</li>
                          <li>• Verify ticket details before payment</li>
                          <li>• Report suspicious listings</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your ticket purchase has been completed successfully. The seller will contact you shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-mono font-semibold">TXN-{Date.now().toString(36).toUpperCase()}</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Link href="/user/purchases" className="w-full">
              <Button variant="outline" className="w-full">
                View My Purchases
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button className="w-full btn-primary">
                Go to Home
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </MainLayout>
  )
}
