/**
 * Environment variable validation and type-safe access
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || "";
}

export const env = {
  // Clerk
  clerkPublishableKey: getEnvVar("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  clerkSecretKey: getEnvVar("CLERK_SECRET_KEY"),
  clerkSignInUrl: getEnvVar("NEXT_PUBLIC_CLERK_SIGN_IN_URL", "/sign-in"),
  clerkAfterSignInUrl: getEnvVar("NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL", "/"),
  
  // Database
  databaseUrl: getEnvVar("DATABASE_URL"),
  
  // App
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

