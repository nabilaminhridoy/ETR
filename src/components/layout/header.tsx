'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Search, Plus, User, LogOut, Settings, 
  ChevronDown, Shield, Ticket, Wallet 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'

interface BrandingSettings {
  logo: string
  logoWidth: string
  logoHeight: string
}

const navItems = [
  { label: 'Find Tickets', href: '/find-tickets' },
  { label: 'Sell Tickets', href: '/sell-tickets' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Safety Guidelines', href: '/safety-guidelines' },
  { label: 'FAQs', href: '/faqs' },
]

const userNavItems = [
  { label: 'My Listings', href: '/user/listings', icon: Ticket },
  { label: 'My Purchases', href: '/user/purchases', icon: Ticket },
  { label: 'Wallet', href: '/user/wallet', icon: Wallet },
  { label: 'Profile', href: '/user/profile', icon: User },
  { label: 'ID Verification', href: '/user/id-verification', icon: Shield },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [branding, setBranding] = useState<BrandingSettings>({
    logo: '/logo.png',
    logoWidth: '150',
    logoHeight: '40',
  })
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Fetch branding settings
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/settings/branding')
        if (response.ok) {
          const data = await response.json()
          setBranding(data.settings)
        }
      } catch (error) {
        console.error('Error fetching branding:', error)
      }
    }
    fetchBranding()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src={branding.logo}
              alt="EidTicketResell"
              width={parseInt(branding.logoWidth) || 150}
              height={parseInt(branding.logoHeight) || 40}
              className="h-10 w-auto lg:h-12"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/sell-tickets">
                  <Button className="btn-primary gap-2">
                    <Plus className="w-4 h-4" />
                    Sell Ticket
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImage || ''} alt={user?.name || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline">{user?.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {user?.isVerified && (
                      <div className="px-2 py-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                          <Shield className="w-3 h-3" />
                          Verified Seller
                        </span>
                      </div>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {userNavItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/user/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/user/register">
                  <Button className="btn-primary">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* User Section */}
              {isAuthenticated ? (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.profileImage || ''} alt={user?.name || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  {user?.isVerified && (
                    <div className="px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Shield className="w-3 h-3" />
                        Verified Seller
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t flex gap-2">
                  <Link href="/user/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/user/register" className="flex-1">
                    <Button className="w-full btn-primary">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
