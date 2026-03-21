'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bus, Train, Ship, Plane, Upload, MapPin, Clock, Calendar,
  DollarSign, FileText, AlertCircle, Info, CheckCircle2, Loader2,
  Package, User, ArrowLeft, Home, X, Image as ImageIcon
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'

// Transport type options
const transportTypes = [
  { value: 'BUS', label: 'Bus', icon: Bus, color: 'bg-blue-500' },
  { value: 'TRAIN', label: 'Train', icon: Train, color: 'bg-purple-500' },
  { value: 'LAUNCH', label: 'Launch', icon: Ship, color: 'bg-cyan-500' },
  { value: 'AIR', label: 'Air', icon: Plane, color: 'bg-amber-500' },
]

// Class types by transport
const classTypesByTransport = {
  BUS: [
    { value: 'NON_AC_ECONOMY', label: 'Non-AC Economy' },
    { value: 'NON_AC_BUSINESS', label: 'Non-AC Business' },
    { value: 'AC_ECONOMY', label: 'AC Economy' },
    { value: 'AC_BUSINESS', label: 'AC Business' },
    { value: 'SLEEPER', label: 'Sleeper' },
    { value: 'SUIT_CLASS_BUSINESS', label: 'Suit Class Business' },
    { value: 'SUIT_CLASS_SLEEPER', label: 'Suit Class Sleeper' },
  ],
  TRAIN: [
    { value: 'AC_B', label: 'AC-B' },
    { value: 'AC_S', label: 'AC-S' },
    { value: 'SNIGDHA', label: 'SNIGDHA' },
    { value: 'F_BERTH', label: 'F-BERTH' },
    { value: 'F_SEAT', label: 'F-SEAT' },
    { value: 'F_CHAIR', label: 'F-CHAIR' },
    { value: 'S_CHAIR', label: 'S-CHAIR' },
    { value: 'SHOVAN', label: 'SHOVAN' },
    { value: 'SHULOV', label: 'SHULOV' },
    { value: 'AC_CHAIR', label: 'AC-CHAIR' },
  ],
  LAUNCH: [
    { value: 'STANDING', label: 'Standing' },
    { value: 'NON_AC_SEAT', label: 'Non-AC Seat' },
    { value: 'AC_SEAT', label: 'AC Seat' },
    { value: 'NON_AC_CABIN', label: 'Non-AC Cabin' },
    { value: 'AC_CABIN', label: 'AC Cabin' },
    { value: 'VIP_CABIN', label: 'VIP Cabin' },
  ],
  AIR: [
    { value: 'ECONOMY', label: 'Economy' },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'FIRST_CLASS', label: 'First Class' },
  ],
}

// Sleeper positions
const sleeperPositions = [
  { value: 'UPPER_DECK', label: 'Upper Deck' },
  { value: 'LOWER_DECK', label: 'Lower Deck' },
]

// Courier services
const courierServices = [
  { value: 'PATHAO', label: 'Pathao' },
  { value: 'STEADFAST', label: 'Steadfast' },
  { value: 'REDEX', label: 'Redex' },
  { value: 'PAPERFLY', label: 'Paperfly' },
  { value: 'ECOURIER', label: 'eCourier' },
  { value: 'CARRYBEE', label: 'Carrybee' },
  { value: 'OTHER', label: 'Other' },
]

// Popular Bangladesh cities
const popularCities = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur', 'Barisal', 'Comilla',
  'Gazipur', 'Narayanganj', 'Mymensingh', 'Bogra', 'Cox\'s Bazar', 'Jessore', 'Dinajpur',
  'Brahmanbaria', 'Savar', 'Tongi', 'Narsingdi', 'Tangail', 'Jamalpur', 'Kishoreganj',
  'Faridpur', 'Madaripur', 'Gopalganj', 'Nawabganj', 'Habiganj', 'Bhairab', 'Narail',
  'Satkhira', 'Bagerhat', 'Magura', 'Meherpur', 'Kushtia', 'Chuadanga', 'Jhenaidah',
  'Pabna', 'Sirajganj', 'Natore', 'Naogaon', 'Joypurhat', 'Dhamrai', 'Manikganj',
]

