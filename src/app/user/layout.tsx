'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Ticket, ShoppingBag, Wallet, FileText,
  Shield, User, LogOut, Menu, X, ChevronRight, Bell, Search,
  Settings, Home
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

const navItems = [
  { label: 'Dashboard', href: '/user', icon: LayoutDashboard },
  { label: 'My Listings', href: '/user/listings', icon: Ticket },
  { label: 'My Purchases', href: '/user/purchases', icon: ShoppingBag },
  { label: 'Wallet', href: '/user/wallet', icon: Wallet },
  { label: 'Transactions', href: '/user/transaction-history', icon: FileText },
  { label: 'ID Verification', href: '/user/id-verification', icon: Shield },
  { label: 'Profile', href: '/user/profile', icon: User },
]

// Pages that don't require authentication
const authPages = ['/user/login', '/user/register', '/user/forgot-password', '/user/logout']

// Helper function to check if path is active
const isPathActive = (href: string, pathname: string): boolean => {
  if (href === '/user') {
    return pathname === '/user'
  }
  return pathname.startsWith(href)
}

// Get page title from pathname
const getPageTitle = (pathname: string): string => {
  if (pathname === '/user') return 'Dashboard'
  const parts = pathname.split('/')
  const lastPart = parts[parts.length - 1]
  return lastPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const [hasHydrated, setHasHydrated] = useState(false)

  // Check hydration status
  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setHasHydrated(true)
      }
    }
    
    checkHydration()
    
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    return unsubscribe
  }, [])

  const isAuthPage = authPages.includes(pathname)

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !isAuthPage) {
      router.push('/user/login')
    }
  }, [hasHydrated, isAuthenticated, isAuthPage, router])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/')
  }, [logout, router])

  // Show loading only for protected pages while checking auth
  if (!hasHydrated || (!isAuthenticated && !isAuthPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // For auth pages (login, register), just render children without sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r fixed left-0 top-0 bottom-0 z-30 h-screen">
        {/* Logo */}
        <div className="h-16 flex-shrink-0 flex items-center justify-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="EidTicketResell"
              width={130}
              height={34}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = isPathActive(item.href, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.profileImage || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
                <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                  <Image
                    src="/logo.png"
                    alt="EidTicketResell"
                    width={100}
                    height={28}
                    className="h-6 w-auto"
                  />
                </Link>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <nav className="p-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = isPathActive(item.href, pathname)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    )
                  })}
                </nav>
              </ScrollArea>

              <div className="p-4 border-t flex-shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.profileImage || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
                {getPageTitle(pathname)}
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
                  <Input placeholder="Search tickets, transactions..." className="pl-10" />
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
                    <p className="text-sm font-medium">Welcome to your dashboard!</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
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
                      {user?.name?.charAt(0) || 'U'}
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
                  <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/wallet" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="w-4 h-4" />
                    Wallet
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
