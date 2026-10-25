"use client";

import { useEffect, useState } from "react";

export type AuthProfile = {
  sub?: string;
  name?: string;
  email?: string;
};

export function useAuthProfile() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/auth/profile", { cache: "no-store", credentials: "include" })
      .then((response) => (response.ok ? response.json() as Promise<AuthProfile> : null))
      .then((data) => {
        if (!cancelled) setProfile(data && typeof data.sub === "string" ? data : null);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading };
}
