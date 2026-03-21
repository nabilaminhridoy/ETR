'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Upload, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'
import Image from 'next/image'

interface LoginSettings {
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  phoneVerificationRequired: boolean
  otpDeliveryMethod: string // 'email' | 'sms' | 'both'
  passwordMinLength: string
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumber: boolean
  passwordRequireSpecial: boolean
  socialLoginEnabled: boolean
  googleLogin: boolean
  facebookLogin: boolean
}

const defaultLoginSettings: LoginSettings = {
  registrationEnabled: true,
  emailVerificationRequired: true,
  phoneVerificationRequired: true,
  otpDeliveryMethod: 'both',
  passwordMinLength: '8',
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  socialLoginEnabled: true,
  googleLogin: true,
  facebookLogin: false,
}

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuthStore()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [loginSettings, setLoginSettings] = useState<LoginSettings>(defaultLoginSettings)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)

  // Fetch login settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/login')
        if (response.ok) {
          const data = await response.json()
          setLoginSettings({ ...defaultLoginSettings, ...data.settings })
          
          // If registration is disabled, redirect to login
          if (data.settings.registrationEnabled === false) {
            toast({
              title: 'Registration Disabled',
              description: 'New user registration is currently disabled.',
              variant: 'destructive',
            })
            router.push('/user/login')
          }
        }
      } catch (error) {
        console.error('Error fetching login settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [router, toast])

  // Dynamic schema based on settings
  const createStepThreeSchema = (settings: LoginSettings) => {
    const minLength = parseInt(settings.passwordMinLength) || 8
    
    return z.object({
      password: z.string()
        .min(minLength, `Password must be at least ${minLength} characters`)
        .refine(
          (val) => !settings.passwordRequireUppercase || /[A-Z]/.test(val),
          'Password must contain at least one uppercase letter'
        )
        .refine(
          (val) => !settings.passwordRequireLowercase || /[a-z]/.test(val),
          'Password must contain at least one lowercase letter'
        )
        .refine(
          (val) => !settings.passwordRequireNumber || /[0-9]/.test(val),
          'Password must contain at least one number'
        )
        .refine(
          (val) => !settings.passwordRequireSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(val),
          'Password must contain at least one special character'
        ),
      confirmPassword: z.string(),
      profileImage: z.any().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    })
  }

  const stepOneSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  })

  const stepTwoSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
  })

  type StepOneValues = z.infer<typeof stepOneSchema>
  type StepTwoValues = z.infer<typeof stepTwoSchema>
  type StepThreeValues = z.infer<ReturnType<typeof createStepThreeSchema>>

  const stepOneForm = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  const stepTwoForm = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: { otp: '' },
  })

  const stepThreeForm = useForm<StepThreeValues>({
    resolver: zodResolver(createStepThreeSchema(loginSettings)),
    defaultValues: { password: '', confirmPassword: '', profileImage: null },
  })

  // Validate password against settings
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    const minLength = parseInt(loginSettings.passwordMinLength) || 8

    if (password.length < minLength) {
      errors.push(`At least ${minLength} characters`)
    }
    if (loginSettings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('One uppercase letter (A-Z)')
    }
    if (loginSettings.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('One lowercase letter (a-z)')
    }
    if (loginSettings.passwordRequireNumber && !/[0-9]/.test(password)) {
      errors.push('One number')
    }
    if (loginSettings.passwordRequireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character')
    }
    return errors
  }

  const handleStepOne = async (data: StepOneValues) => {
    setIsLoading(true)
    try {
      // Send OTP for email verification if required
      if (loginSettings.emailVerificationRequired) {
        const emailResponse = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, name: data.name, type: 'register', channel: 'email' }),
        })

        if (!emailResponse.ok) {
          const result = await emailResponse.json()
          toast({
            title: 'Error',
            description: result.error || 'Failed to send email OTP',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // Send OTP for phone verification if required
      if (loginSettings.phoneVerificationRequired) {
        const phoneResponse = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: data.phone, name: data.name, type: 'register', channel: 'sms' }),
        })

        if (!phoneResponse.ok) {
          const result = await phoneResponse.json()
          toast({
            title: 'Error',
            description: result.error || 'Failed to send SMS OTP',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      setEmail(data.email)
      setPhone(data.phone)
      setStep(2)
      
      const messages = []
      if (loginSettings.emailVerificationRequired) messages.push('email')
      if (loginSettings.phoneVerificationRequired) messages.push('phone')
      
      toast({
        title: 'OTP Sent',
        description: `Please check your ${messages.join(' and ')} for the verification code.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepTwo = async (data: StepTwoValues) => {
    setIsLoading(true)
    try {
      // Verify email OTP if required
      if (loginSettings.emailVerificationRequired && !emailVerified) {
        const emailResponse = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: data.otp, type: 'register' }),
        })

        if (emailResponse.ok) {
          setEmailVerified(true)
        } else {
          const result = await emailResponse.json()
          toast({
            title: 'Email Verification Failed',
            description: result.error || 'Invalid OTP for email',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // Verify phone OTP if required
      if (loginSettings.phoneVerificationRequired && !phoneVerified) {
        const phoneResponse = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp: data.otp, type: 'register' }),
        })

        if (phoneResponse.ok) {
          setPhoneVerified(true)
        } else {
          const result = await phoneResponse.json()
          toast({
            title: 'Phone Verification Failed',
            description: result.error || 'Invalid OTP for phone',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // Check if all required verifications are done
      const emailDone = !loginSettings.emailVerificationRequired || emailVerified
      const phoneDone = !loginSettings.phoneVerificationRequired || phoneVerified

      if (emailDone && phoneDone) {
        setStep(3)
        toast({
          title: 'Verified',
          description: 'Verification successful. Please set your password.',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepThree = async (data: StepThreeValues) => {
    const errors = validatePassword(data.password)
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', stepOneForm.getValues('name'))
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('password', data.password)
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage)
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        login(result.user, result.token)
        toast({
          title: 'Account Created',
          description: 'Welcome to EidTicketResell! Please complete your profile.',
        })
        router.push('/user/profile')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create account',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      stepThreeForm.setValue('profileImage', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Show loading state
  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Determine what needs verification based on otpDeliveryMethod and verification requirements
  const needsEmailVerification = loginSettings.emailVerificationRequired && 
    (loginSettings.otpDeliveryMethod === 'email' || loginSettings.otpDeliveryMethod === 'both')
  const needsPhoneVerification = loginSettings.phoneVerificationRequired && 
    (loginSettings.otpDeliveryMethod === 'sms' || loginSettings.otpDeliveryMethod === 'both')
  const verificationSteps = []
  if (needsEmailVerification) verificationSteps.push('email')
  if (needsPhoneVerification) verificationSteps.push('phone')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="EidTicketResell"
              width={150}
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              {step === 1 && 'Enter your details to get started'}
              {step === 2 && `Enter the OTP sent to your ${verificationSteps.join(' and ')}`}
              {step === 3 && 'Set your password and profile picture'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Form {...stepOneForm}>
                <form onSubmit={stepOneForm.handleSubmit(handleStepOne)} className="space-y-4">
                  <FormField
                    control={stepOneForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Enter your full name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepOneForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email {needsEmailVerification && '(will be verified)'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Enter your email" type="email" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepOneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number {needsPhoneVerification && '(will be verified)'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Enter your phone number" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <Form {...stepTwoForm}>
                <form onSubmit={stepTwoForm.handleSubmit(handleStepTwo)} className="space-y-4">
                  {/* Show verification status */}
                  <div className="space-y-2 mb-4">
                    {needsEmailVerification && (
                      <div className="flex items-center gap-2 p-2 rounded bg-muted">
                        {emailVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{email}</span>
                        {emailVerified && <span className="text-xs text-green-600 ml-auto">Verified</span>}
                      </div>
                    )}
                    {needsPhoneVerification && (
                      <div className="flex items-center gap-2 p-2 rounded bg-muted">
                        {phoneVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{phone}</span>
                        {phoneVerified && <span className="text-xs text-green-600 ml-auto">Verified</span>}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={stepTwoForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <InputOTPGroup className="gap-2 justify-center w-full">
                              {[0, 1, 2, 3, 4, 5].map((index) => (
                                <InputOTPSlot key={index} index={index} className="w-10 h-12" />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 btn-primary" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Password & Profile */}
            {step === 3 && (
              <Form {...stepThreeForm}>
                <form onSubmit={stepThreeForm.handleSubmit(handleStepThree)} className="space-y-4">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {profilePreview ? (
                          <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Profile picture (optional)</p>
                  </div>

                  {/* Password Requirements Info */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Password Requirements</AlertTitle>
                    <AlertDescription className="text-xs">
                      <ul className="list-disc list-inside space-y-0.5 mt-1">
                        <li>At least {loginSettings.passwordMinLength} characters</li>
                        {loginSettings.passwordRequireUppercase && <li>One uppercase letter (A-Z)</li>}
                        {loginSettings.passwordRequireLowercase && <li>One lowercase letter (a-z)</li>}
                        {loginSettings.passwordRequireNumber && <li>One number (0-9)</li>}
                        {loginSettings.passwordRequireSpecial && <li>One special character (!@#$%^&*)</li>}
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={stepThreeForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setPasswordErrors(validatePassword(e.target.value))
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        {passwordErrors.length > 0 && (
                          <ul className="text-xs text-destructive mt-1 space-y-0.5">
                            {passwordErrors.map((error, i) => (
                              <li key={i}>Missing: {error}</li>
                            ))}
                          </ul>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepThreeForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              className="pl-10 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 btn-primary" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link href="/user/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
