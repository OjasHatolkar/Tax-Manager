"use client";

import { useEffect, useState } from "react";

type Props = {
  linkClassName?: string;
  labelClassName?: string;
};

type User = { name?: string; email?: string };

export default function AuthButtons({
  linkClassName = "text-sm font-medium hover:underline",
  labelClassName = "text-sm",
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/auth/profile", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data && (data.email || data.name) ? data : null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <>
        <span className={labelClassName}>{user.name ?? user.email}</span>
        <a href="/auth/logout" className={linkClassName}>
          Sign out
        </a>
      </>
    );
  }

  return (
    <a href="/auth/login?returnTo=/assessment" className={linkClassName}>
      Sign in
    </a>
  );
}