// Ticket types
const ticketTypes = [
  { value: 'ONLINE_COPY', label: 'Online Copy', description: 'Digital PDF ticket', badge: 'PDF Required' },
  { value: 'COUNTER_COPY', label: 'Counter Copy', description: 'Physical paper ticket' },
]

// Delivery types
const deliveryTypes = [
  {
    value: 'ONLINE_DELIVERY',
    label: 'Online Delivery',
    description: 'Buyer will get a PDF ticket instant delivery on email or download from their dashboard.',
    icon: FileText,
    requiresTicketType: 'ONLINE_COPY'
  },
  {
    value: 'IN_PERSON',
    label: 'In Person (Recommended)',
    description: 'You will need deliver the ticket in person meetup location.',
    icon: User,
  },
  {
    value: 'COURIER',
    label: 'Courier',
    description: 'Deliver the ticket through courier service (COD).',
    icon: Package,
  },
]

// Form schema
const ticketSchema = z.object({
  transportType: z.enum(['BUS', 'TRAIN', 'LAUNCH', 'AIR']),
  ticketType: z.enum(['ONLINE_COPY', 'COUNTER_COPY']),
  pnrNumber: z.string().min(1, 'PNR number is required'),
  transportCompany: z.string().min(1, 'Transport company is required'),
  fromCity: z.string().min(1, 'From city is required'),
  toCity: z.string().min(1, 'To city is required'),
  boardingPoint: z.string().min(1, 'Boarding point is required'),
  travelDate: z.string().min(1, 'Travel date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  seatNumber: z.string().min(1, 'Seat number is required'),
  classType: z.string().min(1, 'Class type is required'),
  sleeperPosition: z.enum(['UPPER_DECK', 'LOWER_DECK']).optional().nullable(),
  originalPrice: z.coerce.number().min(1, 'Original price is required'),
  sellingPrice: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
  deliveryType: z.enum(['ONLINE_DELIVERY', 'IN_PERSON', 'COURIER']),
  location: z.string().optional(),
  courierService: z.enum(['PATHAO', 'STEADFAST', 'REDEX', 'PAPERFLY', 'ECOURIER', 'CARRYBEE', 'OTHER']).optional().nullable(),
  courierFee: z.coerce.number().optional().nullable(),
  courierFeePaidBy: z.enum(['BUYER', 'SELLER']).optional().nullable(),
})

type TicketFormValues = z.infer<typeof ticketSchema>

export default function SellTicketsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      transportType: 'BUS',
      ticketType: 'COUNTER_COPY',
      pnrNumber: '',
      transportCompany: '',
      fromCity: '',
      toCity: '',
      boardingPoint: '',
      travelDate: '',
      departureTime: '',
      seatNumber: '',
      classType: '',
      sleeperPosition: null,
      originalPrice: 0,
      sellingPrice: null,
      notes: '',
      deliveryType: 'IN_PERSON',
      location: '',
      courierService: null,
      courierFee: null,
      courierFeePaidBy: null,
    },
  })

  // Watch values for conditional rendering
  const watchTransportType = form.watch('transportType')
  const watchTicketType = form.watch('ticketType')
  const watchClassType = form.watch('classType')
  const watchDeliveryType = form.watch('deliveryType')

  // Get class types for selected transport
  const classTypes = classTypesByTransport[watchTransportType as keyof typeof classTypesByTransport] || []

  // Check if sleeper position should be shown (Bus + Sleeper class)
  const showSleeperPosition = watchTransportType === 'BUS' && watchClassType === 'SLEEPER'

  // Check if online delivery is available
  const canShowOnlineDelivery = watchTicketType === 'ONLINE_COPY'

  // Filter delivery types based on ticket type
  const availableDeliveryTypes = deliveryTypes.filter(dt =>
    !dt.requiresTicketType || dt.requiresTicketType === watchTicketType
  )

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)

    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be less than 5MB')
      return
    }

    // Check if PDF is required for online copy
    if (watchTicketType === 'ONLINE_COPY' && file.type !== 'application/pdf') {
      setFileError('PDF file is required for Online Copy tickets')
      return
    }

    // Check file type
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      setFileError('Only image or PDF files are allowed')
      return
    }

    setFileName(file.name)
    setFileType(isPdf ? 'pdf' : 'image')

    // Create preview for images
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  // Remove file
  const removeFile = () => {
    setFilePreview(null)
    setFileName(null)
    setFileType(null)
    setFileError(null)
  }

  // Reset class type when transport type changes
  useEffect(() => {
    form.setValue('classType', '')
  }, [watchTransportType, form])

  // Reset sleeper position when class type changes
  useEffect(() => {
    if (!showSleeperPosition) {
      form.setValue('sleeperPosition', null)
    }
  }, [showSleeperPosition, form])

  // Reset delivery type when ticket type changes
  useEffect(() => {
    if (watchTicketType === 'COUNTER_COPY' && watchDeliveryType === 'ONLINE_DELIVERY') {
      form.setValue('deliveryType', 'IN_PERSON')
    }
  }, [watchTicketType, watchDeliveryType, form])

  // Calculate platform fee and total
  const originalPrice = form.watch('originalPrice') || 0
  const sellingPrice = form.watch('sellingPrice') || originalPrice
  const platformFee = Math.max(Math.round(sellingPrice * 0.01), 10) // 1% min 10 BDT
  const sellerReceives = sellingPrice - platformFee

  // Form submission
  const onSubmit = async (data: TicketFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to sell tickets',
        variant: 'destructive',
      })
      router.push('/user/login')
      return
    }

    // Validate file upload
    if (!fileName) {
      setFileError('Ticket image or PDF is required')
      return
    }

    // Validate online copy requires PDF
    if (data.ticketType === 'ONLINE_COPY' && fileType !== 'pdf') {
      setFileError('PDF file is required for Online Copy tickets')
      return
    }

    // Validate delivery-specific fields
    if (data.deliveryType === 'IN_PERSON' && !data.location) {
      form.setError('location', { message: 'Location is required for In Person delivery' })
      return
    }

    if (data.deliveryType === 'COURIER') {
      if (!data.courierService) {
        form.setError('courierService', { message: 'Courier service is required' })
        return
      }
      if (!data.courierFee || data.courierFee <= 0) {
        form.setError('courierFee', { message: 'Courier fee is required' })
        return
      }
      if (!data.courierFeePaidBy) {
        form.setError('courierFeePaidBy', { message: 'Select who pays the courier fee' })
        return
      }
    }

    setIsLoading(true)

    try {
      const formData = new FormData()

      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'ticketFile') {
          formData.append(key, String(value))
        }
      })

      // Append file - we need to get the actual file from the input
      const fileInput = document.getElementById('ticketFile') as HTMLInputElement
      if (fileInput?.files?.[0]) {
        formData.append('ticketFile', fileInput.files[0])
      }

      // Get auth token from store
      const token = useAuthStore.getState().token

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Ticket Listed Successfully',
          description: `Your ticket ID is ${result.ticket?.ticketId}. It has been submitted for review.`,
        })
        router.push('/user/listings')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to list ticket',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to sell your tickets on our platform.
              </p>
              <div className="flex flex-col gap-3">
                <Button className="btn-primary" onClick={() => router.push('/user/login')}>
                  Login Now
                </Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <a href="/" className="hover:text-primary">Home</a>
              <span>/</span>
              <span className="text-foreground">Sell Ticket</span>
            </div>
            <h1 className="text-2xl font-bold">Sell Your Ticket</h1>
            <p className="text-muted-foreground">List your unused travel ticket for resale</p>
          </div>

          {/* BRTA Warning */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 mb-6">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Important Notice</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Tickets priced higher than BRTA regulations will be rejected. Please ensure your selling price complies with government regulations.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Transport & Ticket Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bus className="w-5 h-5" />
                    Transport & Ticket Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Transport Type */}
                  <FormField
                    control={form.control}
                    name="transportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport Type *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {transportTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <div
                                key={type.value}
                                className={cn(
                                  'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                                  field.value === type.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                )}
                                onClick={() => field.onChange(type.value)}
                              >
                                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2', type.color)}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <span className={cn('font-medium', field.value === type.value ? 'text-primary' : '')}>
                                  {type.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ticket Type */}
                  <FormField
                    control={form.control}
                    name="ticketType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Type *</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {ticketTypes.map((type) => (
                            <div
                              key={type.value}
                              className={cn(
                                'relative flex flex-col items-start p-4 rounded-xl border-2 cursor-pointer transition-all',
                                field.value === type.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                              onClick={() => field.onChange(type.value)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn('font-medium', field.value === type.value ? 'text-primary' : '')}>
                                  {type.label}
                                </span>
                                {type.badge && (
                                  <Badge variant="secondary" className="text-xs">{type.badge}</Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{type.description}</span>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Ticket Image or PDF *</Label>
                    <p className="text-sm text-muted-foreground">
                      {watchTicketType === 'ONLINE_COPY'
                        ? 'PDF file is required for Online Copy tickets'
                        : 'Upload an image or PDF of your ticket (max 5MB)'}
                    </p>

                    {!fileName ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="ticketFile"
                          accept={watchTicketType === 'ONLINE_COPY' ? '.pdf' : 'image/*,.pdf'}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="ticketFile" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {watchTicketType === 'ONLINE_COPY' ? 'PDF only (max 5MB)' : 'PNG, JPG, PDF (max 5MB)'}
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="border rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {fileType === 'pdf' ? (
                              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-red-600" />
                              </div>
                            ) : filePreview ? (
                              <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                            ) : null}
                            <div>
                              <p className="font-medium text-sm">{fileName}</p>
                              <p className="text-xs text-muted-foreground capitalize">{fileType} file</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {fileError && (
                      <p className="text-sm text-destructive">{fileError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Journey Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Journey Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pnrNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PNR Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PNR number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transportCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transport Company *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Green Line, Bangladesh Biman" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select departure city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {popularCities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="toCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {popularCities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="boardingPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boarding Point *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Gabtoli Bus Terminal, Kamalapur Railway Station" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="travelDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Date *</FormLabel>
                          <FormControl>
                            <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departure Time *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="classType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Type *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {classTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seat Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., A1, B2, 12A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sleeper Position - Conditional */}
                  <AnimatePresence>
                    {showSleeperPosition && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormField
                          control={form.control}
                          name="sleeperPosition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleeper Position *</FormLabel>
                              <Select value={field.value || ''} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select deck position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sleeperPositions.map((pos) => (
                                    <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Platform Fee Info */}
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-200 text-sm">Platform Fee Information</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                      <p>A 1% platform fee (minimum ৳10) is deducted from the seller&apos;s earnings. When the buyer pays the full ticket price for Online Delivery, the fee is automatically calculated and deducted.</p>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (BDT) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter original ticket price"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The price you paid for the ticket.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price (BDT)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Leave empty to use original price"
                              min="0"
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            The price buyer pays. Platform fee deducted from earnings.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price Breakdown */}
                  {(originalPrice > 0) && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">Price Calculation</h4>
                        <Badge variant="secondary" className="text-xs">1% Platform Fee Included</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-background rounded-md">
                          <span className="text-muted-foreground">Buyer Pays:</span>
                          <span className="font-semibold text-lg">৳{sellingPrice.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between text-destructive text-xs">
                          <span>Platform Fee (1%, min ৳10) - deducted from seller:</span>
                          <span>-৳{platformFee.toLocaleString()}</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <span className="font-medium text-green-700 dark:text-green-400">You Receive:</span>
                          <span className="font-bold text-green-600 text-lg">৳{sellerReceives.toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        The platform fee is automatically deducted from your earnings. The buyer pays the full selling price.
                      </p>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes / Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information about the ticket..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ticket Delivery
                  </CardTitle>
                  <CardDescription>Choose how you want to deliver the ticket to the buyer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deliveryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Type *</FormLabel>
                        <div className="space-y-3">
                          {availableDeliveryTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <div
                                key={type.value}
                                className={cn(
                                  'relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                                  field.value === type.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                )}
                                onClick={() => field.onChange(type.value)}
                              >
                                <div className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                                  field.value === type.value
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                )}>
                                  {field.value === type.value && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn('w-5 h-5', field.value === type.value ? 'text-primary' : '')} />
                                    <span className={cn('font-medium', field.value === type.value ? 'text-primary' : '')}>
                                      {type.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Delivery Info Boxes */}
                  <AnimatePresence mode="wait">
                    {watchDeliveryType === 'ONLINE_DELIVERY' && (
                      <motion.div
                        key="online"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-800 dark:text-blue-200">Online Delivery Info</AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              <li>Buyer will get instant PDF ticket via email</li>
                              <li>1% platform fee (min ৳10) will be deducted</li>
                              <li>Amount will be on hold until buyer safely boards</li>
                              <li>After confirmation, amount releases to your wallet</li>
                              <li>You can withdraw money anytime</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {watchDeliveryType === 'IN_PERSON' && (
                      <motion.div
                        key="inperson"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <Info className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800 dark:text-green-200">In Person Delivery Info</AlertTitle>
                          <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              <li>Meet buyer at a safe public location</li>
                              <li>Exchange ticket after receiving payment</li>
                              <li>Both parties should verify details</li>
                            </ul>
                          </AlertDescription>
                        </Alert>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting Location *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Farmgate Metro Station, Platform 3" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {watchDeliveryType === 'COURIER' && (
                      <motion.div
                        key="courier"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          <Info className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800 dark:text-amber-200">Courier Delivery Info</AlertTitle>
                          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              <li>Buyer pays first, then ticket is shipped</li>
                              <li>Courier fee can be paid by either party</li>
                              <li>Tracking number will be shared with buyer</li>
                            </ul>
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="courierService"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Courier Service *</FormLabel>
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select courier" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {courierServices.map((service) => (
                                      <SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="courierFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Courier Fee (BDT) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter courier fee"
                                    min="0"
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="courierFeePaidBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Courier Fee Paid By *</FormLabel>
                              <div className="flex gap-4">
                                <div className={cn(
                                  'flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all',
                                  field.value === 'BUYER' ? 'border-primary bg-primary/5' : 'border-border'
                                )}
                                  onClick={() => field.onChange('BUYER')}
                                >
                                  <div className={cn(
                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                    field.value === 'BUYER'
                                      ? 'border-primary bg-primary'
                                      : 'border-muted-foreground'
                                  )}>
                                    {field.value === 'BUYER' && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <Label className="cursor-pointer">Buyer</Label>
                                </div>
                                <div className={cn(
                                  'flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all',
                                  field.value === 'SELLER' ? 'border-primary bg-primary/5' : 'border-border'
                                )}
                                  onClick={() => field.onChange('SELLER')}
                                >
                                  <div className={cn(
                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                    field.value === 'SELLER'
                                      ? 'border-primary bg-primary'
                                      : 'border-muted-foreground'
                                  )}>
                                    {field.value === 'SELLER' && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <Label className="cursor-pointer">Seller (You)</Label>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4 justify-end sticky bottom-4 bg-slate-50 p-4 rounded-xl border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary min-w-[150px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'List Ticket'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  )
}
