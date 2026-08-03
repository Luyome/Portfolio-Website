export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin panel always renders in its default (light) theme, independent of
  // whatever the visitor last toggled on the public site.
  return (
    <div className="theme-scope" data-theme="light">
      {children}
    </div>
  );
}
