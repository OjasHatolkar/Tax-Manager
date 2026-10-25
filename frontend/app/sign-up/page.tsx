import { redirect } from "next/navigation";

/** Start Auth0 Universal Login in its signup view and return new users to the assessment. */
export default function SignUpPage() {
  redirect("/auth/login?screen_hint=signup&returnTo=%2Fassessment");
}
