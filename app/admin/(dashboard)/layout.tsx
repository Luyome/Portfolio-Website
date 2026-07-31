import AdminSidebar from "@/components/admin/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-shell">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-wrap">{children}</div>
      </main>
    </div>
  );
}
