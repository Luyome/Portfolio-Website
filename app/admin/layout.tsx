import type { Metadata } from "next";

/**
 * Private-route indexing (Task 1.12). Covers every Admin route, including
 * login and the dashboard shell, at a single shared boundary — see
 * docs/07_TECHNICAL_ARCHITECTURE.md, section 13.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nosnippet: true,
    noarchive: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin panel always renders in its default (light) theme, independent of
  // whatever the visitor last toggled on the public site.
  return (
    <div className="theme-scope" data-theme="light">
      {children}
    </div>
  );
}
