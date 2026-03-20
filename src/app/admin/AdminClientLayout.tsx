'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Ticket, ShoppingBag, Wallet, AlertTriangle,
  Users, FileText, Settings, User, LogOut, Menu, X,
  Bell, Search, Shield, Globe, Image as ImageIcon,
  Key, CreditCard, Mail, MailOpen, LucideIcon, ChevronRight, MessageSquare, Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'

// Navigation item type
interface NavItem {
  label: string
  href?: string
  icon: LucideIcon
  children?: { label: string; href: string; icon: LucideIcon }[]
}

// Sidebar navigation structure
const sidebarNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { label: 'Purchases', href: '/admin/purchases', icon: ShoppingBag },
  { label: 'Payouts', href: '/admin/payouts', icon: Wallet },
  { label: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  {
    label: 'Users',
    icon: Users,
    children: [
      { label: 'Users', href: '/admin/users/users', icon: Users },
      { label: 'Roles', href: '/admin/users/roles', icon: Shield },
    ]
  },
  { label: 'Transactions', href: '/admin/transactions', icon: FileText },
  {
    label: 'System Settings',
    icon: Settings,
    children: [
      { label: 'General Settings', href: '/admin/system-settings/general-settings', icon: Settings },
      { label: 'Environment Settings', href: '/admin/system-settings/environment-settings', icon: Globe },
      { label: 'Logo & Favicon', href: '/admin/system-settings/logo-favicon', icon: ImageIcon },
      { label: 'Login Settings', href: '/admin/system-settings/login-settings', icon: Key },
      { label: 'SEO Settings', href: '/admin/system-settings/seo-settings', icon: Search },
      { label: 'Payment Methods', href: '/admin/system-settings/payment-methods', icon: CreditCard },
      { label: 'Mail Settings', href: '/admin/system-settings/mail-settings', icon: Mail },
      { label: 'Email Template', href: '/admin/system-settings/email-template', icon: MailOpen },
      { label: 'SMS Settings', href: '/admin/system-settings/sms-settings', icon: MessageSquare },
      { label: 'SMS Template', href: '/admin/system-settings/sms-template', icon: Smartphone },
    ]
  },
]

// Pages that don't require authentication
const authPages = ['/admin/login', '/admin/logout']

// Helper function to check if path is active
const isPathActive = (href: string, pathname: string): boolean => {
  if (href === '/admin') {
    return pathname === '/admin'
  }
  return pathname.startsWith(href)
}

// Navigation Item Component - defined outside to avoid re-creation
interface NavItemComponentProps {
  item: NavItem
  pathname: string
  expandedSections: Record<string, boolean>
  onToggle: (label: string) => void
  onLinkClick?: () => void
}

function NavItemComponent({ item, pathname, expandedSections, onToggle, onLinkClick }: NavItemComponentProps) {
  // Item with children (expandable section)
  if (item.children) {
    const isExpanded = expandedSections[item.label] ?? false
    const isChildActive = item.children.some(child => isPathActive(child.href, pathname))
    
    return (
      <div className="space-y-1">
        <button
          onClick={() => onToggle(item.label)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isChildActive
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {item.label}
          </div>
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
        </button>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pl-4"
            >
              <div className="space-y-1 py-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isPathActive(child.href, pathname)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <child.icon className="w-4 h-4" />
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Item without children (direct link)
  return (
    <Link
      href={item.href!}
      onClick={onLinkClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isPathActive(item.href!, pathname)
          ? 'bg-primary text-primary-foreground'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      )}
    >
      <item.icon className="w-5 h-5" />
      {item.label}
    </Link>
  )
}

// Sidebar Navigation Component - defined outside to avoid re-creation
interface SidebarNavProps {
  pathname: string
  expandedSections: Record<string, boolean>
  onToggle: (label: string) => void
  onLinkClick?: () => void
}

function SidebarNav({ pathname, expandedSections, onToggle, onLinkClick }: SidebarNavProps) {
  return (
    <nav className="p-3 space-y-1">
      {sidebarNavItems.map((item) => (
        <NavItemComponent
          key={item.label}
          item={item}
          pathname={pathname}
          expandedSections={expandedSections}
          onToggle={onToggle}
          onLinkClick={onLinkClick}
        />
      ))}
    </nav>
  )
}

// Calculate initial expanded sections based on path
function getInitialExpandedSections(pathname: string): Record<string, boolean> {
  const sections: Record<string, boolean> = {}
  if (pathname.startsWith('/admin/users')) {
    sections['Users'] = true
  }
  if (pathname.startsWith('/admin/system-settings')) {
    sections['System Settings'] = true
  }
  return sections
}

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const [hasHydrated, setHasHydrated] = useState(false)

  // Initialize expanded sections based on current path
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => 
    getInitialExpandedSections(pathname)
  )

  // Check hydration status
  useEffect(() => {
    // Subscribe to hydration finish
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setHasHydrated(true)
      }
    }
    
    // Check immediately
    checkHydration()
    
    // Also subscribe to future hydration
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    return unsubscribe
  }, [])

  const isAuthPage = authPages.includes(pathname)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !isAuthPage) {
      router.push('/admin/login')
    }
  }, [hasHydrated, isAuthenticated, isAuthPage, router])

  // Toggle section expansion
  const toggleSection = useCallback((label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Show loading for protected pages (during hydration)
  if (!hasHydrated || (!isAuthenticated && !isAuthPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // For auth pages, just render children
  if (isAuthPage) {
    return <>{children}</>
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don&apos;t have admin privileges.</p>
          <Button onClick={handleLogout}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r fixed left-0 top-0 bottom-0 z-30 h-screen">
        {/* Logo */}
        <div className="h-16 flex-shrink-0 flex items-center justify-center border-b px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="EidTicketResell"
              width={130}
              height={34}
              className="h-8 w-auto"
            />
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <SidebarNav 
              pathname={pathname}
              expandedSections={expandedSections}
              onToggle={toggleSection}
            />
          </ScrollArea>
        </div>

        {/* User Info */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.profileImage || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={closeMobileMenu}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl flex flex-col h-screen"
            >
              <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b">
                <Link href="/admin" className="flex items-center gap-2" onClick={closeMobileMenu}>
                  <Image
                    src="/logo.png"
                    alt="EidTicketResell"
                    width={100}
                    height={28}
                    className="h-6 w-auto"
                  />
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                </Link>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <SidebarNav 
                    pathname={pathname}
                    expandedSections={expandedSections}
                    onToggle={toggleSection}
                    onLinkClick={closeMobileMenu}
                  />
                </ScrollArea>
              </div>

              <div className="p-4 border-t flex-shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.profileImage || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileMenu}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500">
                  <Search className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search tickets, users, transactions..." className="pl-10" />
                </div>
              </DialogContent>
            </Dialog>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <p className="text-sm font-medium">New ticket submitted</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImage || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/system-settings/general-settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
