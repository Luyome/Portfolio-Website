import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import { deletePortfolioItem } from "@/lib/actions/portfolio";
import DeleteButton from "@/components/admin/DeleteButton";
import ResizableTh from "@/components/admin/ResizableTh";

export default async function AdminPortfolioListPage() {
  const items = await db
    .select()
    .from(portfolioItems)
    .orderBy(desc(portfolioItems.year), asc(portfolioItems.sortOrder));

  return (
    <div>
      <div className="adm-title">Portfolio</div>
      <p className="adm-sub">{items.length} item(s)</p>
      <Link href="/admin/portfolio/new" className="adm-btn">+ New Portfolio Item</Link>
      <table className="adm-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <ResizableTh>Title</ResizableTh>
            <ResizableTh>Category</ResizableTh>
            <ResizableTh>Year</ResizableTh>
            <th>Actions</th>
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
  );
}
