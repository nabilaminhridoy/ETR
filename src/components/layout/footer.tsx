'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Facebook, Instagram, Youtube, Mail, Phone, MapPin,
  Shield, Users, Clock, HeartHandshake, MessageCircle, Send
} from 'lucide-react'

interface GeneralSettings {
  siteName: string
  siteTagline: string
  business: {
    email: string
    phone: string
    streetAddress: string
    city: string
    country: string
    postalCode: string
  }
  support: {
    phone: string
    email: string
  }
  social: {
    facebook: string
    instagram: string
    whatsapp: string
    telegram: string
    youtube: string
  }
}

interface BrandingSettings {
  logo: string
  logoWidth: string
  logoHeight: string
}

const quickLinks = [
  { label: 'Find Tickets', href: '/find-tickets' },
  { label: 'Sell Tickets', href: '/sell-tickets' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Safety Guidelines', href: '/safety-guidelines' },
]

const supportLinks = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Help Center', href: '/help' },
]

const legalLinks = [
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

const trustFeatures = [
  { icon: Shield, label: 'Verified Sellers', description: 'All sellers ID verified' },
  { icon: Users, label: 'Secure Trading', description: 'Safe transactions' },
  { icon: Clock, label: '24/7 Support', description: 'Always here to help' },
  { icon: HeartHandshake, label: 'Trust Platform', description: 'Your safety matters' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<GeneralSettings | null>(null)
  const [branding, setBranding] = useState<BrandingSettings>({
    logo: '/logo.png',
    logoWidth: '150',
    logoHeight: '40',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch general settings
        const generalRes = await fetch('/api/settings/general')
        if (generalRes.ok) {
          const data = await generalRes.json()
          setSettings(data.settings)
        }

        // Fetch branding settings
        const brandingRes = await fetch('/api/settings/branding')
        if (brandingRes.ok) {
          const data = await brandingRes.json()
          setBranding(data.settings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Build social links from settings - Order: Facebook, Instagram, WhatsApp, Telegram, YouTube
  const socialLinks = [
    { icon: Facebook, href: settings?.social?.facebook || 'https://facebook.com', label: 'Facebook', show: !!settings?.social?.facebook },
    { icon: Instagram, href: settings?.social?.instagram || 'https://instagram.com', label: 'Instagram', show: !!settings?.social?.instagram },
    { icon: MessageCircle, href: settings?.social?.whatsapp ? `https://wa.me/${settings.social.whatsapp.replace(/[^0-9]/g, '')}` : '', label: 'WhatsApp', show: !!settings?.social?.whatsapp },
    { icon: Send, href: settings?.social?.telegram || '', label: 'Telegram', show: !!settings?.social?.telegram },
    { icon: Youtube, href: settings?.social?.youtube || 'https://youtube.com', label: 'YouTube', show: !!settings?.social?.youtube },
  ].filter(link => link.show)

  // Build location string
  const locationString = [settings?.business?.city, settings?.business?.country]
    .filter(Boolean)
    .join(', ') || 'Dhaka, Bangladesh'

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Trust Features */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{feature.label}</p>
                  <p className="text-xs text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src={branding.logo}
                alt={settings?.siteName || 'EidTicketResell'}
                width={parseInt(branding.logoWidth) || 150}
                height={parseInt(branding.logoHeight) || 40}
                className="h-10 w-auto"
                priority
                unoptimized
              />
            </Link>
            <p className="mt-4 text-sm text-slate-400 max-w-xs">
              {settings?.siteTagline || 'Buy & Sell Unused Eid Travel Tickets Safely. The most trusted platform for secure ticket trading in Bangladesh.'}
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              {(settings?.support?.email || settings?.business?.email) && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{settings.support?.email || settings.business?.email}</span>
                </div>
              )}
              {(settings?.support?.phone || settings?.business?.phone) && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{settings.support?.phone || settings.business?.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{locationString}</span>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} {settings?.siteName || 'EidTicketResell'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
