import type { Metadata } from 'next';
import localFont from 'next/font/local';

import '@/styles/globals.css';

import ThemeProvider from '@/components/ThemeProvider';

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter-var-latin.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevGraph — Interactive JSON Visualizer',
  description:
    'Visualize JSON data as interactive graphs. Convert formats, generate code, and explore complex data structures in real time.',
  keywords: [
    'JSON',
    'visualizer',
    'graph',
    'tree',
    'converter',
    'code generator',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
