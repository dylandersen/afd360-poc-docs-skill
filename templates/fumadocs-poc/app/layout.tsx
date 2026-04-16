import { Provider } from './provider';
import './global.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    template: '__CUSTOMER_NAME__ Docs | __POC_NAME__ | %s',
    default: '__CUSTOMER_NAME__ Docs | __POC_NAME__',
  },
  description: '__CUSTOMER_NAME__ — __POC_NAME__ handoff documentation (__PRODUCT_AREA__).',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
