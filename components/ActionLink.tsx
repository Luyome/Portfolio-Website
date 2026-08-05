import Link from "next/link";
import type { ComponentProps } from "react";

type ActionLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "ghost";
};

/**
 * Shared `.hbtn` action link: the primary/ghost CTA styling repeated across
 * Home (hero buttons, contact CTA) and About (CV download). Renders on
 * `next/link` so internal and external hrefs (mailto:, download URLs) keep
 * working exactly as before — Link forwards unknown anchor props straight
 * through to the underlying `<a>`.
 */
export default function ActionLink({ variant = "primary", className, ...props }: ActionLinkProps) {
  const variantClass = variant === "primary" ? "hbtn-p" : "hbtn-g";
  return <Link className={["hbtn", variantClass, className].filter(Boolean).join(" ")} {...props} />;
}
