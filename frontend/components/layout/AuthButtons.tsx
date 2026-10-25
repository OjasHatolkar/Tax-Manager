"use client";

import Link from "next/link";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

type Props = {
  linkClassName?: string;
  labelClassName?: string;
};

export default function AuthButtons({
  linkClassName = "text-sm font-medium hover:underline",
  labelClassName = "text-sm",
}: Props) {
  const { profile, loading } = useAuthProfile();

  if (loading) return null;

  if (profile) {
    return (
      <>
        <span className={labelClassName}>{profile.name ?? profile.email ?? "Account"}</span>
        <Link href="/tasks" className={linkClassName}>My Tasks</Link>
        <a href="/auth/logout" className={linkClassName}>
          Sign out
        </a>
      </>
    );
  }

  return (
    <>
      <a href="/auth/login?returnTo=/assessment" className={linkClassName}>
        Sign in
      </a>
      <a href="/sign-up" className={linkClassName}>
        Create account
      </a>
    </>
  );
}
