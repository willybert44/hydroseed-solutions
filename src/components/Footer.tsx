import Link from "next/link";
import Logo from "./Logo";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import PhoneLink from "./PhoneLink";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              Professional hydroseeding that&apos;s anything but ordinary.
              Pittsburgh-based. Earth-focused.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Services", href: "/services" },
                { label: "Seed Blends", href: "/seed-blends" },
                { label: "Service Areas", href: "/areas" },
                { label: "Blog", href: "/blog" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-secondary hover:text-brand transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialty */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-4">
              Specialty
            </h4>
            <ul className="space-y-3">
              {[
                { label: "New Lawn Installation", href: "/services/new-lawn-installation" },
                { label: "Finish Grading", href: "/services/finish-grading" },
                { label: "Mine Reclamation", href: "/services/mine-reclamation" },
                { label: "Slope Stabilization", href: "/services/slope-stabilization" },
                { label: "Erosion Control", href: "/services/erosion-control" },
                { label: "Heavy Highway", href: "/services/heavy-highway" },
                { label: "Solar Fields", href: "/services/solar-fields" },
                { label: "Stormwater", href: "/services/stormwater-projects" },
                { label: "Biotic Soil Media", href: "/services/biotic-soil-media" },
                { label: "Bonded Fiber Matrix", href: "/services/bonded-fiber-matrix" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-secondary hover:text-brand transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-4">
              Reach Out
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@hydroseed.solutions"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@hydroseed.solutions
                </a>
              </li>
              <li>
                <PhoneLink
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  412-866-SEED
                </PhoneLink>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-4">
              Ready?
            </h4>
            <Link
              href="/get-seeded"
              className="group inline-flex items-center gap-2 px-5 py-3 bg-brand text-surface font-semibold text-sm rounded-full hover:bg-brand-light transition-colors"
            >
              Get Seeded
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <p className="mt-3 text-xs text-text-muted">
              Instant project estimates. No BS.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Hydroseed Solutions. All rights
            reserved.
          </p>
          <p className="text-xs text-text-muted">Pittsburgh, PA</p>
        </div>
      </div>
    </footer>
  );
}
