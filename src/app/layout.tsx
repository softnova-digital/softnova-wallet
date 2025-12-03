import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Softnova Expenses | Expense Management",
    template: "%s | Softnova Expenses",
  },
  description: "Track and manage expenses, incomes, and budgets for Softnova Digital",
  keywords: ["expense management", "budget tracking", "finance", "Softnova Digital"],
  authors: [{ name: "Softnova Digital" }],
  creator: "Softnova Digital",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Softnova Expenses",
    title: "Softnova Expenses | Expense Management",
    description: "Track and manage expenses, incomes, and budgets for Softnova Digital",
  },
  robots: {
    index: false, // Private application - don't index
    follow: false,
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
      <html lang="en" className="dark">
        <body className={`${dmSans.variable} font-sans antialiased`}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
