import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { services } from "@/db/schema";
import ServiceForm from "@/components/admin/ServiceForm";
import { updateService } from "@/lib/actions/services";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [[item], appearance] = await Promise.all([
    db.select().from(services).where(eq(services.id, Number(id))),
    getPageAppearance("home"),
  ]);
  if (!item) notFound();

  const updateWithId = updateService.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Service</div>
      <ServiceForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
