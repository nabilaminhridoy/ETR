'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wallet, CreditCard, ArrowUpRight, History, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate } from '@/lib/utils'

const accountTypes = [
  { value: 'BKASH', label: 'bKash', color: 'bg-pink-500' },
  { value: 'NAGAD', label: 'Nagad', color: 'bg-orange-500' },
  { value: 'ROCKET', label: 'Rocket', color: 'bg-purple-500' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', color: 'bg-blue-500' },
]

export default function WalletPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'balance'
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    pendingBalance: 0,
  })
  const [accounts, setAccounts] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  const [withdrawForm, setWithdrawForm] = useState({
    accountType: '',
    amount: '',
  })

  const [newAccountForm, setNewAccountForm] = useState({
    accountType: 'BKASH',
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    routingNumber: '',
    swiftCode: '',
  })

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/user/wallet')
      if (response.ok) {
        const data = await response.json()
        setWallet(data.wallet || { availableBalance: 0, pendingBalance: 0 })
        setAccounts(data.accounts || [])
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawForm.accountType || !withdrawForm.amount) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      })
      return
    }

    const amount = parseFloat(withdrawForm.amount)
    if (amount < 100) {
      toast({
        title: 'Error',
        description: 'Minimum withdrawal amount is ৳100',
        variant: 'destructive',
      })
      return
    }

    if (amount > wallet.availableBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient balance',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawForm),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Withdrawal request submitted successfully',
        })
        setWithdrawForm({ accountType: '', amount: '' })
        fetchWalletData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit withdrawal request',
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

  const handleAddAccount = async () => {
    if (!newAccountForm.accountName || !newAccountForm.accountNumber) {
      toast({
        title: 'Error',
        description: 'Please fill required fields',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/wallet/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccountForm),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Account added successfully',
        })
        setNewAccountForm({
          accountType: 'BKASH',
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchName: '',
          routingNumber: '',
          swiftCode: '',
        })
        fetchWalletData()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add account',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Wallet</h1>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance" className="gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Balance</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="hidden sm:inline">Withdraw</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {formatPrice(wallet.availableBalance)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Balance</p>
                    <p className="text-3xl font-bold text-amber-500 mt-1">
                      {formatPrice(wallet.pendingBalance)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button className="btn-primary gap-2" onClick={() => document.querySelector('[value="withdraw"]')?.click()}>
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => document.querySelector('[value="history"]')?.click()}>
                <History className="w-4 h-4" />
                View History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Account</CardTitle>
              <CardDescription>Add payment account for withdrawals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    value={newAccountForm.accountType}
                    onValueChange={(value) => setNewAccountForm({ ...newAccountForm, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    placeholder="Account holder name"
                    value={newAccountForm.accountName}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, accountName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Account number"
                    value={newAccountForm.accountNumber}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, accountNumber: e.target.value })}
                  />
                </div>
              </div>

              {newAccountForm.accountType === 'BANK_TRANSFER' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="Bank name"
                      value={newAccountForm.bankName}
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      placeholder="Branch name"
                      value={newAccountForm.branchName}
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, branchName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Routing Number</Label>
                    <Input
                      placeholder="Routing number"
                      value={newAccountForm.routingNumber}
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, routingNumber: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Button className="btn-primary gap-2" onClick={handleAddAccount} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Account
              </Button>
            </CardContent>
          </Card>

          {/* Existing Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No accounts added yet</p>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => {
                    const type = accountTypes.find((t) => t.value === account.accountType)
                    return (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${type?.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {type?.label.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                          </div>
                        </div>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Withdrawal</CardTitle>
              <CardDescription>
                Available: {formatPrice(wallet.availableBalance)} • Min: ৳100
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Account</Label>
                  <Select
                    value={withdrawForm.accountType}
                    onValueChange={(value) => setWithdrawForm({ ...withdrawForm, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter((a) => a.isActive).map((account) => {
                        const type = accountTypes.find((t) => t.value === account.accountType)
                        return (
                          <SelectItem key={account.id} value={account.id}>
                            {type?.label} - {account.accountNumber}
                          </SelectItem>
                        )
                      })}
                      {accounts.filter((a) => a.isActive).length === 0 && (
                        <SelectItem value="no-accounts" disabled>
                          No active accounts
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (BDT)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    min="100"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <Button className="btn-primary gap-2" onClick={handleWithdraw} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                Submit Withdrawal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No withdrawal history</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{formatPrice(withdrawal.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          withdrawal.status === 'COMPLETED'
                            ? 'default'
                            : withdrawal.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// Add missing import
import { Clock } from 'lucide-react'
