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
  title: 'Thiệp Cưới Online — Phan Anh & Ngọc Yến | 26.10.2026',
  description: 'Trân trọng kính mời quý khách đến dự lễ thành hôn của Phan Anh & Ngọc Yến vào ngày 26 tháng 10 năm 2026 tại Diamond Palace Grand Ballroom.',
  openGraph: {
    title: 'Thiệp Cưới Online — Phan Anh & Ngọc Yến',
    description: 'Trân trọng kính mời quý khách đến dự lễ thành hôn của Phan Anh & Ngọc Yến vào ngày 26 tháng 10 năm 2026.',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Phan Anh & Ngọc Yến Wedding Invitation',
      },
    ],
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
      <body className="bg-[#FFFDFB] text-stone-800 antialiased selection:bg-rose-100 selection:text-rose-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
