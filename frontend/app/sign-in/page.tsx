import { redirect } from "next/navigation";

// Keeps every existing link to /sign-in working by sending users to Auth0.
export default function SignInPage() {
  redirect("/auth/login?returnTo=/assessment");
}
