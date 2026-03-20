import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// All valid routes in the application
const VALID_ROUTES = [
  '/',
  '/find-tickets',
  '/sell-tickets',
  '/how-it-works',
  '/safety-guidelines',
  '/about-us',
  '/contact-us',
  '/help',
  '/faqs',
  '/404',
  '/maintenance-mode',
  '/payment/success',
  '/payment/cancel',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/refund-policy',
  // User routes
  '/user/login',
  '/user/register',
  '/user/forgot-password',
  '/user',
  '/user/listings',
  '/user/purchases',
  '/user/wallet',
  '/user/transaction-history',
  '/user/id-verification',
  '/user/profile',
  // Admin routes
  '/admin/login',
  '/admin/logout',
  '/admin',
  '/admin/profile',
  '/admin/tickets',
  '/admin/users',
  '/admin/users/roles',
  '/admin/users/users',
  '/admin/transactions',
  '/admin/purchases',
  '/admin/payouts',
  '/admin/reports',
  '/admin/system-settings',
  '/admin/system-settings/general-settings',
  '/admin/system-settings/payment-methods',
  '/admin/system-settings/mail-settings',
  '/admin/system-settings/environment-settings',
  '/admin/system-settings/login-settings',
  '/admin/system-settings/logo-favicon',
  '/admin/system-settings/seo-settings',
  '/admin/system-settings/email-template',
  '/admin/system-settings/sms-settings',
  '/admin/system-settings/sms-template',
]

// Routes that have dynamic segments (check by prefix)
const DYNAMIC_ROUTE_PREFIXES = [
  '/find-tickets/', // /find-tickets/[id]
]

// Static file extensions to allow
const STATIC_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.css',
  '.js',
  '.json',
  '.xml',
  '.txt',
]

// Check if route is valid
function isValidRoute(pathname: string): boolean {
  // Check exact match
  if (VALID_ROUTES.includes(pathname)) {
    return true
  }

  // Check dynamic routes
  if (DYNAMIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return true
  }

  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static files
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next()
  }

  // Allow API routes and Next.js internal routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Check maintenance mode
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(`${baseUrl}/api/settings/environment`, {
      cache: 'no-store',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      
      // If maintenance mode is enabled, redirect to maintenance page
      if (data.maintenanceMode) {
        // Check if this is an admin user (has admin session cookie)
        const adminSession = request.cookies.get('admin_session')?.value
        
        if (!adminSession && pathname !== '/maintenance-mode') {
          const maintenanceUrl = new URL('/maintenance-mode', request.url)
          return NextResponse.rewrite(maintenanceUrl)
        }
      }
    }
  } catch (error) {
    // If we can't check maintenance mode, allow the request through
    console.error('Error checking maintenance mode:', error)
  }

  // Check if route is valid, if not redirect to 404
  if (!isValidRoute(pathname)) {
    const url404 = new URL('/404', request.url)
    return NextResponse.rewrite(url404)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
