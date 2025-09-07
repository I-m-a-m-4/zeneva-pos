import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/context/auth-context';

const jost = Jost({ subsets: ['latin'], variable: '--font-jost' });

const siteUrl = 'https://zeneva-pos.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Zeneva - Effortless POS & Inventory Control for Business Growth',
    template: '%s | Zeneva',
  },
  description:
    'Zeneva empowers SMEs with effortless POS & Inventory Management. Gain clear insights, streamline operations, and secure profits to grow your business. Explore affordable plans, including a free inventory tier.',
  keywords: [
    'Zeneva',
    'Zeneva POS',
    'Zeneva Inventory',
    'pos system',
    'inventory software',
    'sme growth tools',
    'business control software',
    'retail insights',
    'affordable pos',
    'free inventory management software',
    'business efficiency',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Zeneva: Effortless Control & Clear Insights for Business Growth',
    description:
      'Zeneva provides SMEs with intuitive POS and Inventory Management tools to streamline operations, gain valuable insights, and drive sustainable growth. Discover our powerful, affordable solutions.',
    siteName: 'Zeneva',
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: 'Zeneva POS and Inventory Management System Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zeneva: Grow Your Business with Effortless POS & Inventory Control',
    description:
      'Manage your SME with Zeneva’s smart POS and inventory tools. Gain clear insights, streamline operations, and focus on growth. Affordable plans available.',
    images: [`${siteUrl}/twitter-image-zeneva.png`],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }, // Optional: for legacy support
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zeneva Solutions',
    url: siteUrl,
    logo: `${siteUrl}/og-image-zeneva.png`,
    description:
      'Provider of Zeneva POS and Inventory Management software for businesses, focusing on effortless control, clear insights, and growth.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-010-ZENEVA',
      contactType: 'Customer Service',
      availableLanguage: ['English'],
    },
    sameAs: [],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zeneva',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Zeneva',
    applicationCategory: ['BusinessApplication', 'SalesSoftware', 'InventoryManagementSoftware'],
    operatingSystem: 'Web Browser, Progressive Web App (PWA for offline use)',
    description:
      'Zeneva is a comprehensive Point of Sale (POS) and Inventory Management software designed for SMEs. It helps streamline operations, manage stock efficiently, and provide clear insights for business growth.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'NGN',
      lowPrice: '0',
      highPrice: '250000',
      offerCount: '4',
      offers: [
        { '@type': 'Offer', name: 'Free Tier - Inventory Management Software', price: '0', priceCurrency: 'NGN' },
        { '@type': 'Offer', name: 'Pro Plan', price: '7500', priceCurrency: 'NGN', eligibleDuration: 'P1M' },
        { '@type': 'Offer', name: 'Lifetime Deal', price: '250000', priceCurrency: 'NGN' },
        { '@type': 'Offer', name: 'Enterprise Solution (Custom Pricing)' },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '185',
    },
    mainEntityOfPage: siteUrl,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#783ad5" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body className={jost.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}