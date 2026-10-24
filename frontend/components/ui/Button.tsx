import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  "aria-label"?: string;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

interface ButtonAsButton extends BaseProps {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-800 text-cream-50 hover:bg-forest-700 shadow-card hover:shadow-cardHover",
  secondary:
    "bg-white text-forest-800 border border-forest-200 hover:bg-forest-50",
  ghost: "text-forest-800 hover:bg-forest-50",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const ariaLabel = rest["aria-label"];

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
