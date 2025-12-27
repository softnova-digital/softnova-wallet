import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Softnova Digital"
              width={300}
              height={90}
              priority
              className="h-20 w-auto"
            />
          </div>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-card border border-border shadow-xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              formFieldLabel: "text-foreground",
              formFieldInput:
                "bg-background border-input text-foreground",
              footerActionLink: "hidden",
              footerAction: "hidden",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl={undefined}
        />
      </div>
   </div>
  );
}

