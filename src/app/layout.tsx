import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import { cookies, headers } from 'next/headers';
import { LanguageProvider } from '@/i18n/LanguageContext';
import Script from "next/script";
import "./globals.css";

const splineSans = Spline_Sans({
  variable: "--font-spline",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Airdome® — Design your tent",
  description: "Custom tent configurator by Airdome",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const nextLocale = cookieStore.get('NEXT_LOCALE')?.value;
  let locale = 'en';

  if (nextLocale && ['en', 'nl', 'de'].includes(nextLocale)) {
    locale = nextLocale;
  } else {
    // Try to auto-detect from accept-language headers
    const headersList = await headers();
    const acceptLang = headersList.get('accept-language');
    if (acceptLang) {
      if (acceptLang.includes('nl')) {
        locale = 'nl';
      } else if (acceptLang.includes('de')) {
        locale = 'de';
      }
    }
  }

  return (
    <html lang={locale} className="h-full">
      <body
        className={`${splineSans.variable} font-spline min-h-screen antialiased`}
      >
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
        <Script 
          type="module" 
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
