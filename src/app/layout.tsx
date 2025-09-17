import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/context/auth-context';

const jost = Jost({ subsets: ['latin'], variable: '--font-jost' });

const siteUrl = 'https://zeneva-pos.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Zeneva - Effortless POS & Inventory Control for Business Growth',
    template: '%s | Zeneva',
  },
  description:
    'Zeneva empowers SMEs with effortless POS & Inventory Management. Gain clear insights, streamline operations, and secure profits to grow your business. Explore affordable plans, including a free inventory tier.',
  // ✅ This forces Next.js/Vercel to use your static favicon
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#783ad5" />
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
