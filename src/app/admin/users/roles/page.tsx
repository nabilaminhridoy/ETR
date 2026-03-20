'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Shield, Crown, UserPlus } from 'lucide-react'

const roles = [
  {
    name: 'Super Admin',
    description: 'Full system access including all settings and user management',
    permissions: ['All permissions', 'Manage admins', 'System settings', 'Delete any content'],
    userCount: 1,
    color: 'bg-purple-500',
  },
  {
    name: 'Admin',
    description: 'Manage tickets, users, payouts, and reports',
    permissions: ['Manage tickets', 'Verify users', 'Handle payouts', 'View reports'],
    userCount: 2,
    color: 'bg-blue-500',
  },
  {
    name: 'User',
    description: 'Standard user with buying and selling capabilities',
    permissions: ['Buy tickets', 'Sell tickets', 'Manage own profile', 'Wallet access'],
    userCount: 150,
    color: 'bg-slate-500',
  },
]

export default function RolesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Roles</h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center`}>
                    {role.name === 'Super Admin' ? (
                      <Crown className="w-5 h-5 text-white" />
                    ) : role.name === 'Admin' ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <Users className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{role.userCount} users</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <div>
                <p className="text-sm font-medium mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                View Users
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Role Management</h3>
              <p className="text-sm text-muted-foreground">
                Roles define what users can access and modify on the platform. Super Admins have full access,
                Admins can manage day-to-day operations, and Users have standard buying/selling capabilities.
                Contact a Super Admin to request role changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
