import Link from "next/link";
import Logo from "@/components/ui/Logo";

const productLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who It's For", href: "#who-its-for" },
  { label: "Trust & Privacy", href: "#trust-privacy" },
];

const resourceLinks = [
  { label: "IRS.gov", href: "https://www.irs.gov" },
  { label: "PA Department of Revenue", href: "https://www.revenue.pa.gov" },
];

export default function Footer() {
  return (
    <footer className="border-t border-forest-100 bg-forest-950 text-cream-100">
      <div className="container-max section-pad py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="text-cream-50 [&_span]:text-cream-50" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
              Plain-English guidance to help you understand potentially
              relevant tax benefits, documents, and next steps. Built for
              students, new grads, employees, and freelancers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">Product</h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-forest-200 transition-colors hover:text-cream-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/assessment"
                  className="text-sm text-forest-200 transition-colors hover:text-cream-50"
                >
                  Start Assessment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">Official Resources</h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-forest-200 transition-colors hover:text-cream-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-forest-800 pt-8">
          <p className="text-xs leading-relaxed text-forest-300">
            <strong className="text-forest-100">Disclaimer:</strong> Tax Help
            provides general educational guidance to help you understand
            possible tax considerations, documents, and next steps. It is not
            a substitute for individualized advice from a qualified tax
            professional, and it does not guarantee eligibility for any
            credit, deduction, or refund. Always confirm your specific
            situation with the IRS, your state revenue department, or a
            licensed tax professional before filing.
          </p>
          <p className="mt-4 text-xs text-forest-400">
            © {new Date().getFullYear()} Tax Help. Built for a hackathon
            project — not an official government service.
          </p>
        </div>
      </div>
    </footer>
  );
}
