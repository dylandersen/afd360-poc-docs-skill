import { Provider } from './provider';
import './global.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { resolveTheme, themeCssVars } from '../lib/resolve-theme';
import siteConfig from '../site.config';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

// Resolved at build time — reads data/brand-snapshot.json + site.config.ts.
const theme = resolveTheme();
const cssVars = themeCssVars(theme);

export const metadata: Metadata = {
  title: {
    template: `${siteConfig.customer.name} Docs | ${siteConfig.poc.name} | %s`,
    default: `${siteConfig.customer.name} Docs | ${siteConfig.poc.name}`,
  },
  description: `${siteConfig.customer.name} — ${siteConfig.poc.name} handoff documentation (${siteConfig.poc.productArea}).`,
  icons: theme.faviconSrc
    ? { icon: theme.faviconSrc, apple: theme.faviconSrc }
    : undefined,
  openGraph: theme.ogHeroSrc
    ? {
        images: [{ url: theme.ogHeroSrc }],
      }
    : undefined,
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {cssVars ? <style dangerouslySetInnerHTML={{ __html: cssVars }} /> : null}
      </head>
      <body className="flex flex-col min-h-screen font-sans">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
