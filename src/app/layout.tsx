import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSEOSettings, getFullImageUrl } from "@/lib/seo";
import { getGeneralSettings } from "@/lib/general-settings";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bangla",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Generate dynamic metadata from database settings
export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSEOSettings();
  const generalSettings = await getGeneralSettings();
  const canonicalUrl = seoSettings.canonicalUrl.replace(/\/$/, '');
  
  // Use site name from general settings
  const siteName = generalSettings.siteName || 'EidTicketResell';
  
  // Get images - use metaImage as fallback for og/twitter if not set
  const metaImageUrl = seoSettings.metaImage ? getFullImageUrl(seoSettings.metaImage, canonicalUrl) : '';
  const ogImageUrl = seoSettings.ogImage ? getFullImageUrl(seoSettings.ogImage, canonicalUrl) : metaImageUrl;
  const twitterImageUrl = seoSettings.twitterImage ? getFullImageUrl(seoSettings.twitterImage, canonicalUrl) : ogImageUrl;

  return {
    title: {
      default: seoSettings.metaTitle,
      template: `%s | ${siteName}`,
    },
    description: seoSettings.metaDescription,
    keywords: seoSettings.metaKeywords.split(',').map(k => k.trim()),
    authors: [{ name: `${siteName} Team` }],
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title: seoSettings.ogTitle || seoSettings.metaTitle,
      description: seoSettings.ogDescription || seoSettings.metaDescription,
      url: canonicalUrl,
      siteName: siteName,
      type: "website",
      locale: "en_BD",
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seoSettings.ogTitle || seoSettings.metaTitle,
        },
      ] : undefined,
    },
    twitter: {
      card: seoSettings.twitterCard as 'summary' | 'summary_large_image',
      title: seoSettings.twitterTitle || seoSettings.metaTitle,
      description: seoSettings.twitterDescription || seoSettings.metaDescription,
      images: twitterImageUrl ? [twitterImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${hindSiliguri.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
