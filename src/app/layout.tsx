import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'JSCT - Jan Sewa Charitable Trust | P2P Mutual Welfare Aid Platform',
  description:
    'JSCT (Jan Sewa Charitable Trust / जन सेवा चैरिटेबल ट्रस्ट) - जन से जन तक, सहयोग हर जरूरतमंद तक। Zero-custody peer-to-peer welfare solidarity platform for government and public sector families in Uttar Pradesh.',
  keywords: [
    'JSCT',
    'Jan Sewa Charitable Trust',
    'जन सेवा चैरिटेबल ट्रस्ट',
    'JSCT Uttar Pradesh Welfare',
    'P2P Welfare Aid',
    'UP Employees Welfare',
    '75% Compliance Engine',
    'Bereavement Aid',
    'Daughter Marriage Assistance',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF8F5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Martel:wght@400;600;700;800;900&family=Noto+Serif+Devanagari:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-charcoal selection:bg-terracotta-light selection:text-terracotta">
        <Navbar />
        <main className="flex-1 w-full pb-20 sm:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
