import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMGAI - AI-Powered Image Editing Platform',
  description: 'Transform your images with advanced AI technology. Enhance, edit, and create stunning visuals in seconds.',
  keywords: 'AI image editing, image enhancement, text to image, photo editing, artificial intelligence',
  authors: [{ name: 'IMGAI Team' }],
  openGraph: {
    title: 'IMGAI - AI-Powered Image Editing Platform',
    description: 'Transform your images with advanced AI technology. Enhance, edit, and create stunning visuals in seconds.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMGAI - AI-Powered Image Editing Platform',
    description: 'Transform your images with advanced AI technology. Enhance, edit, and create stunning visuals in seconds.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}