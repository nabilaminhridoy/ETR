'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Upload, Loader2, Bus, Train, Ship, Plane,
  MapPin, Calendar, Clock, DollarSign, FileText, Truck, User, CheckCircle2
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import { BANGLADESH_DISTRICTS } from '@/lib/constants'

const transportTypes = [
  { value: 'BUS', label: 'Bus', icon: Bus, color: 'bg-blue-500' },
  { value: 'TRAIN', label: 'Train', icon: Train, color: 'bg-purple-500' },
  { value: 'LAUNCH', label: 'Launch', icon: Ship, color: 'bg-cyan-500' },
  { value: 'AIR', label: 'Air', icon: Plane, color: 'bg-amber-500' },
]

const busClasses = [
  'NON_AC_ECONOMY', 'NON_AC_BUSINESS', 'AC_ECONOMY', 'AC_BUSINESS',
  'SLEEPER', 'SUIT_CLASS_BUSINESS', 'SUIT_CLASS_SLEEPER'
]

const trainClasses = [
  'AC_B', 'AC_S', 'SNIGDHA', 'F_BERTH', 'F_SEAT', 'F_CHAIR',
  'S_CHAIR', 'SHOVAN', 'SHULOV', 'AC_CHAIR'
]

const launchClasses = [
  'STANDING', 'NON_AC_SEAT', 'AC_SEAT', 'NON_AC_CABIN', 'AC_CABIN', 'VIP_CABIN'
]

const airClasses = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS']

const courierServices = [
  { value: 'PATHAO', label: 'Pathao' },
  { value: 'STEADFAST', label: 'Steadfast' },
  { value: 'REDEX', label: 'Redex' },
  { value: 'PAPERFLY', label: 'Paperfly' },
  { value: 'ECOURIER', label: 'eCourier' },
  { value: 'CARRYBEE', label: 'Carrybee' },
]

