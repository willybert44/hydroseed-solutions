"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PhoneLink from "./PhoneLink";
import {
  Users,
  Droplets,
  Leaf,
  FileText,
  Sparkles,
  X,
  Menu,
  Home,
} from "lucide-react";

const navItems = [
  { label: "About", href: "/about", icon: Users },
  { label: "Services", href: "/services", icon: Droplets },
  { label: "Seed Blends", href: "/seed-blends", icon: Leaf },
  { label: "Blog", href: "/blog", icon: FileText },
];

const ctaItem = { label: "Get Seeded", href: "/get-seeded", icon: Sparkles };

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dockHover, setDockHover] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ─── Desktop Floating Dock ─── */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center"
        onMouseEnter={() => setDockHover(true)}
        onMouseLeave={() => setDockHover(false)}
      >
        <motion.div
          layout
          className="glass rounded-2xl flex items-center gap-2 px-3 py-3 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: scrolled ? 1 : 0.85,
            y: scrolled ? 0 : 8,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Left nav items */}
          {navItems.slice(0, 2).map((item) => (
            <DockItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              expanded={dockHover}
            />
          ))}

          {/* Center — Logo / Home */}
          <Link
            href="/"
            className="relative mx-3 w-12 h-12 rounded-xl bg-brand flex items-center justify-center hover:bg-brand-light transition-colors shrink-0"
          >
            <Home className="w-6 h-6 text-surface" />
            {pathname === "/" && (
              <motion.div
                layoutId="dock-indicator"
                className="absolute -bottom-2 w-1 h-1 rounded-full bg-brand"
              />
            )}
          </Link>

          {/* Right nav items */}
          {navItems.slice(2).map((item) => (
            <DockItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              expanded={dockHover}
            />
          ))}

          {/* CTA separator + button */}
          <div className="w-px h-8 bg-border-light mx-2" />
          <Link
            href={ctaItem.href}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
              pathname === ctaItem.href
                ? "bg-brand text-surface"
                : "bg-brand/10 text-brand hover:bg-brand hover:text-surface"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="whitespace-nowrap">{ctaItem.label}</span>
          </Link>
        </motion.div>
      </nav>

      {/* ─── Mobile: Floating Toggle ─── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 right-6 z-[60] md:hidden w-14 h-14 rounded-2xl glass flex items-center justify-center shadow-2xl"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {mobileOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5 text-text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="w-5 h-5 text-brand" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ─── Mobile: Full-screen Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden bg-surface/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Home link */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 mb-10"
              >
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                  <Home className="w-5 h-5 text-surface" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  HYDROSEED
                </span>
              </Link>
            </motion.div>

            {/* Nav items */}
            <div className="flex flex-col items-center gap-1">
              {[...navItems, ctaItem].map((item, i) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isCta = item.href === ctaItem.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08 * (i + 1) }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-4 px-8 py-4 rounded-2xl text-lg font-medium transition-colors ${
                        isCta
                          ? "mt-4 bg-brand text-surface"
                          : isActive
                          ? "text-brand"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact info at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-24 text-center"
            >
              <PhoneLink
                className="text-sm text-text-muted hover:text-brand transition-colors"
              >
                724-866-SEED
              </PhoneLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DockItem({
  item,
  active,
  expanded,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="relative group">
      <motion.div
        layout
        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors duration-200 ${
          active
            ? "bg-brand/15 text-brand"
            : "text-text-secondary hover:text-text-primary hover:bg-white/5"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {active && (
        <motion.div
          layoutId="dock-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
        />
      )}
    </Link>
  );
}
