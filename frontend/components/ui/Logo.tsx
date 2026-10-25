import { Leaf } from "lucide-react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

/**
 * Reusable Taxpertise brand mark: a rounded forest-green badge with a leaf
 * (growth / clarity) paired with the wordmark. Keeping this as a single
 * component means the brand treatment stays consistent everywhere.
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-forest-800 text-cream-50 shadow-sm">
        <Leaf className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden="true" />
      </span>
      {!iconOnly && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-ink-900">
          Taxpertise
        </span>
      )}
    </span>
  );
}
