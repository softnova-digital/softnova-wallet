import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { PWARegister } from "@/components/pwa-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { NavigationProgress } from "@/components/navigation-progress";
import { OfflineIndicator } from "@/components/offline-indicator";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Optimize font loading
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: {
    default: "Softnova Wallet | Expense Management",
    template: "%s | Softnova Wallet",
  },
  description: "Track and manage expenses, incomes, and budgets for Softnova Digital",
  keywords: ["expense management", "budget tracking", "finance", "Softnova Digital", "PWA"],
  authors: [{ name: "Softnova Digital" }],
  creator: "Softnova Digital",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Softnova Wallet",
  },
  icons: {
    apple: "/icons/favicon-for-app/apple-icon.png",
    icon: "/icons/favicon-for-public/web-app-manifest-192x192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Softnova Wallet",
    title: "Softnova Wallet | Expense Management",
    description: "Track and manage expenses, incomes, and budgets for Softnova Digital",
  },
  robots: {
    index: false, // Private application - don't index
    follow: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signUpUrl={undefined}
      signUpFallbackRedirectUrl={undefined}
    >
      <ErrorBoundary>
        <ReactQueryProvider>
          <html lang="en" className="dark">
            <body className={`${dmSans.variable} font-sans antialiased`}>
              <NavigationProgress />
              <OfflineIndicator />
              {children}
              <Toaster richColors position="top-right" />
              <PWARegister />
              <PWAInstallPrompt />
            </body>
          </html>
        </ReactQueryProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}
