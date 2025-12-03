import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Redirect to sign-in since only company user is allowed
  redirect("/sign-in");
}

