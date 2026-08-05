"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  // "reveal" is always present so the reduced-motion override in
  // globals.css applies from first paint regardless of this hook's
  // post-mount timing (see usePrefersReducedMotion.ts).
  const classes = className ? `reveal ${className}` : "reveal";

  // Reduced motion: skip the entrance animation and its IntersectionObserver
  // trigger entirely — content is already visible via the CSS override, so
  // there's nothing left for the animation to do but cost performance.
  if (reduceMotion) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
