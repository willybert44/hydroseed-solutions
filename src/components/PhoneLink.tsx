"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function PhoneLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
        className={className}
      >
        {children}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-surface-glass backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-6 bg-surface-raised border border-border shadow-2xl rounded-3xl"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-3 text-text-primary">Phone Lines Updating</h3>
              <p className="text-text-secondary leading-relaxed mb-8">
                We&apos;re currently working on setting up a new phone system and our lines are temporarily unavailable. Please use our web inquiry process for now, and we&apos;ll get back to you promptly!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/get-seeded"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-3 bg-brand text-surface font-semibold rounded-xl hover:bg-brand-light transition-colors"
                >
                  Start Web Inquiry
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 border border-border text-text-primary font-medium rounded-xl hover:border-brand hover:text-brand transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
