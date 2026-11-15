import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond, Montserrat, Alex_Brush } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const alexBrush = Alex_Brush({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://phan-long-thuy-linh.vercel.app')),
  title: 'Thiệp Cưới Online — Phan Long & Thùy Linh | 24.12.2026',
  description: 'Trân trọng kính mời quý khách đến chung vui ngày hạnh phúc của Phan Long & Thùy Linh vào ngày 24 tháng 12 năm 2026.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Thiệp Cưới Online — Phan Long & Thùy Linh | 24.12.2026',
    description: 'Trân trọng kính mời quý khách đến chung vui ngày hạnh phúc của Phan Long & Thùy Linh vào ngày 24 tháng 12 năm 2026.',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/images/_DSC3551.jpg',
        width: 1280,
        height: 1920,
        alt: 'Thiệp Cưới Online Phan Long & Thùy Linh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thiệp Cưới Online — Phan Long & Thùy Linh | 24.12.2026',
    description: 'Trân trọng kính mời quý khách đến chung vui ngày hạnh phúc của Phan Long & Thùy Linh vào ngày 24 tháng 12 năm 2026.',
    images: ['/images/_DSC3551.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFDFB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable} ${alexBrush.variable} scroll-smooth`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-[#FFFDFB] text-stone-800 antialiased selection:bg-rose-100 selection:text-rose-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
