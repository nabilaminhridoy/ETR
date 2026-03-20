'use client'

import { motion } from 'framer-motion'
import {
  Ticket, Wallet, Users, TrendingUp, ArrowUpRight, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 6890 },
  { name: 'Sat', sales: 4390 },
  { name: 'Sun', sales: 8490 },
]

const transportData = [
  { name: 'Bus', value: 45, color: '#3b82f6' },
  { name: 'Train', value: 30, color: '#8b5cf6' },
  { name: 'Launch', value: 15, color: '#06b6d4' },
  { name: 'Air', value: 10, color: '#f59e0b' },
]

const routeData = [
  { route: 'Dhaka → Chittagong', tickets: 45 },
  { route: 'Dhaka → Sylhet', tickets: 32 },
  { route: 'Dhaka → Barisal', tickets: 28 },
  { route: "Dhaka → Cox's Bazar", tickets: 15 },
  { route: 'Chittagong → Dhaka', tickets: 38 },
]

const recentTickets = [
  { id: '1', fromCity: 'Dhaka', toCity: 'Chittagong', transportCompany: 'Green Line', sellingPrice: 1000, status: 'APPROVED' },
  { id: '2', fromCity: 'Dhaka', toCity: 'Sylhet', transportCompany: 'Bangladesh Railway', sellingPrice: 750, status: 'PENDING' },
  { id: '3', fromCity: 'Dhaka', toCity: 'Barisal', transportCompany: 'Sundarban Launch', sellingPrice: 500, status: 'PENDING' },
]

const recentPurchases = [
  { id: '1', invoiceNumber: 'ETR-ABC123', totalAmount: 1010, status: 'COMPLETED', createdAt: '2025-01-10' },
  { id: '2', invoiceNumber: 'ETR-DEF456', totalAmount: 760, status: 'PENDING', createdAt: '2025-01-12' },
]

export default function AdminDashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to admin panel</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Sales', value: '৳245,000', change: '+12.5%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Platform Fees', value: '৳2,450', change: '+8.2%', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Total Tickets', value: '156', change: '+15.3%', icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Active Users', value: '1,250', change: '+5.1%', icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm text-green-500">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Verified Sellers', value: 89, icon: CheckCircle2, color: 'text-green-500' },
          { title: 'Pending Tickets', value: 12, icon: Clock, color: 'text-amber-500' },
          { title: 'Pending Payouts', value: 5, icon: Wallet, color: 'text-blue-500' },
          { title: 'Open Reports', value: 3, icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Weekly Sales</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="sales" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Sales by Transport Type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={transportData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {transportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {transportData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Popular Routes */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Popular Routes</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="route" stroke="#64748b" fontSize={10} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="tickets" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Tickets</CardTitle>
            <a href="/admin/tickets" className="text-sm text-primary hover:underline">View all</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{ticket.fromCity} → {ticket.toCity}</p>
                    <p className="text-xs text-muted-foreground">{ticket.transportCompany}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(ticket.sellingPrice)}</p>
                    <Badge variant={ticket.status === 'APPROVED' ? 'default' : 'secondary'} className="text-xs">
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Purchases</CardTitle>
            <a href="/admin/purchases" className="text-sm text-primary hover:underline">View all</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{purchase.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(purchase.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(purchase.totalAmount)}</p>
                    <Badge variant={purchase.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
