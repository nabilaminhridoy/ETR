'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Upload, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

function VerificationForm({ type }: { type: string }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (img: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast({
      title: 'Documents Submitted',
      description: 'Your documents are under review. This may take 24-48 hours.',
    })
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Front Side</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {frontImage ? (
              <div className="relative">
                <img src={frontImage} alt="Front" className="max-h-40 mx-auto rounded" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-0 right-0"
                  onClick={() => setFrontImage(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block py-8">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload front side</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setFrontImage)}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Back Side {type === 'passport' && '(Not required)'}</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {backImage ? (
              <div className="relative">
                <img src={backImage} alt="Back" className="max-h-40 mx-auto rounded" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-0 right-0"
                  onClick={() => setBackImage(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block py-8">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload back side</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setBackImage)}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
        <Shield className="w-4 h-4 text-amber-500" />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Your documents are encrypted and only used for verification purposes.
        </p>
      </div>

      <Button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={isLoading || !frontImage}
      >
        {isLoading ? 'Submitting...' : 'Submit for Verification'}
      </Button>
    </div>
  )
}

export default function IDVerificationPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'nid'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">ID Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to start selling tickets
        </p>
      </div>

      {/* Status Card */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-600 dark:text-amber-400">Verification Required</p>
            <p className="text-sm text-muted-foreground">
              Submit your ID to become a verified seller
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={tab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nid">NID</TabsTrigger>
          <TabsTrigger value="driving-license">Driving License</TabsTrigger>
          <TabsTrigger value="passport">Passport</TabsTrigger>
        </TabsList>

        <TabsContent value="nid" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">National ID Card</CardTitle>
              <CardDescription>
                Upload front and back side of your NID card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm type="nid" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driving-license" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Driving License</CardTitle>
              <CardDescription>
                Upload front and back side of your driving license
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm type="driving-license" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passport" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Passport</CardTitle>
              <CardDescription>
                Upload the front page of your passport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm type="passport" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
