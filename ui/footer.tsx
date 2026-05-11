import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-bold font-serif text-primary mb-4">
              Golf Heroes
            </h2>
            <p className="text-sm text-muted leading-relaxed max-w-sm">
              Turn your golf scores into monthly prize draws while supporting
              causes that matter. Play, win, and give back.
            </p>
            <p className="text-xs text-muted mt-6">
              © 2026 Golf Heroes. All rights reserved.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3 text-sm">
              {["How it Works", "Charities", "Prize Draws", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted hover:text-primary transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-muted hover:text-primary transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Social
            </h3>
            <div className="flex flex-col space-y-3 text-sm">
              {["Twitter", "LinkedIn", "GitHub", "YouTube"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-muted hover:text-primary transition"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">

          <div className="flex flex-wrap gap-6">
            <Link href="#" className="hover:text-primary transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition">
              Cookie Policy
            </Link>
          </div>

          <p>
            Built for golfers who want to win & give back ⛳
          </p>
        </div>
      </div>
    </footer>
  );
}