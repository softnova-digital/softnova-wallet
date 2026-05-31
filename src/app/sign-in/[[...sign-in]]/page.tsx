import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    // Full-screen, safe-area-aware container.
    // On iOS PWA the status bar can overlap content — pt-safe-top ensures
    // the logo and form are never hidden behind the system chrome.
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4"
      style={{
        paddingTop: "env(safe-area-inset-top, 1rem)",
        paddingBottom: "env(safe-area-inset-bottom, 1rem)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Softnova Digital"
            width={240}
            height={72}
            priority
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Clerk widget — routing="path" is required for Next.js App Router */}
        <SignIn
          routing="path"
          path="/sign-in"
          // signUpUrl is intentionally undefined — single-tenant app
          signUpUrl={undefined}
          appearance={{
            elements: {
              // Match the app's dark theme
              card: "bg-card border border-border shadow-xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
              formFieldLabel: "text-foreground",
              formFieldInput:
                "bg-background border-input text-foreground focus:ring-2 focus:ring-primary/20",
              socialButtonsBlockButton:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
              // Hide sign-up link — no self-registration in this app
              footerActionLink: "hidden",
              footerAction: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
