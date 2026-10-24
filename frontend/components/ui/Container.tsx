import type { ReactNode } from "react";

/**
 * Consistent max-width + horizontal padding wrapper used across all
 * landing page sections so spacing stays aligned site-wide.
 */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`container-max section-pad ${className}`}>{children}</div>
  );
}
