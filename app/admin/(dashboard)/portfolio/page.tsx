import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import { deletePortfolioItem } from "@/lib/actions/portfolio";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminPortfolioListPage() {
  const items = await db
    .select()
    .from(portfolioItems)
    .orderBy(desc(portfolioItems.year), asc(portfolioItems.sortOrder), asc(portfolioItems.id));

  return (
    <div>
      <AdminPageHeader
        title="Portfolio"
        description={`${items.length} item(s)`}
        action={<Link href="/admin/portfolio/new" className="adm-btn">+ New Portfolio Item</Link>}
      />
      {items.length === 0 ? (
        <AdminEmptyState label="No portfolio items yet." />
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 24 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <ResizableTh>Title</ResizableTh>
                <ResizableTh width={150}>Category</ResizableTh>
                <ResizableTh width={90}>Year</ResizableTh>
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.cat}</td>
                  <td>{item.year}</td>
                  <td>
                    <div className="adm-actions">
                      <Link href={`/admin/portfolio/${item.id}/edit`}>Edit</Link>
                      <form action={deletePortfolioItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton confirmText={`Delete "${item.title}"?`} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
