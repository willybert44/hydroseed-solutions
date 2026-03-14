"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * Route order matches the navigation menu: Home → About → Services → Seed Blends → Blog → Get Seeded
 * Sub-routes inherit their parent's position (e.g. /services/mine-reclamation → services index).
 */
const ROUTE_ORDER = [
  "/",
  "/about",
  "/services",
  "/seed-blends",
  "/blog",
  "/areas",
  "/get-seeded",
  "/booking",
  "/privacy",
  "/terms",
];

function getRouteIndex(path: string): number {
  const exact = ROUTE_ORDER.indexOf(path);
  if (exact !== -1) return exact;
  for (let i = ROUTE_ORDER.length - 1; i >= 0; i--) {
    if (path.startsWith(ROUTE_ORDER[i] + "/") || path === ROUTE_ORDER[i]) {
      return i;
    }
  }
  return ROUTE_ORDER.length;
}

const SLIDE_DISTANCE = 80;

export default function PageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [direction, setDirection] = useState(0);

  // React-approved "adjust state during render" pattern
  if (prevPath !== pathname) {
    const d = getRouteIndex(pathname) >= getRouteIndex(prevPath) ? 1 : -1;
    setDirection(d);
    setPrevPath(pathname);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: direction * SLIDE_DISTANCE }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -SLIDE_DISTANCE }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