const ticketSchema = z.object({
  transportType: z.enum(['BUS', 'TRAIN', 'LAUNCH', 'AIR']),
  transportCompany: z.string().min(1, 'Transport company is required'),
  pnrNumber: z.string().min(1, 'PNR number is required'),
  fromCity: z.string().min(1, 'From city is required'),
  toCity: z.string().min(1, 'To city is required'),
  travelDate: z.string().min(1, 'Travel date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  seatNumber: z.string().min(1, 'Seat number is required'),
  classType: z.string().min(1, 'Class type is required'),
  sleeperPosition: z.enum(['UPPER_DECK', 'LOWER_DECK']).optional(),
  originalPrice: z.number().min(1, 'Original price is required'),
  sellingPrice: z.number().min(1, 'Selling price is required'),
  notes: z.string().optional(),
  deliveryType: z.enum(['ONLINE_PAYMENT', 'IN_PERSON', 'COURIER']),
  location: z.string().optional(),
  courierService: z.enum(['PATHAO', 'STEADFAST', 'REDEX', 'PAPERFLY', 'ECOURIER', 'CARRYBEE']).optional(),
  courierFeePaidBy: z.enum(['BUYER', 'SELLER']).optional(),
  courierFee: z.number().optional(),
})

export default function SellTicketsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [ticketImage, setTicketImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      transportType: 'BUS',
      transportCompany: '',
      pnrNumber: '',
      fromCity: '',
      toCity: '',
      travelDate: '',
      departureTime: '',
      seatNumber: '',
      classType: '',
      originalPrice: 0,
      sellingPrice: 0,
      notes: '',
      deliveryType: 'ONLINE_PAYMENT',
    },
    mode: 'onChange',
  })

  const watchTransportType = form.watch('transportType')
  const watchClassType = form.watch('classType')
  const watchDeliveryType = form.watch('deliveryType')

  const getClassOptions = () => {
    switch (watchTransportType) {
      case 'BUS': return busClasses
      case 'TRAIN': return trainClasses
      case 'LAUNCH': return launchClasses
      case 'AIR': return airClasses
      default: return []
    }
  }

  const showSleeperPosition = watchTransportType === 'BUS' && watchClassType === 'SLEEPER'

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }
      setTicketImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: any) => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to sell tickets',
        variant: 'destructive',
      })
      router.push('/user/login')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })
      if (ticketImage) {
        formData.append('ticketImage', ticketImage)
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Ticket listed successfully. It will be reviewed by admin.',
        })
        router.push('/user/listings')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to list ticket',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: string[] = []
    
    switch (step) {
      case 1:
        fieldsToValidate = ['transportType']
        break
      case 2:
        fieldsToValidate = ['transportCompany', 'pnrNumber']
        break
      case 3:
        fieldsToValidate = ['fromCity', 'toCity', 'travelDate', 'departureTime']
        break
      case 4:
        fieldsToValidate = ['seatNumber', 'classType']
        break
      case 5:
        fieldsToValidate = ['originalPrice', 'sellingPrice']
        break
      case 6:
        // Image is optional, proceed
        break
      case 7:
        fieldsToValidate = ['deliveryType']
        break
    }

    const isValid = await form.trigger(fieldsToValidate as any)
    if (isValid) {
      if (step === 7) {
        form.handleSubmit(onSubmit)()
      } else {
        setStep(step + 1)
      }
    }
  }

  const formatClassLabel = (cls: string) => {
    return cls.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please login to sell your tickets
              </p>
              <Button className="btn-primary" onClick={() => router.push('/user/login')}>
                Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">Sell Your Ticket</h1>
          <p className="text-muted-foreground">List your unused travel ticket for sale</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  s < step
                    ? 'bg-primary text-primary-foreground'
                    : s === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 7 && (
                <div
                  className={cn(
                    'w-8 h-1 mx-1',
                    s < step ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Transport Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Transport Type</CardTitle>
                      <CardDescription>What type of transport is your ticket for?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="transportType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-4">
                                {transportTypes.map((type) => {
                                  const Icon = type.icon
                                  const isSelected = field.value === type.value
                                  return (
                                    <button
                                      key={type.value}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(type.value)
                                        form.setValue('classType', '')
                                      }}
                                      className={cn(
                                        'p-4 rounded-xl border-2 transition-all text-center',
                                        isSelected
                                          ? 'border-primary bg-primary/10'
                                          : 'border-border hover:border-primary/50'
                                      )}
                                    >
                                      <div className={cn('w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white', type.color)}>
                                        <Icon className="w-6 h-6" />
                                      </div>
                                      <span className="font-medium">{type.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Transport Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Transport Details</CardTitle>
                      <CardDescription>Enter the transport company and PNR number</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="transportCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transport Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Green Line Paribahan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pnrNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PNR Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PNR number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Route & Travel */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Route & Travel Details</CardTitle>
                      <CardDescription>Where and when are you traveling?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fromCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-64">
                                  {BANGLADESH_DISTRICTS.map((district) => (
                                    <SelectItem key={district} value={district}>{district}</SelectItem>
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
                              <FormLabel>To</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-64">
                                  {BANGLADESH_DISTRICTS.map((district) => (
                                    <SelectItem key={district} value={district}>{district}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="travelDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Travel Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
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
                              <FormLabel>Departure Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Seat & Class */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Seat & Class</CardTitle>
                      <CardDescription>Select your seat number and class type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seat Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., A1, S-5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="classType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getClassOptions().map((cls) => (
                                  <SelectItem key={cls} value={cls}>
                                    {formatClassLabel(cls)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showSleeperPosition && (
                        <FormField
                          control={form.control}
                          name="sleeperPosition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleeper Position</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UPPER_DECK">Upper Deck</SelectItem>
                                  <SelectItem value="LOWER_DECK">Lower Deck</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 5: Pricing */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing</CardTitle>
                      <CardDescription>Set your selling price</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (BDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter original price"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
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
                                placeholder="Enter selling price"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any additional information about the ticket..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 6: Ticket Image */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Image</CardTitle>
                      <CardDescription>Upload an image or PDF of your ticket (max 5MB)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed rounded-xl p-8 text-center">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Ticket preview"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setTicketImage(null)
                                setImagePreview(null)
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                              Drag and drop or click to upload
                            </p>
                            <label>
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                              <Button type="button" variant="outline">
                                Choose File
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 7: Delivery Type */}
              {step === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Type</CardTitle>
                      <CardDescription>How will you deliver the ticket to the buyer?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="deliveryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 gap-4"
                              >
                                {[
                                  { value: 'ONLINE_PAYMENT', label: 'Online Payment', desc: 'Ticket delivered via email/WhatsApp' },
                                  { value: 'IN_PERSON', label: 'In Person', desc: 'Meet the buyer and exchange' },
                                  { value: 'COURIER', label: 'Courier', desc: 'Send ticket via courier service' },
                                ].map((option) => (
                                  <FormItem key={option.value}>
                                    <FormControl>
                                      <div
                                        className={cn(
                                          'p-4 rounded-xl border-2 cursor-pointer transition-all',
                                          field.value === option.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        )}
                                        onClick={() => field.onChange(option.value)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <RadioGroupItem value={option.value} />
                                          <div>
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchDeliveryType === 'IN_PERSON' && (
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter meeting location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {watchDeliveryType === 'COURIER' && (
                        <>
                          <FormField
                            control={form.control}
                            name="courierService"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Courier Service</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select courier" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {courierServices.map((service) => (
                                      <SelectItem key={service.value} value={service.value}>
                                        {service.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="courierFeePaidBy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Courier Fee Paid By</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select who pays" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="BUYER">Buyer</SelectItem>
                                    <SelectItem value="SELLER">Seller (You)</SelectItem>
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
                                <FormLabel>Courier Fee (BDT)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter courier fee"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                className={cn('btn-primary', step > 1 ? 'flex-1' : 'w-full')}
                onClick={nextStep}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : step === 7 ? (
                  'Submit Listing'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
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
